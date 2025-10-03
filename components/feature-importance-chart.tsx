"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { AlphaSignal } from "@/lib/types"

interface FeatureImportanceChartProps {
  signals: AlphaSignal[]
}

export function FeatureImportanceChart({ signals }: FeatureImportanceChartProps) {
  if (signals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No feature data available</CardContent>
      </Card>
    )
  }

  // Calculate average absolute values for each feature
  const featureStats = {
    volumeImbalance: 0,
    depthImbalance: 0,
    priceImbalance: 0,
    relativeSpread: 0,
    micropriceVolatility: 0,
    orderFlowToxicity: 0,
    vpin: 0,
  }

  signals.forEach((signal) => {
    featureStats.volumeImbalance += Math.abs(signal.features.volumeImbalance)
    featureStats.depthImbalance += Math.abs(signal.features.depthImbalance)
    featureStats.priceImbalance += Math.abs(signal.features.priceImbalance)
    featureStats.relativeSpread += Math.abs(signal.features.relativeSpread)
    featureStats.micropriceVolatility += Math.abs(signal.features.micropriceVolatility)
    featureStats.orderFlowToxicity += Math.abs(signal.features.orderFlowToxicity)
    featureStats.vpin += Math.abs(signal.features.vpin)
  })

  const chartData = Object.entries(featureStats)
    .map(([name, value]) => ({
      name: name.replace(/([A-Z])/g, " $1").trim(),
      importance: value / signals.length,
    }))
    .sort((a, b) => b.importance - a.importance)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Importance</CardTitle>
        <CardDescription>Average absolute values of extracted LOB features</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis
              type="category"
              dataKey="name"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Bar dataKey="importance" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
