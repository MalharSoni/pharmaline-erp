"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { CycleTimeData } from "@/app/actions/reports"

interface CycleTimeChartProps {
  data: CycleTimeData[]
}

const chartConfig = {
  avgDays: {
    label: "Avg Cycle Time",
    color: "#0F4C81",
  },
  targetDays: {
    label: "Target",
    color: "#D4D4D4",
  },
}

export function CycleTimeChart({ data }: CycleTimeChartProps) {
  return (
    <Card className="border border-[#D4D4D4] shadow-sm">
      <CardHeader>
        <CardTitle className="text-[14px] font-bold text-[#171717]">
          Cycle Time Analysis
        </CardTitle>
        <CardDescription className="text-[11.5px] text-[#737373]">
          Average production cycle time vs target (days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-[11px] text-[#737373]"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-[11px] text-[#737373]"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="targetDays" fill="var(--color-targetDays)" radius={4} />
            <Bar dataKey="avgDays" fill="var(--color-avgDays)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
