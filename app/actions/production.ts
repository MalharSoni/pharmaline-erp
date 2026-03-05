"use server"

import { ProductionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface ProductionRunWithDetails {
  id: string
  salesOrderId: string
  productId: string
  batchNumber: string
  plannedQuantity: number
  actualQuantity: number | null
  yieldPercentage: number | null
  status: ProductionStatus
  scheduledStart: Date | null
  actualStart: Date | null
  scheduledEnd: Date | null
  actualEnd: Date | null
  product: {
    id: string
    name: string
    sku: string
    unit: string
  }
  salesOrder: {
    id: string
    purchaseOrderId: string
    purchaseOrder: {
      id: string
      poNumber: string
      quantity: number
    }
  }
}

// Get all production batches grouped by status
export async function getProductionBatches() {
  const batches = await prisma.productionBatch.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
        },
      },
      salesOrder: {
        select: {
          id: true,
          purchaseOrderId: true,
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              quantity: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return batches as ProductionRunWithDetails[]
}

// Get pending purchase orders (for scheduling)
export async function getPendingOrders() {
  const orders = await prisma.purchaseOrder.findMany({
    where: {
      status: {
        in: ["PO_RECEIVED", "SO_CREATED", "READY_FOR_PRODUCTION"],
      },
      salesOrder: {
        materialRequest: {
          status: "FULFILLED",
        },
      },
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
        },
      },
      salesOrder: true,
    },
    orderBy: {
      expectedDeliveryDate: "asc",
    },
  })

  return orders
}

// Schedule a new production run
export async function scheduleProduction(data: {
  salesOrderId: string
  productId: string
  plannedQuantity: number
  scheduledStart: Date
  scheduledEnd: Date
  createdById: string
}) {
  // Generate batch number
  const lastBatch = await prisma.productionBatch.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  })

  const batchNumber = lastBatch
    ? `BATCH-${(parseInt(lastBatch.batchNumber.split("-")[1]) + 1).toString().padStart(4, "0")}`
    : "BATCH-0001"

  const batch = await prisma.productionBatch.create({
    data: {
      salesOrderId: data.salesOrderId,
      productId: data.productId,
      batchNumber,
      plannedQuantity: data.plannedQuantity,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      status: "PLANNED",
      createdById: data.createdById,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
        },
      },
      salesOrder: {
        select: {
          id: true,
          purchaseOrderId: true,
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              quantity: true,
            },
          },
        },
      },
    },
  })

  // Update PO status
  await prisma.purchaseOrder.update({
    where: {
      id: batch.salesOrder.purchaseOrderId,
    },
    data: {
      status: "IN_PRODUCTION",
    },
  })

  revalidatePath("/production")
  return batch
}

// Update production batch status (drag and drop)
export async function updateProductionStatus(
  batchId: string,
  newStatus: ProductionStatus
) {
  const batch = await prisma.productionBatch.findUnique({
    where: { id: batchId },
    include: {
      salesOrder: {
        include: {
          purchaseOrder: true,
        },
      },
    },
  })

  if (!batch) {
    throw new Error("Batch not found")
  }

  const updates: Record<string, unknown> = {
    status: newStatus,
  }

  // Update timestamps based on status
  if (newStatus === "IN_PROGRESS" && !batch.actualStart) {
    updates.actualStart = new Date()
  }

  if (newStatus === "COMPLETED" && !batch.actualEnd) {
    updates.actualEnd = new Date()
  }

  const updatedBatch = await prisma.productionBatch.update({
    where: { id: batchId },
    data: updates,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
        },
      },
      salesOrder: {
        select: {
          id: true,
          purchaseOrderId: true,
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              quantity: true,
            },
          },
        },
      },
    },
  })

  revalidatePath("/production")
  return updatedBatch
}

// Get production batch details with materials
export async function getProductionBatchDetails(batchId: string) {
  const batch = await prisma.productionBatch.findUnique({
    where: { id: batchId },
    include: {
      product: {
        include: {
          bom: {
            include: {
              items: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      },
      salesOrder: {
        include: {
          purchaseOrder: {
            include: {
              client: true,
            },
          },
          materialRequest: {
            include: {
              items: {
                include: {
                  inventoryItem: true,
                },
              },
            },
          },
        },
      },
      materialReturns: {
        include: {
          inventoryItem: true,
        },
      },
    },
  })

  return batch
}

// Complete production with actual output
export async function completeProduction(data: {
  batchId: string
  actualQuantity: number
}) {
  const batch = await prisma.productionBatch.findUnique({
    where: { id: data.batchId },
    include: {
      salesOrder: {
        include: {
          purchaseOrder: true,
        },
      },
    },
  })

  if (!batch) {
    throw new Error("Batch not found")
  }

  // Calculate yield
  const yieldPercentage = (data.actualQuantity / batch.plannedQuantity) * 100

  const updatedBatch = await prisma.productionBatch.update({
    where: { id: data.batchId },
    data: {
      actualQuantity: data.actualQuantity,
      yieldPercentage,
      status: "COMPLETED",
      actualEnd: new Date(),
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          unit: true,
        },
      },
      salesOrder: {
        select: {
          id: true,
          purchaseOrderId: true,
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
              quantity: true,
            },
          },
        },
      },
    },
  })

  // Add to finished inventory
  await prisma.finishedInventory.create({
    data: {
      productId: batch.productId,
      quantity: data.actualQuantity,
      batchNumber: batch.batchNumber,
    },
  })

  // Update PO status
  await prisma.purchaseOrder.update({
    where: {
      id: batch.salesOrder.purchaseOrderId,
    },
    data: {
      status: "READY_TO_DISPATCH",
    },
  })

  revalidatePath("/production")
  return updatedBatch
}

// Record material return
export async function recordMaterialReturn(data: {
  productionBatchId: string
  inventoryItemId: string
  quantityReturned: number
  unit: string
}) {
  const materialReturn = await prisma.materialReturn.create({
    data: {
      productionBatchId: data.productionBatchId,
      inventoryItemId: data.inventoryItemId,
      quantityReturned: data.quantityReturned,
      unit: data.unit,
    },
  })

  // Update inventory stock
  await prisma.inventoryItem.update({
    where: { id: data.inventoryItemId },
    data: {
      currentStock: {
        increment: data.quantityReturned,
      },
    },
  })

  // Log stock change
  const item = await prisma.inventoryItem.findUnique({
    where: { id: data.inventoryItemId },
  })

  if (item) {
    await prisma.stockHistory.create({
      data: {
        inventoryItemId: data.inventoryItemId,
        changeType: "MATERIAL_RETURN",
        quantityBefore: item.currentStock - data.quantityReturned,
        quantityAfter: item.currentStock,
        quantityChanged: data.quantityReturned,
        reason: "Material returned from production",
        referenceId: data.productionBatchId,
      },
    })
  }

  revalidatePath("/production")
  return materialReturn
}
