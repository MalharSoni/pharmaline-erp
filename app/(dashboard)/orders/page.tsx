"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NewOrderModal } from "@/components/orders/new-order-modal"
import { OrderDetailModal } from "@/components/orders/order-detail-modal"
import { getOrders } from "@/app/actions/orders"
import { Plus, Search, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Mock user ID - replace with actual auth
const CURRENT_USER_ID = "user_123"

const STATUS_FILTERS = [
  { value: "ALL", label: "All Orders" },
  { value: "PO_RECEIVED", label: "PO Received" },
  { value: "AWAITING_MATERIALS", label: "Awaiting Materials" },
  { value: "IN_PRODUCTION", label: "In Production" },
  { value: "READY_TO_DISPATCH", label: "Ready to Dispatch" },
  { value: "DISPATCHED", label: "Dispatched" },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [statusFilter, searchQuery])

  async function loadOrders() {
    setLoading(true)
    const result = await getOrders(
      statusFilter !== "ALL" ? statusFilter : undefined,
      searchQuery || undefined
    )
    setLoading(false)

    if (result.success) {
      setOrders(result.data || [])
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

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout
      title="Orders Management"
      action={
        <Button
          onClick={() => setNewOrderOpen(true)}
          className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Order
        </Button>
      }
    >
      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors duration-150",
                statusFilter === filter.value
                  ? "bg-[#0F4C81] text-white"
                  : "bg-white border border-[#D4D4D4] text-[#737373] hover:bg-[#F5F5F5]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
          <Input
            type="text"
            placeholder="Search by order # or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 text-[13px] border-[#D4D4D4]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-[#D4D4D4] rounded-[10px] bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F4C81]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[14px] font-semibold text-[#737373] mb-1">No orders found</p>
            <p className="text-[13px] text-[#A3A3A3] mb-4">
              {searchQuery ? "Try adjusting your search" : "Create your first order to get started"}
            </p>
            <Button
              onClick={() => setNewOrderOpen(true)}
              className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Order
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                  Order #
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                  Client
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                  Product
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                  Quantity
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                  Due Date
                </TableHead>
                <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const daysUntilDue = getDaysUntilDue(order.expectedDeliveryDate)
                const isOverdue = daysUntilDue < 0

                return (
                  <TableRow
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150 cursor-pointer"
                  >
                    <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                      {order.poNumber}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#171717] h-12">
                      {order.client.name}
                    </TableCell>
                    <TableCell className="text-[13px] text-[#171717] h-12">
                      <div>
                        <p className="font-medium">{order.product.name}</p>
                        <p className="text-[11.5px] text-[#737373]">SKU: {order.product.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px] text-[#171717] text-right h-12">
                      {order.quantity} {order.product.unit}
                    </TableCell>
                    <TableCell className="h-12">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="h-12">
                      <div>
                        <p className="text-[13px] text-[#171717]">
                          {format(new Date(order.expectedDeliveryDate), "MMM d, yyyy")}
                        </p>
                        <p className={cn(
                          "text-[11.5px] font-semibold",
                          isOverdue ? "text-[#DC2626]" : daysUntilDue <= 3 ? "text-[#F59E0B]" : "text-[#737373]"
                        )}>
                          {isOverdue
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : daysUntilDue === 0
                            ? "Due today"
                            : `${daysUntilDue} days left`
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right h-12">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrderId(order.id)
                        }}
                        className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5]"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Stats Summary */}
      {!loading && orders.length > 0 && (
        <div className="mt-5 flex items-center justify-between text-[13px] text-[#737373]">
          <p>
            Showing <span className="font-semibold text-[#171717]">{orders.length}</span> order{orders.length !== 1 ? 's' : ''}
          </p>
          <p>
            Total value: <span className="font-semibold text-[#171717]">
              ${orders.reduce((sum, order) => sum + (order.payment?.totalAmount || 0), 0).toFixed(2)}
            </span>
          </p>
        </div>
      )}

      {/* Modals */}
      <NewOrderModal
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        userId={CURRENT_USER_ID}
      />

      <OrderDetailModal
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null)
        }}
      />
    </DashboardLayout>
  )
}
