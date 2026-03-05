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
import { Plus, Pencil, Trash2, Package, Eye } from 'lucide-react'
import { ProductModal } from './product-modal'
import { BOMDetailModal } from './bom-detail-modal'
import { deleteBOM } from '@/app/actions/bom'
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

interface BOMTableProps {
  products: Product[]
  inventoryItems: InventoryItem[]
}

export function BOMTable({ products, inventoryItems }: BOMTableProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleView = (product: Product) => {
    setViewingProduct(product)
    setDetailModalOpen(true)
  }

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete BOM for "${productName}"?`)) {
      return
    }

    const result = await deleteBOM(id)
    if (result.success) {
      toast.success('BOM deleted successfully')
    } else {
      toast.error(result.error || 'Failed to delete BOM')
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingProduct(null)
  }

  const handleDetailModalClose = () => {
    setDetailModalOpen(false)
    setViewingProduct(null)
  }

  const calculateYieldPercent = (bom: BOM | null | undefined): number => {
    // Placeholder - would need actual production data
    return 92
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] text-[#737373]">
            {products.length} products • {products.filter((p) => p.bom).length} with formulas
          </p>
        </div>
        <Button
          className="bg-[#0F4C81] text-white hover:opacity-88 font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150"
          onClick={() => setModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Product Formula
        </Button>
      </div>

      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardContent className="p-0">
          <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Product SKU
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Product Name
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-center">
                      Formula
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-center">
                      Version
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-center">
                      Avg Yield
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-[#737373]">
                        No products found. Add your first product formula to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow
                        key={product.id}
                        className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                      >
                        <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                          {product.sku}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {product.name}
                        </TableCell>
                        <TableCell className="text-center h-12">
                          {product.bom ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Package className="w-4 h-4 text-[#737373]" />
                              <span className="text-[13px] font-semibold text-[#171717]">
                                {product.bom.items.length} materials
                              </span>
                            </div>
                          ) : (
                            <span className="text-[13px] text-[#A3A3A3]">No formula</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-[13px] text-[#737373] h-12">
                          {product.bom?.version || '-'}
                        </TableCell>
                        <TableCell className="text-center h-12">
                          {product.bom ? (
                            <span className="text-[13px] font-semibold text-[#171717]">
                              {calculateYieldPercent(product.bom)}%
                            </span>
                          ) : (
                            <span className="text-[13px] text-[#A3A3A3]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="h-12">
                          {product.bom ? (
                            <Badge className="bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-[#F5F5F5] text-[#737373] border border-[#D4D4D4] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1">
                              No Formula
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex items-center justify-end gap-1.5">
                            {product.bom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-[#F5F5F5]"
                                onClick={() => handleView(product)}
                              >
                                <Eye className="w-3.5 h-3.5 text-[#737373]" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-[#F5F5F5]"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                            </Button>
                            {product.bom && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-[#FEF2F2]"
                                onClick={() => handleDelete(product.bom!.id, product.name)}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              </Button>
                            )}
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

      <ProductModal
        open={modalOpen}
        onClose={handleModalClose}
        inventoryItems={inventoryItems}
        editingProduct={editingProduct}
      />

      <BOMDetailModal
        open={detailModalOpen}
        onClose={handleDetailModalClose}
        product={viewingProduct}
      />
    </>
  )
}
