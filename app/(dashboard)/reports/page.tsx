import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CycleTimeChart } from "@/components/reports/cycle-time-chart"
import { PlanVsActualChart } from "@/components/reports/plan-vs-actual-chart"
import { getReportMetrics } from "@/app/actions/reports"
import { Download, Calendar, TrendingUp, Package, RotateCw } from "lucide-react"

export default async function ReportsPage() {
  const metrics = await getReportMetrics()

  return (
    <DashboardLayout title="Reports & Analytics">
      {/* Date Range Selector */}
      <Card className="border border-[#D4D4D4] shadow-sm mb-6">
        <CardContent className="py-4">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="startDate"
                  className="text-[10px] font-bold uppercase tracking-wide text-[#737373]"
                >
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="w-[180px] text-[13px] border-[#D4D4D4]"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="endDate"
                  className="text-[10px] font-bold uppercase tracking-wide text-[#737373]"
                >
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="w-[180px] text-[13px] border-[#D4D4D4]"
                />
              </div>
              <Button className="bg-[#0F4C81] text-white hover:bg-[#0A3A61] font-semibold text-[13px] px-4 shadow-sm transition-all duration-150">
                <Calendar size={14} className="mr-2" />
                Apply Range
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="font-semibold text-[13px] border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
              >
                <Download size={14} className="mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="font-semibold text-[13px] border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
              >
                <Download size={14} className="mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <Card className="border border-[#D4D4D4] shadow-sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#737373] mb-1.5">
                  Avg Cycle Time
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-black leading-none text-[#171717]">
                    {metrics.avgCycleTime}
                  </span>
                  <span className="text-sm font-medium text-[#737373]">days</span>
                </div>
                <p className="text-[11.5px] text-[#737373] mt-1.5">Target: 7 days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#A3A3A3]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4D4D4] shadow-sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#737373] mb-1.5">
                  Order Completion
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-black leading-none text-[#171717]">
                    {metrics.orderCompletion.rate}
                  </span>
                  <span className="text-sm font-medium text-[#737373]">%</span>
                </div>
                <p className="text-[11.5px] text-[#737373] mt-1.5">
                  {metrics.orderCompletion.completed} of {metrics.orderCompletion.total} orders
                </p>
              </div>
              <Package className="w-5 h-5 text-[#A3A3A3]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#D4D4D4] shadow-sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#737373] mb-1.5">
                  Inventory Turnover
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-black leading-none text-[#171717]">
                    {metrics.inventoryTurnover}
                  </span>
                  <span className="text-sm font-medium text-[#737373]">x/yr</span>
                </div>
                <p className="text-[11.5px] text-[#737373] mt-1.5">Industry avg: 4-6x</p>
              </div>
              <RotateCw className="w-5 h-5 text-[#A3A3A3]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-[3px] border-t-[#2E7D32] border border-[#D4D4D4] shadow-sm">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#737373] mb-1.5">
                  On-Time Delivery
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[28px] font-black leading-none text-[#171717]">
                    94.2
                  </span>
                  <span className="text-sm font-medium text-[#737373]">%</span>
                </div>
                <p className="text-[11.5px] text-[#2E7D32] mt-1.5 font-semibold">
                  Above Target
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <CycleTimeChart data={metrics.cycleTime} />
        <PlanVsActualChart data={metrics.production} />
      </div>

      {/* Inventory Turnover Table */}
      <Card className="border border-[#D4D4D4] shadow-sm">
        <CardHeader>
          <CardTitle className="text-[14px] font-bold text-[#171717]">
            Inventory Turnover by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#D4D4D4] rounded-[10px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F5F5F5] border-b border-[#D4D4D4]">
                  <th className="text-[11px] font-bold uppercase text-[#737373] tracking-wide text-left px-4 py-2.5">
                    Category
                  </th>
                  <th className="text-[11px] font-bold uppercase text-[#737373] tracking-wide text-right px-4 py-2.5">
                    Turnover Rate
                  </th>
                  <th className="text-[11px] font-bold uppercase text-[#737373] tracking-wide text-right px-4 py-2.5">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.inventory.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#D4D4D4] hover:bg-[#F5F5F5] transition-colors duration-150"
                  >
                    <td className="text-[13px] text-[#171717] px-4 py-3 font-medium">
                      {item.category}
                    </td>
                    <td className="text-[13px] text-[#171717] px-4 py-3 text-right font-semibold">
                      {item.turnoverRate}x/year
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-sm text-[10.5px] font-bold uppercase tracking-wide ${
                          item.turnoverRate >= 6
                            ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]"
                            : item.turnoverRate >= 4
                            ? "bg-[#FFF8E1] text-[#B8860B] border border-[#F5DDA8]"
                            : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                        }`}
                      >
                        {item.turnoverRate >= 6 ? "Excellent" : item.turnoverRate >= 4 ? "Good" : "Low"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
