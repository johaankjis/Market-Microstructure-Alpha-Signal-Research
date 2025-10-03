"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { BacktestResult } from "@/lib/types"

interface PerformanceHeatmapProps {
  results: BacktestResult[]
}

export function PerformanceHeatmap({ results }: PerformanceHeatmapProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No backtest results available</CardContent>
      </Card>
    )
  }

  const metrics = [
    { name: "Total Return", key: "totalReturn", format: (v: number) => `${(v * 100).toFixed(2)}%` },
    { name: "Sharpe Ratio", key: "sharpeRatio", format: (v: number) => v.toFixed(2) },
    { name: "Sortino Ratio", key: "sortinoRatio", format: (v: number) => v.toFixed(2) },
    { name: "Max Drawdown", key: "maxDrawdown", format: (v: number) => `${(v * 100).toFixed(2)}%` },
    { name: "Win Rate", key: "winRate", format: (v: number) => `${(v * 100).toFixed(1)}%` },
    { name: "Profit Factor", key: "profitFactor", format: (v: number) => v.toFixed(2) },
    { name: "Calmar Ratio", key: "calmarRatio", format: (v: number) => v.toFixed(2) },
  ]

  const getColorClass = (value: number, metricKey: string) => {
    if (metricKey === "maxDrawdown") {
      // Lower is better for drawdown
      if (value < 0.05) return "bg-green-500/20 text-green-600 dark:text-green-400"
      if (value < 0.15) return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
      return "bg-red-500/20 text-red-600 dark:text-red-400"
    }

    // Higher is better for other metrics
    if (value > 0.5 || (metricKey === "sharpeRatio" && value > 1.5)) {
      return "bg-green-500/20 text-green-600 dark:text-green-400"
    }
    if (value > 0 || (metricKey === "sharpeRatio" && value > 0.5)) {
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
    }
    return "bg-red-500/20 text-red-600 dark:text-red-400"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Heatmap</CardTitle>
        <CardDescription>Comparative view of key metrics across all backtests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium">Metric</th>
                {results.map((result, idx) => (
                  <th key={result.id} className="text-center p-3 text-sm font-medium">
                    Run #{results.length - idx}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.key} className="border-b">
                  <td className="p-3 text-sm font-medium">{metric.name}</td>
                  {results.map((result) => {
                    const value = result.metrics[metric.key as keyof typeof result.metrics] as number
                    return (
                      <td key={result.id} className="p-3 text-center">
                        <div
                          className={`inline-block px-3 py-1 rounded-md text-sm font-mono ${getColorClass(value, metric.key)}`}
                        >
                          {metric.format(value)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
