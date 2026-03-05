"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import type { ProductionData } from "@/app/actions/reports"

interface PlanVsActualChartProps {
  data: ProductionData[]
}

const chartConfig = {
  planned: {
    label: "Planned Production",
    color: "#A3A3A3",
  },
  actual: {
    label: "Actual Production",
    color: "#0F4C81",
  },
}

export function PlanVsActualChart({ data }: PlanVsActualChartProps) {
  return (
    <Card className="border border-[#D4D4D4] shadow-sm">
      <CardHeader>
        <CardTitle className="text-[14px] font-bold text-[#171717]">
          Plan vs Actual Production
        </CardTitle>
        <CardDescription className="text-[11.5px] text-[#737373]">
          Weekly production targets vs actual output (units)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
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
            <Line
              type="monotone"
              dataKey="planned"
              stroke="var(--color-planned)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-actual)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
