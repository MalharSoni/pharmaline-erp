"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getProductionBatchDetails,
  completeProduction,
  recordMaterialReturn,
} from "@/app/actions/production"
import { toast } from "sonner"
import { format } from "date-fns"
import { Calendar, Package, TrendingUp, ArrowLeft, CheckCircle } from "lucide-react"

const completionFormSchema = z.object({
  actualQuantity: z.string().min(1, "Actual quantity is required"),
})

const returnFormSchema = z.object({
  inventoryItemId: z.string().min(1, "Please select a material"),
  quantityReturned: z.string().min(1, "Quantity is required"),
})

interface ProductionDetailModalProps {
  batchId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ProductionDetailModal({
  batchId,
  open,
  onOpenChange,
  onSuccess,
}: ProductionDetailModalProps) {
  const [batchDetails, setBatchDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showReturnForm, setShowReturnForm] = useState(false)

  const completionForm = useForm<z.infer<typeof completionFormSchema>>({
    resolver: zodResolver(completionFormSchema),
    defaultValues: {
      actualQuantity: "",
    },
  })

  const returnForm = useForm<z.infer<typeof returnFormSchema>>({
    resolver: zodResolver(returnFormSchema),
    defaultValues: {
      inventoryItemId: "",
      quantityReturned: "",
    },
  })

  useEffect(() => {
    if (batchId && open) {
      loadBatchDetails()
    }
  }, [batchId, open])

  async function loadBatchDetails() {
    if (!batchId) return

    try {
      const details = await getProductionBatchDetails(batchId)
      setBatchDetails(details)
      if (details?.plannedQuantity) {
        completionForm.setValue("actualQuantity", details.plannedQuantity.toString())
      }
    } catch (error) {
      console.error("Error loading batch details:", error)
      toast.error("Failed to load batch details")
    }
  }

  async function onCompleteProduction(values: z.infer<typeof completionFormSchema>) {
    if (!batchId) return

    setIsLoading(true)
    try {
      await completeProduction({
        batchId,
        actualQuantity: parseFloat(values.actualQuantity),
      })

      toast.success("Production completed successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error completing production:", error)
      toast.error("Failed to complete production")
    } finally {
      setIsLoading(false)
    }
  }

  async function onRecordReturn(values: z.infer<typeof returnFormSchema>) {
    if (!batchId) return

    setIsLoading(true)
    try {
      const material = batchDetails?.salesOrder?.materialRequest?.items.find(
        (item: any) => item.inventoryItemId === values.inventoryItemId
      )

      if (!material) {
        toast.error("Material not found")
        return
      }

      await recordMaterialReturn({
        productionBatchId: batchId,
        inventoryItemId: values.inventoryItemId,
        quantityReturned: parseFloat(values.quantityReturned),
        unit: material.unit,
      })

      toast.success("Material return recorded")
      returnForm.reset()
      setShowReturnForm(false)
      loadBatchDetails()
    } catch (error) {
      console.error("Error recording return:", error)
      toast.error("Failed to record material return")
    } finally {
      setIsLoading(false)
    }
  }

  if (!batchDetails) {
    return null
  }

  const yieldPercentage = batchDetails.yieldPercentage || 0
  const isCompleted = batchDetails.status === "COMPLETED"
  const needsMaterialReturn = yieldPercentage < 100 && yieldPercentage > 0

  const getStatusBadge = (status: string) => {
    const variants = {
      PLANNED: "bg-gray-100 text-gray-800 border-gray-300",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
      COMPLETED: "bg-green-100 text-green-800 border-green-300",
      VERIFIED: "bg-purple-100 text-purple-800 border-purple-300",
    }
    const className = variants[status as keyof typeof variants] || variants.PLANNED

    return (
      <Badge className={`${className} text-[10.5px] font-bold uppercase tracking-wide border`}>
        {status.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[16px] font-bold text-neutral-900">
              Production Details
            </DialogTitle>
            {getStatusBadge(batchDetails.status)}
          </div>
        </DialogHeader>

        {/* Production Info */}
        <div className="space-y-4">
          {/* Header Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Batch Number
                </p>
                <p className="text-[16px] font-bold text-neutral-900">
                  {batchDetails.batchNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Purchase Order
                </p>
                <p className="text-[14px] font-bold text-neutral-900">
                  {batchDetails.salesOrder.purchaseOrder.poNumber}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                Product
              </p>
              <p className="text-[14px] font-semibold text-neutral-900">
                {batchDetails.product.name}
              </p>
              <p className="text-[12px] text-gray-600">{batchDetails.product.sku}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                  Planned Quantity
                </p>
                <p className="text-[14px] font-bold text-neutral-900">
                  {batchDetails.plannedQuantity} {batchDetails.product.unit}
                </p>
              </div>
              {batchDetails.actualQuantity && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Actual Output
                  </p>
                  <p className="text-[14px] font-bold text-neutral-900">
                    {batchDetails.actualQuantity} {batchDetails.product.unit}
                  </p>
                </div>
              )}
            </div>

            {/* Yield Percentage */}
            {yieldPercentage > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <p className="text-[11px] font-bold uppercase text-gray-600">
                      Yield
                    </p>
                  </div>
                  <p
                    className={`text-[16px] font-bold ${
                      yieldPercentage >= 95
                        ? "text-green-600"
                        : yieldPercentage >= 85
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {yieldPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      yieldPercentage >= 95
                        ? "bg-green-500"
                        : yieldPercentage >= 85
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(yieldPercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              {batchDetails.scheduledStart && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Scheduled Start
                  </p>
                  <p className="text-[13px] text-gray-700">
                    {format(new Date(batchDetails.scheduledStart), "MMM d, yyyy")}
                  </p>
                </div>
              )}
              {batchDetails.scheduledEnd && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-gray-600 mb-1">
                    Scheduled End
                  </p>
                  <p className="text-[13px] text-gray-700">
                    {format(new Date(batchDetails.scheduledEnd), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Materials Used */}
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900 mb-3">
              Materials Used
            </h3>
            <div className="border border-gray-200 rounded-[8px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="text-[11px] font-bold uppercase text-gray-600">
                      Material
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-gray-600 text-right">
                      Requested
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-gray-600 text-right">
                      Issued
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchDetails.salesOrder?.materialRequest?.items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-[13px] font-medium text-neutral-900">
                        {item.inventoryItem.name}
                      </TableCell>
                      <TableCell className="text-[13px] text-gray-700 text-right">
                        {item.quantityRequested} {item.unit}
                      </TableCell>
                      <TableCell className="text-[13px] font-semibold text-neutral-900 text-right">
                        {item.quantityIssued || 0} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Material Returns */}
          {(batchDetails.materialReturns?.length > 0 || needsMaterialReturn) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-bold text-neutral-900">
                  Material Returns
                </h3>
                {needsMaterialReturn && !isCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowReturnForm(!showReturnForm)}
                    className="text-[12px] font-semibold"
                  >
                    {showReturnForm ? "Cancel" : "Record Return"}
                  </Button>
                )}
              </div>

              {showReturnForm && (
                <Form {...returnForm}>
                  <form
                    onSubmit={returnForm.handleSubmit(onRecordReturn)}
                    className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 space-y-3 mb-3"
                  >
                    <FormField
                      control={returnForm.control}
                      name="inventoryItemId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px] font-semibold">
                            Material
                          </FormLabel>
                          <FormControl>
                            <select
                              className="w-full border border-gray-300 rounded-[6px] px-3 py-2 text-[13px]"
                              {...field}
                            >
                              <option value="">Select material</option>
                              {batchDetails.salesOrder?.materialRequest?.items.map(
                                (item: any) => (
                                  <option
                                    key={item.inventoryItemId}
                                    value={item.inventoryItemId}
                                  >
                                    {item.inventoryItem.name}
                                  </option>
                                )
                              )}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={returnForm.control}
                      name="quantityReturned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[12px] font-semibold">
                            Quantity Returned
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="border-gray-300"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 text-[13px] font-semibold"
                    >
                      {isLoading ? "Recording..." : "Record Return"}
                    </Button>
                  </form>
                </Form>
              )}

              {batchDetails.materialReturns?.length > 0 && (
                <div className="border border-gray-200 rounded-[8px] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-[11px] font-bold uppercase text-gray-600">
                          Material
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-gray-600 text-right">
                          Quantity
                        </TableHead>
                        <TableHead className="text-[11px] font-bold uppercase text-gray-600 text-right">
                          Date
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchDetails.materialReturns.map((returnItem: any) => (
                        <TableRow key={returnItem.id}>
                          <TableCell className="text-[13px] font-medium text-neutral-900">
                            {returnItem.inventoryItem.name}
                          </TableCell>
                          <TableCell className="text-[13px] text-gray-700 text-right">
                            {returnItem.quantityReturned} {returnItem.unit}
                          </TableCell>
                          <TableCell className="text-[13px] text-gray-700 text-right">
                            {format(new Date(returnItem.returnedAt), "MMM d, yyyy")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {/* Complete Production Form */}
          {!isCompleted && batchDetails.status === "IN_PROGRESS" && (
            <Form {...completionForm}>
              <form
                onSubmit={completionForm.handleSubmit(onCompleteProduction)}
                className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 space-y-3"
              >
                <h3 className="text-[14px] font-bold text-neutral-900">
                  Complete Production
                </h3>

                <FormField
                  control={completionForm.control}
                  name="actualQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[13px] font-semibold">
                        Actual Output Quantity ({batchDetails.product.unit})
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="border-gray-300 bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white hover:bg-green-700 text-[13px] font-semibold flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isLoading ? "Completing..." : "Mark as Complete"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
