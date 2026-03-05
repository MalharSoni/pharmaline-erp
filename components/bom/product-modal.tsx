'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { createBOM, updateBOM, BOMItemInput } from '@/app/actions/bom'
import { toast } from 'sonner'

interface BOMItem {
  id: string
  inventoryItemId: string
  quantityRequired: number
  unit: string
  notes?: string | null
  inventoryItem: {
    id: string
    itemCode: string
    name: string
    unit: string
    currentStock: number
    category: string
  }
}

interface BOM {
  id: string
  productId: string
  version: string
  notes?: string | null
  isActive: boolean
  items: BOMItem[]
}

interface Product {
  id: string
  sku: string
  name: string
  description?: string | null
  unit: string
  isActive: boolean
  bom?: BOM | null
}

interface InventoryItem {
  id: string
  itemCode: string
  name: string
  unit: string
  currentStock: number
  category: string
}

interface ProductModalProps {
  open: boolean
  onClose: () => void
  inventoryItems: InventoryItem[]
  editingProduct?: Product | null
}

interface FormulaItem {
  inventoryItemId: string
  quantityRequired: string
  unit: string
}

export function ProductModal({
  open,
  onClose,
  inventoryItems,
  editingProduct,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState('1.0')
  const [notes, setNotes] = useState('')
  const [formulaItems, setFormulaItems] = useState<FormulaItem[]>([
    { inventoryItemId: '', quantityRequired: '', unit: '' },
  ])

  useEffect(() => {
    if (editingProduct?.bom) {
      setVersion(editingProduct.bom.version)
      setNotes(editingProduct.bom.notes || '')
      setFormulaItems(
        editingProduct.bom.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          quantityRequired: item.quantityRequired.toString(),
          unit: item.unit,
        }))
      )
    } else {
      setVersion('1.0')
      setNotes('')
      setFormulaItems([{ inventoryItemId: '', quantityRequired: '', unit: '' }])
    }
  }, [editingProduct])

  const addFormulaItem = () => {
    setFormulaItems([
      ...formulaItems,
      { inventoryItemId: '', quantityRequired: '', unit: '' },
    ])
  }

  const removeFormulaItem = (index: number) => {
    if (formulaItems.length > 1) {
      setFormulaItems(formulaItems.filter((_, i) => i !== index))
    }
  }

  const updateFormulaItem = (
    index: number,
    field: keyof FormulaItem,
    value: string
  ) => {
    const updated = [...formulaItems]
    updated[index] = { ...updated[index], [field]: value }

    // Auto-fill unit when material is selected
    if (field === 'inventoryItemId') {
      const item = inventoryItems.find((i) => i.id === value)
      if (item) {
        updated[index].unit = item.unit
      }
    }

    setFormulaItems(updated)
  }

  const handleSubmit = async () => {
    // Validation
    if (!editingProduct) {
      toast.error('No product selected')
      return
    }

    const validItems = formulaItems.filter(
      (item) => item.inventoryItemId && item.quantityRequired
    )

    if (validItems.length === 0) {
      toast.error('Please add at least one material')
      return
    }

    setLoading(true)
    try {
      const items: BOMItemInput[] = validItems.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantityRequired: parseFloat(item.quantityRequired),
        unit: item.unit,
      }))

      let result
      if (editingProduct.bom) {
        result = await updateBOM({
          id: editingProduct.bom.id,
          productId: editingProduct.id,
          version,
          notes: notes || undefined,
          items,
        })
      } else {
        result = await createBOM({
          productId: editingProduct.id,
          version,
          notes: notes || undefined,
          items,
        })
      }

      if (result.success) {
        toast.success(
          editingProduct.bom
            ? 'BOM updated successfully'
            : 'BOM created successfully'
        )
        handleClose()
      } else {
        toast.error(result.error || 'Failed to save BOM')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setVersion('1.0')
    setNotes('')
    setFormulaItems([{ inventoryItemId: '', quantityRequired: '', unit: '' }])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#171717]">
            {editingProduct?.bom ? 'Edit Product Formula' : 'Create Product Formula'}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            {editingProduct
              ? `Define the formula for ${editingProduct.name}`
              : 'Select a product and define its formula'}
          </DialogDescription>
        </DialogHeader>

        {editingProduct && (
          <div className="bg-[#F5F5F5] border border-[#D4D4D4] rounded-[10px] p-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  Product
                </p>
                <p className="text-[14px] font-bold text-[#171717]">
                  {editingProduct.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  SKU
                </p>
                <p className="text-[14px] font-semibold text-[#171717]">
                  {editingProduct.sku}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version" className="text-[13px] font-semibold text-[#171717]">
                Formula Version
              </Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0"
                className="text-[13px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-[13px] font-semibold text-[#171717]">
              Notes (Optional)
            </Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions or notes"
              className="text-[13px]"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[13px] font-semibold text-[#171717]">
                Formula Materials
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFormulaItem}
                className="text-[12px] font-semibold h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Material
              </Button>
            </div>

            <div className="space-y-2">
              {formulaItems.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end"
                >
                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-[11px] font-semibold text-[#737373]">
                        Material
                      </Label>
                    )}
                    <Select
                      value={item.inventoryItemId}
                      onValueChange={(value) =>
                        updateFormulaItem(index, 'inventoryItemId', value)
                      }
                    >
                      <SelectTrigger className="text-[13px]">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((invItem) => (
                          <SelectItem key={invItem.id} value={invItem.id}>
                            {invItem.itemCode} - {invItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-[11px] font-semibold text-[#737373]">
                        Qty per Unit
                      </Label>
                    )}
                    <Input
                      type="number"
                      step="0.01"
                      value={item.quantityRequired}
                      onChange={(e) =>
                        updateFormulaItem(index, 'quantityRequired', e.target.value)
                      }
                      placeholder="0"
                      className="text-[13px]"
                    />
                  </div>

                  <div className="space-y-1">
                    {index === 0 && (
                      <Label className="text-[11px] font-semibold text-[#737373]">
                        Unit
                      </Label>
                    )}
                    <Input
                      value={item.unit}
                      onChange={(e) =>
                        updateFormulaItem(index, 'unit', e.target.value)
                      }
                      placeholder="kg"
                      className="text-[13px]"
                      disabled
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFormulaItem(index)}
                    disabled={formulaItems.length === 1}
                    className="h-10 w-10 p-0 hover:bg-[#FEF2F2]"
                  >
                    <X className="w-4 h-4 text-[#DC2626]" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D4D4D4]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="text-[13px] font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#171717] text-white hover:opacity-88 font-semibold text-[13px]"
            >
              {loading
                ? 'Saving...'
                : editingProduct?.bom
                ? 'Update Formula'
                : 'Create Formula'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
