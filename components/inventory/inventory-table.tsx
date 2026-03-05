'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react'
import { AddItemModal } from './add-item-modal'
import { CSVImportModal } from './csv-import-modal'
import { deleteInventoryItem } from '@/app/actions/inventory'
import { toast } from 'sonner'

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

interface Supplier {
  id: string
  name: string
}

interface InventoryTableProps {
  items: InventoryItem[]
  suppliers: Supplier[]
}

export function InventoryTable({ items, suppliers }: InventoryTableProps) {
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [csvModalOpen, setCSVModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  const getStatusBadge = (currentStock: number, reorderPoint: number) => {
    if (currentStock === 0) {
      return (
        <Badge className="bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          Out of Stock
        </Badge>
      )
    } else if (currentStock <= reorderPoint) {
      return (
        <Badge className="bg-[#FFFBEB] text-[#D97706] border border-[#FCD34D] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          Low Stock
        </Badge>
      )
    } else if (currentStock > reorderPoint * 2) {
      return (
        <Badge className="bg-[#FFFBEB] text-[#D97706] border border-[#FCD34D] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          Overstocked
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          In Stock
        </Badge>
      )
    }
  }

  const getCategoryBadge = (category: string) => {
    if (category === 'RAW_MATERIAL') {
      return (
        <Badge className="bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          Raw Material
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
          Packaging
        </Badge>
      )
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setAddModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    const result = await deleteInventoryItem(id)
    if (result.success) {
      toast.success('Item deleted successfully')
    } else {
      toast.error(result.error || 'Failed to delete item')
    }
  }

  const handleModalClose = () => {
    setAddModalOpen(false)
    setEditingItem(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] text-[#737373]">
            {items.length} total items • {items.filter((i) => i.currentStock <= i.reorderPoint).length} need reordering
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            variant="outline"
            className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
            onClick={() => setCSVModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            className="bg-[#0F4C81] text-white hover:opacity-88 font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardContent className="p-0">
          <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      SKU
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Category
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Quantity
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Unit
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Reorder Point
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Supplier
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12 text-[#737373]">
                        No inventory items found. Add your first item to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                      >
                        <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                          {item.itemCode}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {item.name}
                        </TableCell>
                        <TableCell className="h-12">
                          {getCategoryBadge(item.category)}
                        </TableCell>
                        <TableCell className="text-right text-[13px] font-semibold text-[#171717] h-12">
                          {item.currentStock.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#737373] h-12">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-right text-[13px] text-[#737373] h-12">
                          {item.reorderPoint.toLocaleString()}
                        </TableCell>
                        <TableCell className="h-12">
                          {getStatusBadge(item.currentStock, item.reorderPoint)}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#737373] h-12">
                          {item.supplier?.name || '-'}
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-[#F5F5F5]"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-[#FEF2F2]"
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddItemModal
        open={addModalOpen}
        onClose={handleModalClose}
        suppliers={suppliers}
        editingItem={editingItem}
      />

      <CSVImportModal open={csvModalOpen} onClose={() => setCSVModalOpen(false)} />
    </>
  )
}
