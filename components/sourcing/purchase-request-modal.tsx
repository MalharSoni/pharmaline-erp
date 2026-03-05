"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createPurchaseRequest,
  getLowStockMaterials,
  getSuppliers,
} from "@/app/actions/sourcing"
import type { Supplier } from "@/app/actions/sourcing"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

interface PurchaseRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseRequestModal({ open, onOpenChange }: PurchaseRequestModalProps) {
  const router = useRouter()

  const [lowStockMaterials, setLowStockMaterials] = useState<
    Array<{
      id: string
      name: string
      currentStock: number
      unit: string
      reorderLevel: number
    }>
  >([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [formData, setFormData] = useState({
    materialId: "",
    materialName: "",
    unit: "",
    quantity: "",
    supplierId: "",
    supplierName: "",
    expectedDeliveryDate: "",
    reason: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [materials, suppliersData] = await Promise.all([
        getLowStockMaterials(),
        getSuppliers(),
      ])
      setLowStockMaterials(materials)
      setSuppliers(suppliersData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("Failed to load materials and suppliers")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleMaterialSelect = (materialId: string) => {
    const material = lowStockMaterials.find((m) => m.id === materialId)
    if (material) {
      setFormData((prev) => ({
        ...prev,
        materialId: material.id,
        materialName: material.name,
        unit: material.unit,
        reason: `Low stock - ${material.currentStock}${material.unit} remaining (reorder level: ${material.reorderLevel}${material.unit})`,
      }))
    }
  }

  const handleSupplierSelect = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    if (supplier) {
      setFormData((prev) => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.name,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createPurchaseRequest({
        materialId: formData.materialId,
        materialName: formData.materialName,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        supplierId: formData.supplierId || undefined,
        supplierName: formData.supplierName || undefined,
        expectedDeliveryDate: formData.expectedDeliveryDate
          ? new Date(formData.expectedDeliveryDate)
          : undefined,
        reason: formData.reason,
        notes: formData.notes || undefined,
        requestedBy: "Current User", // TODO: Get from auth context
      })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      materialId: "",
      materialName: "",
      unit: "",
      quantity: "",
      supplierId: "",
      supplierName: "",
      expectedDeliveryDate: "",
      reason: "",
      notes: "",
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const selectedMaterial = lowStockMaterials.find((m) => m.id === formData.materialId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold text-[#171717]">
            New Purchase Request
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            Create a purchase request for materials from low stock inventory.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="py-8 flex items-center justify-center">
            <p className="text-[13px] text-[#737373]">Loading materials and suppliers...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="material" className="text-[13px] font-semibold text-[#171717]">
                Material
              </Label>
              <Select value={formData.materialId} onValueChange={handleMaterialSelect} required>
                <SelectTrigger className="text-[13px] h-9 border-[#D4D4D4]">
                  <SelectValue placeholder="Select material from low stock" />
                </SelectTrigger>
                <SelectContent>
                  {lowStockMaterials.map((material) => (
                    <SelectItem
                      key={material.id}
                      value={material.id}
                      className="text-[13px] py-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{material.name}</span>
                        <span className="text-[#DC2626] text-[11px] font-semibold ml-3 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {material.currentStock}
                          {material.unit} / {material.reorderLevel}
                          {material.unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedMaterial && (
                <div className="bg-[#FFF8E1] border border-[#F5DDA8] rounded-md p-3 mt-2">
                  <p className="text-[12px] text-[#B8860B] font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Stock Alert
                  </p>
                  <p className="text-[11px] text-[#737373] mt-1">
                    Current: {selectedMaterial.currentStock}
                    {selectedMaterial.unit} | Reorder Level: {selectedMaterial.reorderLevel}
                    {selectedMaterial.unit}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[13px] font-semibold text-[#171717]">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  placeholder="e.g., 100"
                  required
                  className="text-[13px] h-9 border-[#D4D4D4]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit" className="text-[13px] font-semibold text-[#171717]">
                  Unit
                </Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  disabled
                  className="text-[13px] h-9 border-[#D4D4D4] bg-[#F5F5F5]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier" className="text-[13px] font-semibold text-[#171717]">
                Supplier (Optional)
              </Label>
              <Select value={formData.supplierId} onValueChange={handleSupplierSelect}>
                <SelectTrigger className="text-[13px] h-9 border-[#D4D4D4]">
                  <SelectValue placeholder="Select preferred supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id} className="text-[13px]">
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="expectedDeliveryDate"
                className="text-[13px] font-semibold text-[#171717]"
              >
                Expected Delivery Date (Optional)
              </Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleChange("expectedDeliveryDate", e.target.value)}
                className="text-[13px] h-9 border-[#D4D4D4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[13px] font-semibold text-[#171717]">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional requirements or instructions"
                className="text-[13px] h-9 border-[#D4D4D4]"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  resetForm()
                }}
                disabled={isSubmitting}
                className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.materialId || !formData.quantity}
                className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] text-[13px] font-semibold"
              >
                {isSubmitting ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
