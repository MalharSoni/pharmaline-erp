"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Calendar, Package, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ProductionRunWithDetails } from "@/app/actions/production"
import { format } from "date-fns"

interface ProductionCardProps {
  batch: ProductionRunWithDetails
  onClick: () => void
}

export function ProductionCard({ batch, onClick }: ProductionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: batch.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const progressPercentage = batch.yieldPercentage || 0

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          "bg-white border border-[#D4D4D4] p-4 rounded-[10px] shadow-sm cursor-pointer",
          "hover:shadow-md transition-all duration-150",
          isDragging && "opacity-50"
        )}
        onClick={onClick}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="text-[13px] font-bold text-neutral-900">
              {batch.salesOrder.purchaseOrder.poNumber}
            </span>
          </div>
          <Badge className="bg-[#F5F5F5] text-[#171717] border border-[#D4D4D4] text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-0.5">
            {batch.batchNumber}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="mb-3">
          <h3 className="text-[14px] font-bold text-neutral-900 mb-1">
            {batch.product.name}
          </h3>
          <div className="flex items-center gap-2 text-[11.5px] text-gray-600">
            <Package className="w-3.5 h-3.5" />
            <span>
              {batch.actualQuantity || batch.plannedQuantity} {batch.product.unit}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-1.5 mb-3">
          {batch.scheduledStart && (
            <div className="flex items-center gap-2 text-[11.5px] text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase text-gray-500">
                Start:
              </span>
              <span>{format(new Date(batch.scheduledStart), "MMM d, yyyy")}</span>
            </div>
          )}
          {batch.scheduledEnd && (
            <div className="flex items-center gap-2 text-[11.5px] text-gray-600">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase text-gray-500">
                Due:
              </span>
              <span>{format(new Date(batch.scheduledEnd), "MMM d, yyyy")}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if in progress or completed) */}
        {batch.status !== "PLANNED" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
                  Progress
                </span>
              </div>
              {batch.yieldPercentage && (
                <span className="text-[11.5px] font-bold text-neutral-900">
                  {batch.yieldPercentage.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  progressPercentage >= 100
                    ? "bg-green-500"
                    : progressPercentage >= 90
                    ? "bg-blue-500"
                    : "bg-amber-500"
                )}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
