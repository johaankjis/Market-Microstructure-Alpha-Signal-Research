"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { useEffect, useState } from "react"

export function DataSummary() {
  const [stats, setStats] = useState({
    totalSymbols: 0,
    totalSnapshots: 0,
    totalBacktests: 0,
    totalSignals: 0,
  })

  const [symbols, setSymbols] = useState<string[]>([])

  useEffect(() => {
    const updateStats = () => {
      setStats(dataStore.getStats())
      setSymbols(dataStore.getAllSymbols())
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Symbols Loaded</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSymbols}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {symbols.map((symbol) => (
              <Badge key={symbol} variant="secondary" className="text-xs">
                {symbol}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">LOB Snapshots</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSnapshots.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Total data points</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alpha Signals</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSignals.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">Generated signals</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Backtests</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBacktests}</div>
          <p className="text-xs text-muted-foreground mt-1">Completed runs</p>
        </CardContent>
      </Card>
    </div>
  )
}
