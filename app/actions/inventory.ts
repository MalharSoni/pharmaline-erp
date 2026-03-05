'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { InventoryCategory, StockChangeType } from '@prisma/client'

export interface AddInventoryItemInput {
  itemCode: string
  name: string
  category: InventoryCategory
  currentStock: number
  unit: string
  reorderPoint: number
  supplierId?: string
}

export interface UpdateInventoryItemInput extends AddInventoryItemInput {
  id: string
}

export interface CSVInventoryRow {
  itemCode: string
  name: string
  category: string
  currentStock: string
  unit: string
  reorderPoint: string
  supplierId?: string
}

export async function getInventoryItems() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        supplier: true,
      },
      orderBy: {
        name: 'asc',
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

export async function addInventoryItem(input: AddInventoryItemInput) {
  try {
    // Check if item code already exists
    const existing = await prisma.inventoryItem.findUnique({
      where: { itemCode: input.itemCode },
    })

    if (existing) {
      return {
        success: false,
        error: 'Item code already exists',
      }
    }

    const item = await prisma.inventoryItem.create({
      data: {
        itemCode: input.itemCode,
        name: input.name,
        category: input.category,
        currentStock: input.currentStock,
        unit: input.unit,
        reorderPoint: input.reorderPoint,
        supplierId: input.supplierId || null,
        lastUpdated: new Date(),
      },
    })

    // Create stock history record
    await prisma.stockHistory.create({
      data: {
        inventoryItemId: item.id,
        changeType: StockChangeType.ADJUSTMENT,
        quantityBefore: 0,
        quantityAfter: input.currentStock,
        quantityChanged: input.currentStock,
        reason: 'Initial stock entry',
      },
    })

    revalidatePath('/inventory')

    return {
      success: true,
      data: item,
    }
  } catch (error) {
    console.error('Failed to add inventory item:', error)
    return {
      success: false,
      error: 'Failed to add inventory item',
    }
  }
}

export async function updateInventoryItem(input: UpdateInventoryItemInput) {
  try {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id: input.id },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Item not found',
      }
    }

    const item = await prisma.inventoryItem.update({
      where: { id: input.id },
      data: {
        itemCode: input.itemCode,
        name: input.name,
        category: input.category,
        currentStock: input.currentStock,
        unit: input.unit,
        reorderPoint: input.reorderPoint,
        supplierId: input.supplierId || null,
        lastUpdated: new Date(),
      },
    })

    // Create stock history if quantity changed
    if (existing.currentStock !== input.currentStock) {
      await prisma.stockHistory.create({
        data: {
          inventoryItemId: item.id,
          changeType: StockChangeType.ADJUSTMENT,
          quantityBefore: existing.currentStock,
          quantityAfter: input.currentStock,
          quantityChanged: input.currentStock - existing.currentStock,
          reason: 'Manual adjustment',
        },
      })
    }

    revalidatePath('/inventory')

    return {
      success: true,
      data: item,
    }
  } catch (error) {
    console.error('Failed to update inventory item:', error)
    return {
      success: false,
      error: 'Failed to update inventory item',
    }
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    // Check if item is used in any BOM
    const bomUsage = await prisma.bOMItem.findFirst({
      where: { inventoryItemId: id },
    })

    if (bomUsage) {
      return {
        success: false,
        error: 'Cannot delete item that is used in a BOM',
      }
    }

    await prisma.inventoryItem.delete({
      where: { id },
    })

    revalidatePath('/inventory')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Failed to delete inventory item:', error)
    return {
      success: false,
      error: 'Failed to delete inventory item',
    }
  }
}

export async function importInventoryCSV(
  rows: CSVInventoryRow[],
  duplicateHandling: 'skip' | 'update'
) {
  try {
    let created = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        // Validate category
        if (!['RAW_MATERIAL', 'PACKAGING_MATERIAL'].includes(row.category)) {
          errors.push(`Invalid category for ${row.itemCode}: ${row.category}`)
          continue
        }

        const category = row.category as InventoryCategory
        const currentStock = parseFloat(row.currentStock)
        const reorderPoint = parseFloat(row.reorderPoint)

        if (isNaN(currentStock) || isNaN(reorderPoint)) {
          errors.push(`Invalid numeric values for ${row.itemCode}`)
          continue
        }

        // Check if exists
        const existing = await prisma.inventoryItem.findUnique({
          where: { itemCode: row.itemCode },
        })

        if (existing) {
          if (duplicateHandling === 'skip') {
            skipped++
            continue
          } else {
            // Update
            await prisma.inventoryItem.update({
              where: { id: existing.id },
              data: {
                name: row.name,
                category,
                currentStock,
                unit: row.unit,
                reorderPoint,
                supplierId: row.supplierId || null,
                lastUpdated: new Date(),
              },
            })

            // Stock history
            if (existing.currentStock !== currentStock) {
              await prisma.stockHistory.create({
                data: {
                  inventoryItemId: existing.id,
                  changeType: StockChangeType.ADJUSTMENT,
                  quantityBefore: existing.currentStock,
                  quantityAfter: currentStock,
                  quantityChanged: currentStock - existing.currentStock,
                  reason: 'CSV import update',
                },
              })
            }

            updated++
          }
        } else {
          // Create new
          const newItem = await prisma.inventoryItem.create({
            data: {
              itemCode: row.itemCode,
              name: row.name,
              category,
              currentStock,
              unit: row.unit,
              reorderPoint,
              supplierId: row.supplierId || null,
              lastUpdated: new Date(),
            },
          })

          // Stock history
          await prisma.stockHistory.create({
            data: {
              inventoryItemId: newItem.id,
              changeType: StockChangeType.ADJUSTMENT,
              quantityBefore: 0,
              quantityAfter: currentStock,
              quantityChanged: currentStock,
              reason: 'CSV import',
            },
          })

          created++
        }
      } catch (rowError) {
        console.error(`Error processing row ${row.itemCode}:`, rowError)
        errors.push(`Failed to process ${row.itemCode}`)
      }
    }

    revalidatePath('/inventory')

    return {
      success: true,
      data: {
        created,
        updated,
        skipped,
        errors,
      },
    }
  } catch (error) {
    console.error('Failed to import CSV:', error)
    return {
      success: false,
      error: 'Failed to import CSV',
    }
  }
}

export async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: suppliers,
    }
  } catch (error) {
    console.error('Failed to fetch suppliers:', error)
    return {
      success: false,
      error: 'Failed to fetch suppliers',
    }
  }
}
