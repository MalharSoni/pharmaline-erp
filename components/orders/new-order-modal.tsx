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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createOrder, getClients, getProducts } from "@/app/actions/orders"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface NewOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function NewOrderModal({ open, onOpenChange, userId }: NewOrderModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const [formData, setFormData] = useState({
    clientId: "",
    productId: "",
    quantity: "",
    expectedDeliveryDate: "",
    totalAmount: "",
  })

  // Load clients and products
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  async function loadData() {
    const [clientsRes, productsRes] = await Promise.all([
      getClients(),
      getProducts()
    ])

    if (clientsRes.success) setClients(clientsRes.data || [])
    if (productsRes.success) setProducts(productsRes.data || [])
  }

  // Auto-calculate advance payment (50%)
  const advanceAmount = formData.totalAmount
    ? (parseFloat(formData.totalAmount) * 0.5).toFixed(2)
    : "0.00"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.clientId || !formData.productId || !formData.quantity || !formData.expectedDeliveryDate || !formData.totalAmount) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)

    const result = await createOrder({
      clientId: formData.clientId,
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      expectedDeliveryDate: new Date(formData.expectedDeliveryDate),
      totalAmount: parseFloat(formData.totalAmount),
      createdById: userId,
    })

    setLoading(false)

    if (result.success) {
      toast.success(`Order created: ${result.data?.poNumber}`)
      onOpenChange(false)
      setFormData({
        clientId: "",
        productId: "",
        quantity: "",
        expectedDeliveryDate: "",
        totalAmount: "",
      })
      router.refresh()
    } else {
      toast.error(result.error || "Failed to create order")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold text-[#171717]">
            Create New Purchase Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                Client
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger className="w-full h-10 text-[13px] border-[#D4D4D4]">
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="text-[13px]">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                Product / SKU
              </Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger className="w-full h-10 text-[13px] border-[#D4D4D4]">
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="text-[13px]">
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                Quantity
              </Label>
              <Input
                type="number"
                min="1"
                step="any"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="h-10 text-[13px] border-[#D4D4D4]"
                placeholder="Enter quantity..."
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                Expected Delivery Date
              </Label>
              <Input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="h-10 text-[13px] border-[#D4D4D4]"
              />
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="border border-[#D4D4D4] rounded-[10px] p-4 bg-[#FAFAFA]">
            <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#737373] mb-3">
              Payment Terms (50/50 Split)
            </h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Total Amount */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Total Amount ($)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="h-10 text-[13px] border-[#D4D4D4] bg-white"
                  placeholder="0.00"
                />
              </div>

              {/* Auto-calculated Advance */}
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                  Advance Payment (50%)
                </Label>
                <div className="h-10 flex items-center px-3 rounded-md border border-[#D4D4D4] bg-[#F5F5F5] text-[13px] text-[#737373]">
                  ${advanceAmount}
                </div>
              </div>
            </div>

            <p className="text-[11.5px] text-[#737373] mt-3">
              Remaining balance (${advanceAmount}) will be due upon delivery
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
