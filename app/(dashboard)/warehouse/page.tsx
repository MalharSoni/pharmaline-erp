import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getMaterialRequests, getMaterialReturns } from "@/app/actions/warehouse"
import type { MaterialRequestStatus, MaterialReturnStatus } from "@/app/actions/warehouse"
import { CheckCircle, Clock, PackageCheck, XCircle, Plus } from "lucide-react"

export default async function WarehousePage() {
  const materialRequests = await getMaterialRequests()
  const materialReturns = await getMaterialReturns()

  const getRequestStatusBadge = (status: MaterialRequestStatus) => {
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
      FULFILLED: {
        label: "Fulfilled",
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

  const getReturnStatusBadge = (status: MaterialReturnStatus) => {
    const variants = {
      PENDING: {
        label: "Pending",
        className: "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]",
      },
      PROCESSED: {
        label: "Processed",
        className: "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]",
      },
    }

    const config = variants[status]

    return (
      <Badge
        className={`${config.className} text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1`}
      >
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <DashboardLayout title="Warehouse Management">
      <Tabs defaultValue="requests" className="space-y-5">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white border border-[#D4D4D4] p-1">
            <TabsTrigger
              value="requests"
              className="text-[13px] font-semibold px-4 py-2 data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
            >
              Material Requests
            </TabsTrigger>
            <TabsTrigger
              value="returns"
              className="text-[13px] font-semibold px-4 py-2 data-[state=active]:bg-[#0F4C81] data-[state=active]:text-white"
            >
              Material Returns
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Material Requests Tab */}
        <TabsContent value="requests" className="mt-0">
          <Card className="border border-[#D4D4D4] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-[14px] font-bold text-[#171717]">
                Material Requests
              </CardTitle>
              <Button className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Request
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Request #
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Production Order
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Materials
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Requested
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
                    {materialRequests.map((request) => (
                      <TableRow
                        key={request.id}
                        className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                      >
                        <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                          {request.requestNumber}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {request.productionOrderNumber}
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col gap-1">
                            {request.materials.map((mat, idx) => (
                              <div key={idx} className="text-[13px] text-[#171717]">
                                <span className="font-medium">{mat.materialName}</span>
                                <span className="text-[#737373] ml-1.5">
                                  ({mat.quantity} {mat.unit})
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-[#171717]">
                              {request.requestedBy}
                            </span>
                            <span className="text-[11.5px] text-[#737373]">
                              {formatDate(request.requestedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="h-12">
                          {getRequestStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="h-12 text-right">
                          <div className="flex justify-end gap-2">
                            {request.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] text-[12px] font-semibold px-3 py-1"
                              >
                                Approve
                              </Button>
                            )}
                            {request.status === "APPROVED" && (
                              <Button
                                size="sm"
                                className="bg-[#2E7D32] text-white hover:bg-[#1B5E20] text-[12px] font-semibold px-3 py-1"
                              >
                                Fulfill
                              </Button>
                            )}
                            {request.status === "FULFILLED" && (
                              <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10.5px] font-bold">
                                Complete
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Material Returns Tab */}
        <TabsContent value="returns" className="mt-0">
          <Card className="border border-[#D4D4D4] shadow-sm">
            <CardHeader>
              <CardTitle className="text-[14px] font-bold text-[#171717]">
                Material Returns
              </CardTitle>
              <p className="text-[12px] text-[#737373] mt-1">
                Auto-generated when production completes with yield less than 100%
              </p>
            </CardHeader>
            <CardContent>
              <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Return #
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Production Order
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Materials Returned
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Reason
                      </TableHead>
                      <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                        Returned By
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
                    {materialReturns.map((returnItem) => (
                      <TableRow
                        key={returnItem.id}
                        className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                      >
                        <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                          {returnItem.returnNumber}
                        </TableCell>
                        <TableCell className="text-[13px] text-[#171717] h-12">
                          {returnItem.productionOrderNumber}
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col gap-1">
                            {returnItem.materials.map((mat, idx) => (
                              <div key={idx} className="text-[13px] text-[#171717]">
                                <span className="font-medium">{mat.materialName}</span>
                                <span className="text-[#737373] ml-1.5">
                                  ({mat.quantity} {mat.unit})
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="h-12 max-w-xs">
                          <p className="text-[13px] text-[#171717] line-clamp-2">
                            {returnItem.reason}
                          </p>
                        </TableCell>
                        <TableCell className="h-12">
                          <div className="flex flex-col">
                            <span className="text-[13px] text-[#171717]">
                              {returnItem.returnedBy}
                            </span>
                            <span className="text-[11.5px] text-[#737373]">
                              {formatDate(returnItem.returnedAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="h-12">
                          {getReturnStatusBadge(returnItem.status)}
                        </TableCell>
                        <TableCell className="h-12 text-right">
                          {returnItem.status === "PENDING" && (
                            <Button
                              size="sm"
                              className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] text-[12px] font-semibold px-3 py-1"
                            >
                              Process
                            </Button>
                          )}
                          {returnItem.status === "PROCESSED" && (
                            <Badge className="bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] text-[10.5px] font-bold">
                              Complete
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
