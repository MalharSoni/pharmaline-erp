'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { POStatus } from '@prisma/client'

// Generate unique PO number
async function generatePONumber(): Promise<string> {
  const lastPO = await prisma.purchaseOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { poNumber: true }
  })

  if (!lastPO) {
    return 'PO-10001'
  }

  const lastNumber = parseInt(lastPO.poNumber.split('-')[1])
  return `PO-${lastNumber + 1}`
}

// Generate unique SO number
async function generateSONumber(): Promise<string> {
  const lastSO = await prisma.salesOrder.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { soNumber: true }
  })

  if (!lastSO) {
    return 'SO-10001'
  }

  const lastNumber = parseInt(lastSO.soNumber.split('-')[1])
  return `SO-${lastNumber + 1}`
}

// Generate unique MR number
async function generateMRNumber(): Promise<string> {
  const lastMR = await prisma.materialRequest.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { requestNumber: true }
  })

  if (!lastMR) {
    return 'MR-10001'
  }

  const lastNumber = parseInt(lastMR.requestNumber.split('-')[1])
  return `MR-${lastNumber + 1}`
}

export interface CreateOrderData {
  clientId: string
  productId: string
  quantity: number
  expectedDeliveryDate: Date
  totalAmount: number
  createdById: string
}

// Create new purchase order with full flow
export async function createOrder(data: CreateOrderData) {
  try {
    const poNumber = await generatePONumber()

    // Create Purchase Order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        clientId: data.clientId,
        productId: data.productId,
        quantity: data.quantity,
        expectedDeliveryDate: data.expectedDeliveryDate,
        status: POStatus.PO_RECEIVED,
        createdById: data.createdById,
      },
      include: {
        client: true,
        product: true,
      }
    })

    // Create Payment record (50/50 split)
    await prisma.payment.create({
      data: {
        purchaseOrderId: purchaseOrder.id,
        totalAmount: data.totalAmount,
        advanceAmount: data.totalAmount * 0.5,
        balanceAmount: data.totalAmount * 0.5,
        status: 'PENDING',
      }
    })

    // Create initial cycle time log
    await prisma.cycleTimeLog.create({
      data: {
        purchaseOrderId: purchaseOrder.id,
        stage: POStatus.PO_RECEIVED,
        enteredAt: new Date(),
      }
    })

    // Auto-create Sales Order
    const soNumber = await generateSONumber()
    const salesOrder = await prisma.salesOrder.create({
      data: {
        purchaseOrderId: purchaseOrder.id,
        soNumber,
        materialStatus: 'CHECKING',
      }
    })

    // Update PO status
    await prisma.purchaseOrder.update({
      where: { id: purchaseOrder.id },
      data: { status: POStatus.SO_CREATED }
    })

    // Log cycle time transition
    await prisma.cycleTimeLog.create({
      data: {
        purchaseOrderId: purchaseOrder.id,
        stage: POStatus.SO_CREATED,
        enteredAt: new Date(),
      }
    })

    // Check if product has BOM and extract materials
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: {
        bom: {
          include: {
            items: {
              include: {
                inventoryItem: true
              }
            }
          }
        }
      }
    })

    if (product?.bom) {
      // Create Material Request
      const mrNumber = await generateMRNumber()
      const materialRequest = await prisma.materialRequest.create({
        data: {
          salesOrderId: salesOrder.id,
          requestNumber: mrNumber,
          status: 'PENDING_APPROVAL',
        }
      })

      // Create Material Request Items from BOM
      const materialRequestItems = product.bom.items.map(bomItem => ({
        materialRequestId: materialRequest.id,
        inventoryItemId: bomItem.inventoryItemId,
        quantityRequested: bomItem.quantityRequired * data.quantity,
        unit: bomItem.unit,
      }))

      await prisma.materialRequestItem.createMany({
        data: materialRequestItems
      })

      // Check material availability
      const allAvailable = await checkMaterialAvailability(product.bom.items, data.quantity)

      await prisma.salesOrder.update({
        where: { id: salesOrder.id },
        data: {
          materialStatus: allAvailable ? 'ALL_AVAILABLE' : 'MISSING_MATERIALS'
        }
      })

      // Update PO status based on material availability
      await prisma.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: {
          status: allAvailable ? POStatus.READY_FOR_PRODUCTION : POStatus.AWAITING_MATERIALS
        }
      })
    }

    revalidatePath('/orders')

    return {
      success: true,
      data: {
        purchaseOrder,
        poNumber,
        soNumber
      }
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }
  }
}

// Check if materials are available
async function checkMaterialAvailability(bomItems: any[], orderQuantity: number): Promise<boolean> {
  for (const bomItem of bomItems) {
    const requiredQuantity = bomItem.quantityRequired * orderQuantity
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: bomItem.inventoryItemId }
    })

    if (!inventoryItem || inventoryItem.currentStock < requiredQuantity) {
      return false
    }
  }
  return true
}

// Get all orders with filters
export async function getOrders(statusFilter?: string, searchQuery?: string) {
  try {
    const where: any = {}

    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter as POStatus
    }

    if (searchQuery) {
      where.OR = [
        { poNumber: { contains: searchQuery, mode: 'insensitive' } },
        { client: { name: { contains: searchQuery, mode: 'insensitive' } } },
      ]
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        client: true,
        product: true,
        payment: true,
        salesOrder: {
          include: {
            materialRequest: {
              include: {
                items: {
                  include: {
                    inventoryItem: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }
  }
}

// Get single order with full details
export async function getOrderById(id: string) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        client: true,
        product: {
          include: {
            bom: {
              include: {
                items: {
                  include: {
                    inventoryItem: true
                  }
                }
              }
            }
          }
        },
        payment: true,
        createdBy: true,
        salesOrder: {
          include: {
            materialRequest: {
              include: {
                items: {
                  include: {
                    inventoryItem: true
                  }
                },
                approvedBy: true,
                fulfilledBy: true
              }
            },
            productionBatch: true
          }
        },
        cycleTimeLogs: {
          orderBy: { enteredAt: 'desc' }
        }
      }
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch order'
    }
  }
}

// Update order status
export async function updateOrderStatus(id: string, status: POStatus) {
  try {
    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    })

    // Log cycle time
    await prisma.cycleTimeLog.create({
      data: {
        purchaseOrderId: id,
        stage: status,
        enteredAt: new Date(),
      }
    })

    revalidatePath('/orders')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status'
    }
  }
}

// Delete order
export async function deleteOrder(id: string) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id }
    })

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete order'
    }
  }
}

// Get clients for dropdown
export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    return { success: true, data: clients }
  } catch (error) {
    return { success: false, error: 'Failed to fetch clients' }
  }
}

// Get products for dropdown
export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    return { success: true, data: products }
  } catch (error) {
    return { success: false, error: 'Failed to fetch products' }
  }
}
