"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { scheduleProduction, getPendingOrders } from "@/app/actions/production"
import { toast } from "sonner"

const formSchema = z.object({
  purchaseOrderId: z.string().min(1, "Please select an order"),
  scheduledStart: z.string().min(1, "Start date is required"),
  scheduledEnd: z.string().min(1, "Completion date is required"),
})

interface PendingOrder {
  id: string
  poNumber: string
  quantity: number
  product: {
    id: string
    name: string
    sku: string
    unit: string
  }
  salesOrder: {
    id: string
  } | null
}

interface ScheduleProductionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingOrders: PendingOrder[]
  onSuccess: () => void
}

export function ScheduleProductionModal({
  open,
  onOpenChange,
  pendingOrders,
  onSuccess,
}: ScheduleProductionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchaseOrderId: "",
      scheduledStart: "",
      scheduledEnd: "",
    },
  })

  const selectedOrderId = form.watch("purchaseOrderId")
  const selectedOrder = pendingOrders.find((o) => o.id === selectedOrderId)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!selectedOrder || !selectedOrder.salesOrder) {
      toast.error("Invalid order selection")
      return
    }

    setIsLoading(true)
    try {
      await scheduleProduction({
        salesOrderId: selectedOrder.salesOrder.id,
        productId: selectedOrder.product.id,
        plannedQuantity: selectedOrder.quantity,
        scheduledStart: new Date(values.scheduledStart),
        scheduledEnd: new Date(values.scheduledEnd),
        createdById: "temp-user-id", // TODO: Replace with actual user ID from session
      })

      toast.success("Production scheduled successfully")
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error scheduling production:", error)
      toast.error("Failed to schedule production")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-bold text-neutral-900">
            Schedule Production
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Order Selection */}
            <FormField
              control={form.control}
              name="purchaseOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-neutral-900">
                    Select Order
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Choose a pending order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pendingOrders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{order.poNumber}</span>
                            <span className="text-gray-500">—</span>
                            <span className="text-[12px] text-gray-600">
                              {order.product.name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {pendingOrders.length === 0 && (
                        <SelectItem value="none" disabled>
                          No pending orders available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Order Info */}
            {selectedOrder && (
              <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-gray-600">
                    Product
                  </span>
                  <span className="text-[13px] font-semibold text-neutral-900">
                    {selectedOrder.product.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-gray-600">
                    SKU
                  </span>
                  <span className="text-[13px] text-gray-700">
                    {selectedOrder.product.sku}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-gray-600">
                    Quantity
                  </span>
                  <span className="text-[13px] font-bold text-neutral-900">
                    {selectedOrder.quantity} {selectedOrder.product.unit}
                  </span>
                </div>
              </div>
            )}

            {/* Planned Start Date */}
            <FormField
              control={form.control}
              name="scheduledStart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-neutral-900">
                    Planned Start Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Completion Date */}
            <FormField
              control={form.control}
              name="scheduledEnd"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[13px] font-semibold text-neutral-900">
                    Expected Completion Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-gray-300"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-[13px] font-semibold border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white hover:bg-blue-700 text-[13px] font-semibold"
              >
                {isLoading ? "Scheduling..." : "Schedule Production"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
