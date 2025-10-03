"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { AlphaSignal } from "@/lib/types"

interface SignalDistributionChartProps {
  signals: AlphaSignal[]
}

export function SignalDistributionChart({ signals }: SignalDistributionChartProps) {
  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No signal data available</CardContent>
      </Card>
    )
  }

  // Create histogram bins
  const bins = 20
  const binSize = 2 / bins // Range from -1 to 1
  const histogram = new Array(bins).fill(0)

  signals.forEach((signal) => {
    const binIndex = Math.min(Math.floor((signal.signalValue + 1) / binSize), bins - 1)
    histogram[binIndex]++
  })

  const chartData = histogram.map((count, idx) => ({
    range: `${(-1 + idx * binSize).toFixed(2)}`,
    count,
    fill: idx < bins / 2 ? "hsl(var(--destructive))" : "hsl(var(--chart-2))",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signal Distribution</CardTitle>
        <CardDescription>Histogram of alpha signal values across all timestamps</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="range" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
