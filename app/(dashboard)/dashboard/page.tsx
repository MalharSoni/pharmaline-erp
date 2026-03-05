import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, AlertTriangle, Clock, CheckCircle, Package, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      label: "ACTIVE ORDERS",
      value: "12",
      trend: "+4%",
      meta: "3 in production, 9 pending",
      icon: Package,
    },
    {
      label: "LOW STOCK ALERTS",
      value: "7",
      meta: "2 critical, 5 warnings",
      icon: AlertTriangle,
      variant: "critical" as const,
    },
    {
      label: "AVG CYCLE TIME",
      value: "8.4",
      unit: "days",
      meta: "Target: 7 days",
      icon: Clock,
    },
  ]

  const activeOrders = [
    {
      po: "PO-9821",
      client: "Global Health Corp",
      product: "Metformin 850mg",
      status: "IN_PRODUCTION",
      daysActive: 3,
    },
    {
      po: "PO-9822",
      client: "Central Pharma",
      product: "Lisinopril 10mg",
      status: "AWAITING_MATERIALS",
      daysActive: 5,
    },
    {
      po: "PO-9825",
      client: "Nordic Meds",
      product: "Ibuprofen 400mg",
      status: "READY_TO_DISPATCH",
      daysActive: 2,
    },
    {
      po: "PO-9828",
      client: "City Hospital",
      product: "Atorvastatin 20mg",
      status: "IN_PRODUCTION",
      daysActive: 1,
    },
  ]

  const alerts = [
    { item: "Foil PTP (250mm)", stock: "2.5kg", reorder: "10kg", critical: true },
    { item: "Gelatin Powder", stock: "8kg", reorder: "15kg", critical: false },
  ]

  const productionTimeline = [
    { name: "Mixing Complete", batch: "#419", time: "09:30 AM", done: true },
    { name: "Tablet Compression", batch: "#419", time: "In Progress", done: false },
    { name: "Packaging & Labeling", time: "Next Step", done: false },
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      IN_PRODUCTION: {
        label: "In Production",
        className: "bg-[#E8F1F8] text-[#0F4C81] border border-[#C5D9E8]"
      },
      AWAITING_MATERIALS: {
        label: "Awaiting Materials",
        className: "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]"
      },
      READY_TO_DISPATCH: {
        label: "Ready to Dispatch",
        className: "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
      },
    }
    const config = variants[status as keyof typeof variants]
    return (
      <Badge
        className={`${config.className} text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1`}
      >
        {config.label}
      </Badge>
    )
  }

  return (
    <DashboardLayout title="Dashboard Overview">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <Card
              key={idx}
              className={`
                border border-[#D4D4D4] shadow-sm
                ${stat.variant === "critical" ? "border-t-[3px] border-t-[#DC2626]" : ""}
              `}
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#737373] mb-1.5">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[28px] font-black leading-none text-[#171717]">
                        {stat.value}
                      </span>
                      {stat.unit && (
                        <span className="text-sm font-medium text-[#737373]">{stat.unit}</span>
                      )}
                      {stat.trend && (
                        <span className="text-[11px] font-semibold text-[#737373]">
                          {stat.trend}
                        </span>
                      )}
                      {stat.variant === "critical" && (
                        <span className="text-[11px] font-bold text-[#DC2626] uppercase">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#737373] mt-1.5">{stat.meta}</p>
                  </div>
                  <Icon className="w-5 h-5 text-[#A3A3A3]" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Next Production Run Widget - Professional, No Gradient */}
      <Card className="mb-6 border-l-4 border-l-[#0F4C81] bg-[#E8F1F8] border-[#C5D9E8]">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-[#0F4C81] text-white mb-2 uppercase text-[10px] font-bold tracking-wide px-2.5 py-1">
                Priority Action
              </Badge>
              <h3 className="text-[16px] font-bold mb-1 text-[#171717]">Next Production Run</h3>
              <p className="text-[13px] text-[#404040]">
                Batch #420 (Amoxicillin 500mg) scheduled for 2:00 PM today
              </p>
            </div>
            <Button className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 py-2 shadow-sm transition-all duration-150">
              Prepare Materials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Active Orders */}
        <Card className="col-span-2 border border-[#D4D4D4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[14px] font-bold text-[#171717]">Active Orders</CardTitle>
            <Button
              variant="link"
              className="text-[#0F4C81] h-auto p-0 text-[13px] font-medium hover:text-[#0A3A61] flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F5F5] border-b border-[#D4D4D4] hover:bg-[#F5F5F5]">
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      PO #
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Client
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Product
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide h-9">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-bold uppercase text-[#737373] tracking-wide text-right h-9">
                      Days Active
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeOrders.map((order) => (
                    <TableRow
                      key={order.po}
                      className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                    >
                      <TableCell className="font-semibold text-[13px] text-[#171717] h-12">
                        {order.po}
                      </TableCell>
                      <TableCell className="text-[13px] text-[#171717] h-12">{order.client}</TableCell>
                      <TableCell className="text-[13px] text-[#171717] h-12">{order.product}</TableCell>
                      <TableCell className="h-12">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right text-[13px] text-[#737373] h-12">
                        {order.daysActive} days
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Alerts + Timeline */}
        <div className="space-y-5">
          {/* Critical Alerts */}
          <Card className="border-t-[3px] border-t-[#DC2626] border border-[#D4D4D4] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-bold text-[#171717]">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${
                      alert.critical ? "bg-[#DC2626]" : "bg-[#F59E0B]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#171717]">{alert.item}</p>
                    <p className="text-[11.5px] text-[#737373] mt-0.5">
                      {alert.stock} remaining (reorder: {alert.reorder})
                    </p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full text-[13px] font-semibold border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
              >
                Manage Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Production Timeline */}
          <Card className="border border-[#D4D4D4] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-[14px] font-bold text-[#171717]">
                Production Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {productionTimeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  {step.done ? (
                    <CheckCircle className="w-5 h-5 text-[#2E7D32] flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#D4D4D4] flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#171717]">{step.name}</p>
                    <p className="text-[11.5px] text-[#737373] mt-0.5">
                      {step.batch && `Batch ${step.batch} • `}{step.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
