"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { SignalGenerator } from "@/lib/signal-generator"
import type { RegularizationConfig } from "@/lib/types"

export function SignalGeneratorUI() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const [regularizationMethod, setRegularizationMethod] = useState<"lasso" | "ridge" | "elastic-net">("elastic-net")
  const [alpha, setAlpha] = useState(0.1)
  const [l1Ratio, setL1Ratio] = useState(0.5)
  const [maxFeatures, setMaxFeatures] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const symbols = dataStore.getAllSymbols()

  const handleGenerate = async () => {
    if (!selectedSymbol) {
      setStatus("error")
      setMessage("Please select a symbol")
      return
    }

    setGenerating(true)
    setStatus("idle")

    try {
      const snapshots = dataStore.getLOBData(selectedSymbol)

      if (snapshots.length < 100) {
        throw new Error("Need at least 100 snapshots to generate signals")
      }

      const config: RegularizationConfig = {
        method: regularizationMethod,
        alpha,
        l1Ratio: regularizationMethod === "elastic-net" ? l1Ratio : undefined,
        maxFeatures,
      }

      const generator = new SignalGenerator(config)
      const signals = generator.generateSignals(snapshots, `${regularizationMethod}-model`)

      dataStore.addAlphaSignals(selectedSymbol, signals)

      setStatus("success")
      setMessage(`Generated ${signals.length} alpha signals for ${selectedSymbol}`)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to generate signals")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Alpha Signal Engineering
        </CardTitle>
        <CardDescription>
          Extract features from LOB data and generate alpha signals with regularization to prevent overfitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="symbol-select">Select Symbol</Label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol} disabled={generating}>
            <SelectTrigger id="symbol-select">
              <SelectValue placeholder="Choose a symbol" />
            </SelectTrigger>
            <SelectContent>
              {symbols.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No symbols loaded</div>
              ) : (
                symbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-semibold">Regularization Configuration</h4>

          <div className="space-y-2">
            <Label htmlFor="reg-method">Method</Label>
            <Select
              value={regularizationMethod}
              onValueChange={(v) => setRegularizationMethod(v as "lasso" | "ridge" | "elastic-net")}
              disabled={generating}
            >
              <SelectTrigger id="reg-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lasso">Lasso (L1) - Feature Selection</SelectItem>
                <SelectItem value="ridge">Ridge (L2) - Coefficient Shrinkage</SelectItem>
                <SelectItem value="elastic-net">Elastic Net (L1 + L2)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alpha-slider">Alpha (Regularization Strength)</Label>
              <Badge variant="secondary">{alpha.toFixed(3)}</Badge>
            </div>
            <Slider
              id="alpha-slider"
              min={0.001}
              max={1}
              step={0.001}
              value={[alpha]}
              onValueChange={(v) => setAlpha(v[0])}
              disabled={generating}
            />
          </div>

          {regularizationMethod === "elastic-net" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="l1-slider">L1 Ratio</Label>
                <Badge variant="secondary">{l1Ratio.toFixed(2)}</Badge>
              </div>
              <Slider
                id="l1-slider"
                min={0}
                max={1}
                step={0.01}
                value={[l1Ratio]}
                onValueChange={(v) => setL1Ratio(v[0])}
                disabled={generating}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-features">Max Features</Label>
              <Badge variant="secondary">{maxFeatures}</Badge>
            </div>
            <Slider
              id="max-features"
              min={1}
              max={10}
              step={1}
              value={[maxFeatures]}
              onValueChange={(v) => setMaxFeatures(v[0])}
              disabled={generating}
            />
          </div>
        </div>

        <div className="space-y-2 p-4 border rounded-lg bg-accent/10">
          <h4 className="text-sm font-semibold">Features Extracted</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Volume Imbalance</Badge>
            <Badge variant="outline">Depth Imbalance</Badge>
            <Badge variant="outline">Price Imbalance</Badge>
            <Badge variant="outline">Relative Spread</Badge>
            <Badge variant="outline">Microprice Volatility</Badge>
            <Badge variant="outline">Order Flow Toxicity</Badge>
            <Badge variant="outline">VPIN</Badge>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={generating || !selectedSymbol} className="w-full" size="lg">
          <TrendingUp className="mr-2 h-4 w-4" />
          {generating ? "Generating Signals..." : "Generate Alpha Signals"}
        </Button>

        {status !== "idle" && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              status === "success"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
