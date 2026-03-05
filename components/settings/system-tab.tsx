"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SystemSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Save } from "lucide-react"

interface SystemTabProps {
  settings: SystemSettings
}

export function SystemTab({ settings: initialSettings }: SystemTabProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // Call updateSystemSettings action
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Settings saved successfully")
    setIsSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#171717]">System Settings</h3>
        <p className="text-[11.5px] text-[#737373] mt-1">
          Configure default values and company information
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Production Defaults */}
        <Card className="border border-[#D4D4D4] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[13px] font-bold text-[#171717]">
              Production Defaults
            </CardTitle>
            <CardDescription className="text-[11.5px] text-[#737373]">
              Default values for production planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="reorderPoint"
                className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
              >
                Reorder Point Default (kg)
              </Label>
              <Input
                id="reorderPoint"
                type="number"
                value={settings.reorderPointDefault}
                onChange={(e) =>
                  setSettings({ ...settings, reorderPointDefault: Number(e.target.value) })
                }
                className="text-[13px] border-[#D4D4D4]"
              />
              <p className="text-[11px] text-[#737373]">
                Default minimum stock level before reordering
              </p>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="leadTime"
                className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
              >
                Production Lead Time (days)
              </Label>
              <Input
                id="leadTime"
                type="number"
                value={settings.productionLeadTimeDays}
                onChange={(e) =>
                  setSettings({ ...settings, productionLeadTimeDays: Number(e.target.value) })
                }
                className="text-[13px] border-[#D4D4D4]"
              />
              <p className="text-[11px] text-[#737373]">
                Default time from order to completion
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="border border-[#D4D4D4] shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[13px] font-bold text-[#171717]">
              Company Information
            </CardTitle>
            <CardDescription className="text-[11.5px] text-[#737373]">
              Used in reports and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="companyName"
                className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
              >
                Company Name
              </Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="text-[13px] border-[#D4D4D4]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="companyEmail"
                className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
              >
                Company Email
              </Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="text-[13px] border-[#D4D4D4]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="companyPhone"
                className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
              >
                Company Phone
              </Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                className="text-[13px] border-[#D4D4D4]"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Address - Full Width */}
      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[13px] font-bold text-[#171717]">Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label
              htmlFor="companyAddress"
              className="text-[11px] font-bold uppercase tracking-wide text-[#737373]"
            >
              Full Address
            </Label>
            <Input
              id="companyAddress"
              value={settings.companyAddress}
              onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
              className="text-[13px] border-[#D4D4D4]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-6 shadow-sm transition-all duration-150"
        >
          <Save size={14} className="mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
