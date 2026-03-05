"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { ProductionCard } from "@/components/production/production-card"
import { ScheduleProductionModal } from "@/components/production/schedule-production-modal"
import { ProductionDetailModal } from "@/components/production/production-detail-modal"
import {
  getProductionBatches,
  getPendingOrders,
  updateProductionStatus,
  ProductionRunWithDetails,
} from "@/app/actions/production"
import { ProductionStatus } from "@prisma/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { id: "PLANNED", title: "Planned", status: "PLANNED" as ProductionStatus },
  { id: "IN_PROGRESS", title: "In Production", status: "IN_PROGRESS" as ProductionStatus },
  { id: "COMPLETED", title: "Completed", status: "COMPLETED" as ProductionStatus },
]

// Droppable Column Component
function DroppableColumn({
  id,
  title,
  count,
  children,
  isLoading,
}: {
  id: string
  title: string
  count: number
  children: React.ReactNode
  isLoading: boolean
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col">
      {/* Column Header */}
      <div className="bg-[#F5F5F5] rounded-t-[10px] border border-[#D4D4D4] border-b-0 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-[#171717]">{title}</h2>
          <span className="bg-[#D4D4D4] text-[#737373] text-[11px] font-bold rounded-full px-2.5 py-0.5">
            {count}
          </span>
        </div>
      </div>

      {/* Column Content - Droppable Area */}
      <div
        ref={setNodeRef}
        className={cn(
          "bg-[#F5F5F5] rounded-b-[10px] border border-[#D4D4D4] border-t-0 p-4 space-y-3 min-h-[500px]",
          "transition-all duration-150",
          isOver && "bg-[#EFF6FF] border-[#0F4C81]"
        )}
      >
        {isLoading ? (
          <div className="text-center text-[13px] text-gray-500 py-8">
            Loading...
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

export default function ProductionPage() {
  const [batches, setBatches] = useState<ProductionRunWithDetails[]>([])
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [activeBatch, setActiveBatch] = useState<ProductionRunWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [batchesData, ordersData] = await Promise.all([
        getProductionBatches(),
        getPendingOrders(),
      ])
      setBatches(batchesData)
      setPendingOrders(ordersData)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load production data")
    } finally {
      setIsLoading(false)
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const batch = batches.find((b) => b.id === event.active.id)
    setActiveBatch(batch || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveBatch(null)

    if (!over) return

    const batchId = active.id as string
    const newStatus = over.id as ProductionStatus

    const batch = batches.find((b) => b.id === batchId)
    if (!batch || batch.status === newStatus) return

    try {
      // Optimistic update
      setBatches((prev) =>
        prev.map((b) => (b.id === batchId ? { ...b, status: newStatus } : b))
      )

      await updateProductionStatus(batchId, newStatus)
      toast.success("Production status updated")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update status")
      // Revert optimistic update
      loadData()
    }
  }

  function handleCardClick(batchId: string) {
    setSelectedBatchId(batchId)
    setDetailModalOpen(true)
  }

  function getBatchesForColumn(status: ProductionStatus) {
    return batches.filter((batch) => batch.status === status)
  }

  const stats = [
    {
      label: "PLANNED",
      value: getBatchesForColumn("PLANNED").length,
      color: "text-gray-700",
    },
    {
      label: "IN PRODUCTION",
      value: getBatchesForColumn("IN_PROGRESS").length,
      color: "text-blue-700",
    },
    {
      label: "COMPLETED TODAY",
      value: getBatchesForColumn("COMPLETED").filter((b) => {
        if (!b.actualEnd) return false
        const today = new Date()
        const endDate = new Date(b.actualEnd)
        return (
          endDate.getDate() === today.getDate() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getFullYear() === today.getFullYear()
        )
      }).length,
      color: "text-green-700",
    },
  ]

  return (
    <DashboardLayout title="Production Schedule">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
                {stat.label}
              </span>
              <span className={`text-[22px] font-black ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => setScheduleModalOpen(true)}
          className="bg-[#0F4C81] text-white hover:opacity-90 text-[13px] font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Production
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-5">
          {COLUMNS.map((column) => {
            const columnBatches = getBatchesForColumn(column.status)

            return (
              <DroppableColumn
                key={column.id}
                id={column.id}
                title={column.title}
                count={columnBatches.length}
                isLoading={isLoading}
              >
                <SortableContext
                  items={columnBatches.map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnBatches.length === 0 ? (
                    <div className="text-center text-[13px] text-gray-500 py-8">
                      No batches in this stage
                    </div>
                  ) : (
                    columnBatches.map((batch) => (
                      <ProductionCard
                        key={batch.id}
                        batch={batch}
                        onClick={() => handleCardClick(batch.id)}
                      />
                    ))
                  )}
                </SortableContext>
              </DroppableColumn>
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeBatch ? (
            <div className="cursor-grabbing">
              <ProductionCard batch={activeBatch} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <ScheduleProductionModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        pendingOrders={pendingOrders}
        onSuccess={loadData}
      />

      <ProductionDetailModal
        batchId={selectedBatchId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSuccess={loadData}
      />
    </DashboardLayout>
  )
}
