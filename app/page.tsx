"use client"

import { DataUpload } from "@/components/data-upload"
import { DataSummary } from "@/components/data-summary"
import { SignalGeneratorUI } from "@/components/signal-generator-ui"
import { BacktestConfigUI } from "@/components/backtest-config"
import { BacktestResults } from "@/components/backtest-results"
import { EquityCurveChart } from "@/components/equity-curve-chart"
import { SignalDistributionChart } from "@/components/signal-distribution-chart"
import { FeatureImportanceChart } from "@/components/feature-importance-chart"
import { PerformanceHeatmap } from "@/components/performance-heatmap"
import { LOBSnapshotViewer } from "@/components/lob-snapshot-viewer"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataStore } from "@/lib/data-store"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")

  const handleUploadComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleBacktestComplete = () => {
    setRefreshKey((prev) => prev + 1)
    setActiveTab("results")
  }

  // Get latest data for visualizations
  const [latestResult, setLatestResult] = useState<any>(null)
  const [latestSignals, setLatestSignals] = useState<any[]>([])

  useEffect(() => {
    const results = dataStore.getBacktestResults()
    if (results.length > 0) {
      setLatestResult(results[results.length - 1])
    }

    const symbols = dataStore.getAllSymbols()
    if (symbols.length > 0) {
      setLatestSignals(dataStore.getAlphaSignals(symbols[0]))
    }
  }, [refreshKey])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-balance">Market Microstructure Alpha Signal Research</h1>
          <p className="text-muted-foreground mt-2 text-pretty">
            Professional quantitative finance platform for LOB data analysis, signal engineering, and cost-aware
            backtesting
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <DataSummary key={refreshKey} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Data Upload</TabsTrigger>
            <TabsTrigger value="signals">Signal Engineering</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
            <TabsTrigger value="results">Results & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6 space-y-6">
            <DataUpload onUploadComplete={handleUploadComplete} />
            <LOBSnapshotViewer key={refreshKey} />
          </TabsContent>

          <TabsContent value="signals" className="mt-6 space-y-6">
            <SignalGeneratorUI />
            {latestSignals.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <SignalDistributionChart signals={latestSignals} />
                <FeatureImportanceChart signals={latestSignals} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="backtest" className="mt-6">
            <BacktestConfigUI onBacktestComplete={handleBacktestComplete} />
          </TabsContent>

          <TabsContent value="results" className="mt-6 space-y-6">
            <BacktestResults key={refreshKey} />
            {latestResult && (
              <>
                <EquityCurveChart data={latestResult.equityCurve} initialCapital={latestResult.config.initialCapital} />
                <PerformanceHeatmap results={dataStore.getBacktestResults()} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
