"use client"

import { useState } from "react"
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
import { createClient, updateClient } from "@/app/actions/clients"
import type { Client } from "@/app/actions/clients"
import { toast } from "sonner"

interface ClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
}

export function ClientModal({ open, onOpenChange, client }: ClientModalProps) {
  const router = useRouter()
  const isEditing = !!client

  const [formData, setFormData] = useState({
    name: client?.name || "",
    contactPerson: client?.contactPerson || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let result

      if (isEditing && client) {
        result = await updateClient({
          id: client.id,
          ...formData,
        })
      } else {
        result = await createClient(formData)
      }

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold text-[#171717]">
            {isEditing ? "Edit Client" : "Add New Client"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#737373]">
            {isEditing
              ? "Update client information below."
              : "Enter client information to add them to your system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-semibold text-[#171717]">
              Company Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Global Health Corp"
              required
              className="text-[13px] h-9 border-[#D4D4D4]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="contactPerson"
              className="text-[13px] font-semibold text-[#171717]"
            >
              Contact Person
            </Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              placeholder="e.g., Dr. Sarah Johnson"
              required
              className="text-[13px] h-9 border-[#D4D4D4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-semibold text-[#171717]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@company.com"
                required
                className="text-[13px] h-9 border-[#D4D4D4]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[13px] font-semibold text-[#171717]">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
                className="text-[13px] h-9 border-[#D4D4D4]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-[13px] font-semibold text-[#171717]">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Medical Plaza, New York, NY 10001"
              required
              className="text-[13px] h-9 border-[#D4D4D4]"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] text-[13px] font-semibold"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Client" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
