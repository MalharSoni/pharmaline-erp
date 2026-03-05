"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { NotificationSettings } from "@/app/actions/settings"
import { toast } from "sonner"
import { Save, Bell, Package, AlertTriangle, DollarSign, CheckCircle } from "lucide-react"

interface NotificationsTabProps {
  settings: NotificationSettings
}

interface NotificationOption {
  key: keyof NotificationSettings
  label: string
  description: string
  icon: React.ElementType
  category: "inventory" | "production" | "orders" | "finance"
}

const notificationOptions: NotificationOption[] = [
  {
    key: "lowStockAlerts",
    label: "Low Stock Alerts",
    description: "Receive notifications when inventory falls below reorder point",
    icon: AlertTriangle,
    category: "inventory",
  },
  {
    key: "orderOverdue",
    label: "Order Overdue Alerts",
    description: "Get notified when orders exceed expected delivery time",
    icon: Package,
    category: "orders",
  },
  {
    key: "paymentReceived",
    label: "Payment Received",
    description: "Notification when client payments are processed",
    icon: DollarSign,
    category: "finance",
  },
  {
    key: "productionComplete",
    label: "Production Complete",
    description: "Alert when production batches are completed and ready",
    icon: CheckCircle,
    category: "production",
  },
]

export function NotificationsTab({ settings: initialSettings }: NotificationsTabProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings({ ...settings, [key]: !settings[key] })
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Call updateNotificationSettings action
    await new Promise((resolve) => setTimeout(resolve, 500))
    toast.success("Notification settings saved")
    setIsSaving(false)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "inventory":
        return "text-[#F59E0B]"
      case "production":
        return "text-[#0F4C81]"
      case "orders":
        return "text-[#8B5CF6]"
      case "finance":
        return "text-[#2E7D32]"
      default:
        return "text-[#737373]"
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-bold text-[#171717]">Notification Preferences</h3>
        <p className="text-[11.5px] text-[#737373] mt-1">
          Configure which notifications you want to receive
        </p>
      </div>

      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[13px] font-bold text-[#171717] flex items-center gap-2">
            <Bell size={16} className="text-[#0F4C81]" />
            Alert Settings
          </CardTitle>
          <CardDescription className="text-[11.5px] text-[#737373]">
            Enable or disable specific notification types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon
            return (
              <div
                key={option.key}
                className="flex items-start justify-between p-4 border border-[#D4D4D4] rounded-lg hover:bg-[#F5F5F5] transition-colors duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${getCategoryColor(option.category)}`}>
                    <Icon size={20} />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor={option.key}
                      className="text-[13px] font-semibold text-[#171717] cursor-pointer"
                    >
                      {option.label}
                    </Label>
                    <p className="text-[11.5px] text-[#737373]">{option.description}</p>
                  </div>
                </div>
                <Switch
                  id={option.key}
                  checked={settings[option.key]}
                  onCheckedChange={() => handleToggle(option.key)}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Notification Summary */}
      <Card className="border-l-4 border-l-[#0F4C81] bg-[#E8F1F8] border-[#C5D9E8] shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Bell size={18} className="text-[#0F4C81] mt-0.5" />
            <div>
              <h4 className="text-[13px] font-bold text-[#171717] mb-1">
                Email Notifications
              </h4>
              <p className="text-[11.5px] text-[#404040]">
                Notifications will be sent to your registered email address. You can manage
                additional notification channels in your profile settings.
              </p>
            </div>
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
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}
