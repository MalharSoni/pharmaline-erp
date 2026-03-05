'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface BOMItemInput {
  inventoryItemId: string
  quantityRequired: number
  unit: string
  notes?: string
}

export interface CreateBOMInput {
  productId: string
  version?: string
  notes?: string
  items: BOMItemInput[]
}

export interface UpdateBOMInput extends CreateBOMInput {
  id: string
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
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
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: products,
    }
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return {
      success: false,
      error: 'Failed to fetch products',
    }
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
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
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return {
      success: false,
      error: 'Failed to fetch product',
    }
  }
}

export async function createBOM(input: CreateBOMInput) {
  try {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Check if BOM already exists for this product
    const existing = await prisma.bOM.findUnique({
      where: { productId: input.productId },
    })

    if (existing) {
      return {
        success: false,
        error: 'BOM already exists for this product. Use update instead.',
      }
    }

    // Create BOM with items in a transaction
    const bom = await prisma.$transaction(async (tx) => {
      const newBOM = await tx.bOM.create({
        data: {
          productId: input.productId,
          version: input.version || '1.0',
          notes: input.notes,
          isActive: true,
        },
      })

      // Create BOM items
      const bomItems = await Promise.all(
        input.items.map((item) =>
          tx.bOMItem.create({
            data: {
              bomId: newBOM.id,
              inventoryItemId: item.inventoryItemId,
              quantityRequired: item.quantityRequired,
              unit: item.unit,
              notes: item.notes,
            },
          })
        )
      )

      return { ...newBOM, items: bomItems }
    })

    revalidatePath('/bom')

    return {
      success: true,
      data: bom,
    }
  } catch (error) {
    console.error('Failed to create BOM:', error)
    return {
      success: false,
      error: 'Failed to create BOM',
    }
  }
}

export async function updateBOM(input: UpdateBOMInput) {
  try {
    // Check if BOM exists
    const existing = await prisma.bOM.findUnique({
      where: { id: input.id },
      include: { items: true },
    })

    if (!existing) {
      return {
        success: false,
        error: 'BOM not found',
      }
    }

    // Update BOM with items in a transaction
    const bom = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.bOMItem.deleteMany({
        where: { bomId: input.id },
      })

      // Update BOM
      const updatedBOM = await tx.bOM.update({
        where: { id: input.id },
        data: {
          version: input.version || existing.version,
          notes: input.notes,
        },
      })

      // Create new items
      const bomItems = await Promise.all(
        input.items.map((item) =>
          tx.bOMItem.create({
            data: {
              bomId: input.id,
              inventoryItemId: item.inventoryItemId,
              quantityRequired: item.quantityRequired,
              unit: item.unit,
              notes: item.notes,
            },
          })
        )
      )

      return { ...updatedBOM, items: bomItems }
    })

    revalidatePath('/bom')

    return {
      success: true,
      data: bom,
    }
  } catch (error) {
    console.error('Failed to update BOM:', error)
    return {
      success: false,
      error: 'Failed to update BOM',
    }
  }
}

export async function deleteBOM(id: string) {
  try {
    // Check if BOM exists
    const existing = await prisma.bOM.findUnique({
      where: { id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'BOM not found',
      }
    }

    // Delete BOM (cascade will delete items)
    await prisma.bOM.delete({
      where: { id },
    })

    revalidatePath('/bom')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete BOM:', error)
    return {
      success: false,
      error: 'Failed to delete BOM',
    }
  }
}

export async function getInventoryItemsForBOM() {
  try {
    const items = await prisma.inventoryItem.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        itemCode: true,
        name: true,
        unit: true,
        currentStock: true,
        category: true,
      },
    })

    return {
      success: true,
      data: items,
    }
  } catch (error) {
    console.error('Failed to fetch inventory items:', error)
    return {
      success: false,
      error: 'Failed to fetch inventory items',
    }
  }
}

export async function calculateBOMCost(productId: string, quantity: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
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
    })

    if (!product || !product.bom) {
      return {
        success: false,
        error: 'Product or BOM not found',
      }
    }

    const materials = product.bom.items.map((item) => ({
      name: item.inventoryItem.name,
      itemCode: item.inventoryItem.itemCode,
      quantityPerUnit: item.quantityRequired,
      totalQuantity: item.quantityRequired * quantity,
      unit: item.unit,
      availableStock: item.inventoryItem.currentStock,
      sufficient: item.inventoryItem.currentStock >= item.quantityRequired * quantity,
    }))

    const allSufficient = materials.every((m) => m.sufficient)

    return {
      success: true,
      data: {
        materials,
        allSufficient,
      },
    }
  } catch (error) {
    console.error('Failed to calculate BOM cost:', error)
    return {
      success: false,
      error: 'Failed to calculate BOM cost',
    }
  }
}
