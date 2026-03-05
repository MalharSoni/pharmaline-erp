'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { addInventoryItem, updateInventoryItem } from '@/app/actions/inventory'
import { toast } from 'sonner'
import { InventoryCategory } from '@prisma/client'

const itemSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['RAW_MATERIAL', 'PACKAGING_MATERIAL']),
  currentStock: z.number().min(0, 'Stock must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  reorderPoint: z.number().min(0, 'Reorder point must be positive'),
  supplierId: z.string().optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

interface Supplier {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  itemCode: string
  name: string
  category: string
  currentStock: number
  unit: string
  reorderPoint: number
  supplier?: {
    id: string
    name: string
  } | null
}

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  suppliers: Supplier[]
  editingItem?: InventoryItem | null
}

export function AddItemModal({
  open,
  onClose,
  suppliers,
  editingItem,
}: AddItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>('')
  const [supplier, setSupplier] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  })

  useEffect(() => {
    if (editingItem) {
      setValue('itemCode', editingItem.itemCode)
      setValue('name', editingItem.name)
      setValue('category', editingItem.category as InventoryCategory)
      setValue('currentStock', editingItem.currentStock)
      setValue('unit', editingItem.unit)
      setValue('reorderPoint', editingItem.reorderPoint)
      setValue('supplierId', editingItem.supplier?.id || '')
      setCategory(editingItem.category)
      setSupplier(editingItem.supplier?.id || '')
    } else {
      reset()
      setCategory('')
      setSupplier('')
    }
  }, [editingItem, setValue, reset])

  const onSubmit = async (data: ItemFormData) => {
    setLoading(true)
    try {
      const input = {
        ...data,
        category: category as InventoryCategory,
        supplierId: supplier || undefined,
      }

      let result
      if (editingItem) {
        result = await updateInventoryItem({ ...input, id: editingItem.id })
      } else {
        result = await addInventoryItem(input)
      }

      if (result.success) {
        toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully')
        reset()
        setCategory('')
        setSupplier('')
        onClose()
      } else {
        toast.error(result.error || 'Failed to save item')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setCategory('')
    setSupplier('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#171717]">
            {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            {editingItem
              ? 'Update the details of this inventory item.'
              : 'Add a new item to your inventory.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemCode" className="text-[13px] font-semibold text-[#171717]">
                Item Code / SKU
              </Label>
              <Input
                id="itemCode"
                placeholder="SKU-001"
                {...register('itemCode')}
                className="text-[13px]"
                disabled={!!editingItem}
              />
              {errors.itemCode && (
                <p className="text-[11px] text-[#DC2626]">{errors.itemCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[13px] font-semibold text-[#171717]">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  setCategory(value)
                  setValue('category', value as InventoryCategory)
                }}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                  <SelectItem value="PACKAGING_MATERIAL">Packaging Material</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-[11px] text-[#DC2626]">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-semibold text-[#171717]">
              Item Name
            </Label>
            <Input
              id="name"
              placeholder="Gelatin Powder"
              {...register('name')}
              className="text-[13px]"
            />
            {errors.name && (
              <p className="text-[11px] text-[#DC2626]">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock" className="text-[13px] font-semibold text-[#171717]">
                Current Stock
              </Label>
              <Input
                id="currentStock"
                type="number"
                step="0.01"
                placeholder="0"
                {...register('currentStock', { valueAsNumber: true })}
                className="text-[13px]"
              />
              {errors.currentStock && (
                <p className="text-[11px] text-[#DC2626]">{errors.currentStock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-[13px] font-semibold text-[#171717]">
                Unit
              </Label>
              <Input
                id="unit"
                placeholder="kg, liters, pieces"
                {...register('unit')}
                className="text-[13px]"
              />
              {errors.unit && (
                <p className="text-[11px] text-[#DC2626]">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorderPoint" className="text-[13px] font-semibold text-[#171717]">
              Reorder Point
            </Label>
            <Input
              id="reorderPoint"
              type="number"
              step="0.01"
              placeholder="10"
              {...register('reorderPoint', { valueAsNumber: true })}
              className="text-[13px]"
            />
            {errors.reorderPoint && (
              <p className="text-[11px] text-[#DC2626]">{errors.reorderPoint.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-[13px] font-semibold text-[#171717]">
              Supplier (Optional)
            </Label>
            <Select
              value={supplier}
              onValueChange={(value) => {
                setSupplier(value)
                setValue('supplierId', value)
              }}
            >
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No supplier</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4">
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
              type="submit"
              disabled={loading}
              className="bg-[#171717] text-white hover:opacity-88 font-semibold text-[13px]"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
