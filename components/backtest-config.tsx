"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { Backtester } from "@/lib/backtester"
import type { BacktestConfig } from "@/lib/types"

interface BacktestConfigProps {
  onBacktestComplete?: (resultId: string) => void
}

export function BacktestConfigUI({ onBacktestComplete }: BacktestConfigProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const [initialCapital, setInitialCapital] = useState(100000)
  const [transactionCostBps, setTransactionCostBps] = useState(5)
  const [slippageBps, setSlippageBps] = useState(2)
  const [maxPositionSize, setMaxPositionSize] = useState(1000)
  const [rebalanceFrequency, setRebalanceFrequency] = useState<"tick" | "second" | "minute">("tick")
  const [walkForwardWindow, setWalkForwardWindow] = useState(1000)
  const [validationWindow, setValidationWindow] = useState(200)
  const [running, setRunning] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const symbols = dataStore.getAllSymbols()

  const handleRunBacktest = async () => {
    if (!selectedSymbol) {
      setStatus("error")
      setMessage("Please select a symbol")
      return
    }

    setRunning(true)
    setStatus("idle")

    try {
      const signals = dataStore.getAlphaSignals(selectedSymbol)

      if (signals.length === 0) {
        throw new Error("No signals found. Please generate signals first.")
      }

      const config: BacktestConfig = {
        startDate: new Date(signals[0].timestamp),
        endDate: new Date(signals[signals.length - 1].timestamp),
        symbols: [selectedSymbol],
        initialCapital,
        transactionCostBps,
        slippageBps,
        maxPositionSize,
        rebalanceFrequency,
        walkForwardWindow,
        validationWindow,
      }

      const backtester = new Backtester(config)
      const result = await backtester.runBacktest(signals)

      dataStore.addBacktestResult(result)

      setStatus("success")
      setMessage(
        `Backtest complete! Total Return: ${(result.metrics.totalReturn * 100).toFixed(2)}%, Sharpe: ${result.metrics.sharpeRatio.toFixed(2)}`,
      )

      onBacktestComplete?.(result.id)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Backtest failed")
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Cost-Aware Backtesting
        </CardTitle>
        <CardDescription>
          Run walk-forward validation with realistic transaction costs and slippage modeling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="backtest-symbol">Select Symbol</Label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol} disabled={running}>
            <SelectTrigger id="backtest-symbol">
              <SelectValue placeholder="Choose a symbol" />
            </SelectTrigger>
            <SelectContent>
              {symbols.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">No symbols loaded</div>
              ) : (
                symbols.map((symbol) => {
                  const signalCount = dataStore.getAlphaSignals(symbol).length
                  return (
                    <SelectItem key={symbol} value={symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{symbol}</span>
                        <Badge variant="secondary" className="ml-2">
                          {signalCount} signals
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="initial-capital">Initial Capital ($)</Label>
            <Input
              id="initial-capital"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              disabled={running}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-position">Max Position Size</Label>
            <Input
              id="max-position"
              type="number"
              value={maxPositionSize}
              onChange={(e) => setMaxPositionSize(Number(e.target.value))}
              disabled={running}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <h4 className="text-sm font-semibold">Transaction Costs</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="txn-cost">Transaction Cost (bps)</Label>
              <Badge variant="secondary">{transactionCostBps} bps</Badge>
            </div>
            <Slider
              id="txn-cost"
              min={0}
              max={20}
              step={0.5}
              value={[transactionCostBps]}
              onValueChange={(v) => setTransactionCostBps(v[0])}
              disabled={running}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slippage">Slippage (bps)</Label>
              <Badge variant="secondary">{slippageBps} bps</Badge>
            </div>
            <Slider
              id="slippage"
              min={0}
              max={10}
              step={0.5}
              value={[slippageBps]}
              onValueChange={(v) => setSlippageBps(v[0])}
              disabled={running}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 border rounded-lg bg-accent/10">
          <h4 className="text-sm font-semibold">Walk-Forward Validation</h4>

          <div className="space-y-2">
            <Label htmlFor="rebalance">Rebalance Frequency</Label>
            <Select
              value={rebalanceFrequency}
              onValueChange={(v) => setRebalanceFrequency(v as "tick" | "second" | "minute")}
              disabled={running}
            >
              <SelectTrigger id="rebalance">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tick">Every Tick</SelectItem>
                <SelectItem value="second">Every Second</SelectItem>
                <SelectItem value="minute">Every Minute</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="train-window">Training Window</Label>
              <Input
                id="train-window"
                type="number"
                value={walkForwardWindow}
                onChange={(e) => setWalkForwardWindow(Number(e.target.value))}
                disabled={running}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="val-window">Validation Window</Label>
              <Input
                id="val-window"
                type="number"
                value={validationWindow}
                onChange={(e) => setValidationWindow(Number(e.target.value))}
                disabled={running}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleRunBacktest} disabled={running || !selectedSymbol} className="w-full" size="lg">
          {running ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Backtest...
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Backtest
            </>
          )}
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
