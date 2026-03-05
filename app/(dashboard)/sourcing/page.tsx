"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PurchaseRequestModal } from "@/components/sourcing/purchase-request-modal"
import { getPurchaseRequests } from "@/app/actions/sourcing"
import type { PurchaseRequest, PurchaseRequestStatus } from "@/app/actions/sourcing"
import {
  Plus,
  Clock,
  CheckCircle,
  PackageCheck,
  ShoppingCart,
  XCircle,
  AlertTriangle,
} from "lucide-react"

export default function SourcingPage() {
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPurchaseRequests()
  }, [])

  const loadPurchaseRequests = async () => {
    setIsLoading(true)
    try {
      const data = await getPurchaseRequests()
      setPurchaseRequests(data)
    } catch (error) {
      console.error("Failed to load purchase requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    loadPurchaseRequests()
  }

  const getStatusBadge = (status: PurchaseRequestStatus) => {
    const variants = {
      PENDING: {
        label: "Pending",
        className: "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]",
        icon: Clock,
      },
      APPROVED: {
        label: "Approved",
        className: "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]",
        icon: CheckCircle,
      },
      ORDERED: {
        label: "Ordered",
        className: "bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]",
        icon: ShoppingCart,
      },
      RECEIVED: {
        label: "Received",
        className: "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]",
        icon: PackageCheck,
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
        icon: XCircle,
      },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge
        className={`${config.className} text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 flex items-center gap-1 w-fit`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getUrgencyIndicator = (
    currentStock?: number,
    reorderLevel?: number
  ): { show: boolean; label: string; color: string } | null => {
    if (currentStock === undefined || reorderLevel === undefined) return null

    const percentage = (currentStock / reorderLevel) * 100

    if (percentage <= 30) {
      return {
        show: true,
        label: "Critical",
        color: "text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]",
      }
    } else if (percentage <= 60) {
      return {
        show: true,
        label: "Low",
        color: "text-[#B8860B] bg-[#FFF8E1] border-[#F5DDA8]",
      }
    }

    return null
  }

  return (
    <DashboardLayout title="Sourcing & Procurement">
      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex-1">
            <CardTitle className="text-[14px] font-bold text-[#171717]">
              Purchase Requests
            </CardTitle>
            <p className="text-[12px] text-[#737373] mt-1">
              Manage material procurement from low stock inventory
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Request
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[13px] text-[#737373]">Loading purchase requests...</p>
            </div>
          ) : purchaseRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[14px] font-semibold text-[#171717] mb-1">
                No purchase requests
              </p>
              <p className="text-[13px] text-[#737373] mb-4">
                Create your first purchase request for low stock materials
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="text-[13px] font-semibold border-[#D4D4D4]"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Request
              </Button>
            </div>
          ) : (
            <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      PR #
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Material
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Quantity
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Supplier
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Requested
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Delivery
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseRequests.map((pr) => {
                    const urgency = getUrgencyIndicator(pr.currentStock, pr.reorderLevel)

                    return (
                      <TableRow
                        key={pr.id}
                        className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                      >
                        <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                          {pr.prNumber}
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col">
                            <span className="font-medium text-[13px] text-[#171717]">
                              {pr.materialName}
                            </span>
                            {urgency?.show && (
                              <Badge
                                className={`${urgency.color} text-[10px] font-bold uppercase px-1.5 py-0.5 mt-1 w-fit border`}
                              >
                                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                                {urgency.label}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {pr.quantity} {pr.unit}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {pr.supplierName || (
                            <span className="text-[#737373] italic">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="h-12">{getStatusBadge(pr.status)}</TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-[#171717]">{pr.requestedBy}</span>
                            <span className="text-[11.5px] text-[#737373]">
                              {formatDate(pr.requestedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {pr.expectedDeliveryDate ? (
                            formatDate(pr.expectedDeliveryDate)
                          ) : (
                            <span className="text-[#737373]">-</span>
                          )}
                        </TableCell>
                        <TableCell className="h-12 text-right">
                          <div className="flex justify-end gap-2">
                            {pr.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] text-[12px] font-semibold px-3 py-1"
                              >
                                Approve
                              </Button>
                            )}
                            {pr.status === "APPROVED" && (
                              <Button
                                size="sm"
                                className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-[12px] font-semibold px-3 py-1"
                              >
                                Mark Ordered
                              </Button>
                            )}
                            {pr.status === "ORDERED" && (
                              <Button
                                size="sm"
                                className="bg-[#2E7D32] text-white hover:bg-[#1B5E20] text-[12px] font-semibold px-3 py-1"
                              >
                                Mark Received
                              </Button>
                            )}
                            {pr.status === "RECEIVED" && (
                              <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10.5px] font-bold">
                                Complete
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PurchaseRequestModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </DashboardLayout>
  )
}
