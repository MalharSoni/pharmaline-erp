"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrderById, deleteOrder } from "@/app/actions/orders"
import { toast } from "sonner"
import {
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"

interface OrderDetailModalProps {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailModal({ orderId, open, onOpenChange }: OrderDetailModalProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (open && orderId) {
      loadOrder()
    }
  }, [open, orderId])

  async function loadOrder() {
    if (!orderId) return

    setLoading(true)
    const result = await getOrderById(orderId)
    setLoading(false)

    if (result.success) {
      setOrder(result.data)
    } else {
      toast.error(result.error || "Failed to load order")
      onOpenChange(false)
    }
  }

  async function handleDelete() {
    if (!orderId) return
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      return
    }

    setDeleting(true)
    const result = await deleteOrder(orderId)
    setDeleting(false)

    if (result.success) {
      toast.success("Order deleted successfully")
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.error || "Failed to delete order")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      PO_RECEIVED: {
        label: "PO Received",
        className: "bg-[#F5F5F5] text-[#171717] border border-[#D4D4D4]"
      },
      SO_CREATED: {
        label: "SO Created",
        className: "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]"
      },
      AWAITING_MATERIALS: {
        label: "Awaiting Materials",
        className: "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]"
      },
      READY_FOR_PRODUCTION: {
        label: "Ready for Production",
        className: "bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]"
      },
      IN_PRODUCTION: {
        label: "In Production",
        className: "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]"
      },
      READY_TO_DISPATCH: {
        label: "Ready to Dispatch",
        className: "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
      },
      DISPATCHED: {
        label: "Dispatched",
        className: "bg-[#E8F5E9] text-[#15803D] border border-[#C8E6C9]"
      },
      OVERDUE: {
        label: "Overdue",
        className: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
      },
    }

    const config = variants[status] || variants.PO_RECEIVED
    return (
      <Badge className={`${config.className} text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1`}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentBadge = (paid: boolean) => {
    if (paid) {
      return (
        <div className="flex items-center gap-1.5 text-[#2E7D32]">
          <CheckCircle className="w-4 h-4" />
          <span className="text-[11.5px] font-semibold">Paid</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 text-[#DC2626]">
        <XCircle className="w-4 h-4" />
        <span className="text-[11.5px] font-semibold">Pending</span>
      </div>
    )
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!order) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-[18px] font-bold text-[#171717] mb-1">
                Order Details
              </DialogTitle>
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-[#737373]">
                  {order.poNumber}
                </span>
                {getStatusBadge(order.status)}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-[#DC2626] border-[#DC2626] hover:bg-[#FEF2F2] text-[13px]"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Order Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-[#737373]" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#737373]">
                  Client
                </span>
              </div>
              <p className="text-[14px] font-semibold text-[#171717]">{order.client.name}</p>
              {order.client.contactPerson && (
                <p className="text-[11.5px] text-[#737373] mt-0.5">{order.client.contactPerson}</p>
              )}
            </div>

            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-[#737373]" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#737373]">
                  Product
                </span>
              </div>
              <p className="text-[14px] font-semibold text-[#171717]">{order.product.name}</p>
              <p className="text-[11.5px] text-[#737373] mt-0.5">
                SKU: {order.product.sku} • Qty: {order.quantity} {order.product.unit}
              </p>
            </div>

            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[#737373]" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#737373]">
                  Due Date
                </span>
              </div>
              <p className="text-[14px] font-semibold text-[#171717]">
                {format(new Date(order.expectedDeliveryDate), "MMM d, yyyy")}
              </p>
              <p className="text-[11.5px] text-[#737373] mt-0.5">
                Created {format(new Date(order.createdAt), "MMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Payment Tracking */}
          {order.payment && (
            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-[#737373]" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Payment Status
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11.5px] text-[#737373] mb-1">Total Amount</p>
                  <p className="text-[18px] font-bold text-[#171717]">
                    ${order.payment.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-[11.5px] text-[#737373] mb-1">Advance (50%)</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-semibold text-[#171717]">
                      ${order.payment.advanceAmount.toFixed(2)}
                    </p>
                    {getPaymentBadge(!!order.payment.advanceDate)}
                  </div>
                </div>

                <div>
                  <p className="text-[11.5px] text-[#737373] mb-1">Balance (50%)</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-semibold text-[#171717]">
                      ${order.payment.balanceAmount.toFixed(2)}
                    </p>
                    {getPaymentBadge(!!order.payment.balanceDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOM Extraction */}
          {order.product.bom && (
            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Bill of Materials (BOM)
                </span>
                <Badge className="bg-[#F5F5F5] text-[#171717] border border-[#D4D4D4] text-[10px] font-bold uppercase px-2 py-0.5">
                  Version {order.product.bom.version}
                </Badge>
              </div>

              <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Material
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Code
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                        Per Unit
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                        Total Required
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.product.bom.items.map((item: any) => (
                      <TableRow key={item.id} className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {item.inventoryItem.name}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#737373] font-mono h-12">
                          {item.inventoryItem.itemCode}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#737373] text-right h-12">
                          {item.quantityRequired} {item.unit}
                        </TableCell>
                        <TableCell className="text-[13px] font-semibold text-[#171717] text-right h-12">
                          {(item.quantityRequired * order.quantity).toFixed(2)} {item.unit}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Material Request Status */}
          {order.salesOrder?.materialRequest && (
            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Material Request
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#737373]">
                    {order.salesOrder.materialRequest.requestNumber}
                  </span>
                  <Badge className="bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8] text-[10px] font-bold uppercase px-2 py-0.5">
                    {order.salesOrder.materialRequest.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {order.salesOrder.materialRequest.approvedAt && (
                <p className="text-[11.5px] text-[#737373]">
                  Approved {format(new Date(order.salesOrder.materialRequest.approvedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
          )}

          {/* Production Status */}
          {order.salesOrder?.productionBatch && (
            <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Production Batch
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#737373]">
                    {order.salesOrder.productionBatch.batchNumber}
                  </span>
                  <Badge className="bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8] text-[10px] font-bold uppercase px-2 py-0.5">
                    {order.salesOrder.productionBatch.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-[11.5px] text-[#737373] mb-0.5">Planned Quantity</p>
                  <p className="text-[14px] font-semibold text-[#171717]">
                    {order.salesOrder.productionBatch.plannedQuantity} {order.product.unit}
                  </p>
                </div>
                {order.salesOrder.productionBatch.actualQuantity && (
                  <div>
                    <p className="text-[11.5px] text-[#737373] mb-0.5">Actual Quantity</p>
                    <p className="text-[14px] font-semibold text-[#171717]">
                      {order.salesOrder.productionBatch.actualQuantity} {order.product.unit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
