"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Clock } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { BacktestResult } from "@/lib/types"

export function BacktestResults() {
  const [results, setResults] = useState<BacktestResult[]>([])

  useEffect(() => {
    const updateResults = () => {
      setResults(dataStore.getBacktestResults())
    }

    updateResults()
    const interval = setInterval(updateResults, 1000)
    return () => clearInterval(interval)
  }, [])

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No backtest results yet. Run a backtest to see performance metrics.
        </CardContent>
      </Card>
    )
  }

  const latestResult = results[results.length - 1]
  const metrics = latestResult.metrics

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            {metrics.totalReturn >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${metrics.totalReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {(metrics.totalReturn * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalReturn >= 0 ? "Profitable strategy" : "Loss incurred"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {(metrics.maxDrawdown * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Peak to trough decline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.winRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Winning trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Gross profit / loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-muted-foreground mt-1">Executed trades</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Sortino Ratio</div>
              <div className="text-lg font-semibold">{metrics.sortinoRatio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Calmar Ratio</div>
              <div className="text-lg font-semibold">{metrics.calmarRatio.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Trade</div>
              <div className="text-lg font-semibold">${metrics.avgTrade.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Information Ratio</div>
              <div className="text-lg font-semibold">{metrics.informationRatio.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backtest History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{results.length - idx}</Badge>
                  <div>
                    <div className="font-medium">{result.config.symbols.join(", ")}</div>
                    <div className="text-xs text-muted-foreground">{new Date(result.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-semibold ${result.metrics.totalReturn >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {(result.metrics.totalReturn * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Sharpe: {result.metrics.sharpeRatio.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
