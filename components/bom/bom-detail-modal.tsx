'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calculator, AlertTriangle, CheckCircle } from 'lucide-react'

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

interface BOMDetailModalProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

export function BOMDetailModal({ open, onClose, product }: BOMDetailModalProps) {
  const [quantity, setQuantity] = useState<number>(100)

  if (!product || !product.bom) {
    return null
  }

  const calculateTotals = () => {
    return product.bom!.items.map((item) => {
      const totalRequired = item.quantityRequired * quantity
      const available = item.inventoryItem.currentStock
      const sufficient = available >= totalRequired

      return {
        ...item,
        totalRequired,
        available,
        sufficient,
      }
    })
  }

  const materials = calculateTotals()
  const allSufficient = materials.every((m) => m.sufficient)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-[#171717]">
            Bill of Materials - {product.name}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            Formula version {product.bom.version}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Product Info */}
          <div className="bg-[#F5F5F5] border border-[#D4D4D4] rounded-[10px] p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  Product Name
                </p>
                <p className="text-[14px] font-bold text-[#171717]">{product.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  SKU
                </p>
                <p className="text-[14px] font-semibold text-[#171717]">{product.sku}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  Unit
                </p>
                <p className="text-[14px] font-semibold text-[#171717]">{product.unit}</p>
              </div>
            </div>
            {product.bom.notes && (
              <div className="mt-3 pt-3 border-t border-[#D4D4D4]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-1">
                  Notes
                </p>
                <p className="text-[13px] text-[#171717]">{product.bom.notes}</p>
              </div>
            )}
          </div>

          {/* Calculator */}
          <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-[10px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-[#D97706]" />
              <h3 className="text-[14px] font-bold text-[#171717]">
                Production Calculator
              </h3>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="quantity" className="text-[13px] font-semibold text-[#171717]">
                  Quantity to Produce
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  className="text-[13px]"
                />
              </div>
              <div className="text-[13px] text-[#737373]">
                {product.unit}
              </div>
            </div>
          </div>

          {/* Materials Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[14px] font-bold text-[#171717]">
                Required Materials
              </h3>
              {allSufficient ? (
                <Badge className="bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                  All Materials Available
                </Badge>
              ) : (
                <Badge className="bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                  <AlertTriangle className="w-3 h-3 mr-1.5" />
                  Insufficient Stock
                </Badge>
              )}
            </div>

            <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Material Code
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Material Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Per Unit
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Total Needed
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Available
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow
                      key={material.id}
                      className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                    >
                      <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                        {material.inventoryItem.itemCode}
                      </TableCell>
                      <TableCell className="text-[13px] text-[#171717] h-12">
                        {material.inventoryItem.name}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-[#737373] h-12">
                        {material.quantityRequired.toLocaleString()} {material.unit}
                      </TableCell>
                      <TableCell className="text-right text-[13px] font-semibold text-[#171717] h-12">
                        {material.totalRequired.toLocaleString()} {material.unit}
                      </TableCell>
                      <TableCell className="text-right text-[13px] text-[#737373] h-12">
                        {material.available.toLocaleString()} {material.unit}
                      </TableCell>
                      <TableCell className="text-center h-12">
                        {material.sufficient ? (
                          <Badge className="bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                            OK
                          </Badge>
                        ) : (
                          <Badge className="bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                            Short {(material.totalRequired - material.available).toLocaleString()}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#D4D4D4]">
            <Button
              onClick={onClose}
              className="bg-[#171717] text-white hover:opacity-88 font-semibold text-[13px]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
