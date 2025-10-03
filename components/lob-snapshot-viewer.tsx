"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { dataStore } from "@/lib/data-store"
import { BookOpen } from "lucide-react"

export function LOBSnapshotViewer() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("")
  const symbols = dataStore.getAllSymbols()

  const snapshots = selectedSymbol ? dataStore.getLOBData(selectedSymbol).slice(-1) : []
  const latestSnapshot = snapshots[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Order Book Snapshot
        </CardTitle>
        <CardDescription>Real-time view of limit order book depth</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
          <SelectTrigger>
            <SelectValue placeholder="Select symbol" />
          </SelectTrigger>
          <SelectContent>
            {symbols.map((symbol) => (
              <SelectItem key={symbol} value={symbol}>
                {symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {latestSnapshot ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="text-sm text-muted-foreground">Mid Price</div>
                <div className="text-2xl font-bold font-mono">${latestSnapshot.midPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Spread</div>
                <div className="text-xl font-semibold font-mono">${latestSnapshot.spread.toFixed(4)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Bids</h4>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-600 dark:text-green-400">
                    Buy
                  </Badge>
                </div>
                <div className="space-y-1">
                  {latestSnapshot.bidPrices.map((price, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-500/5 rounded">
                      <span className="font-mono text-sm">${price.toFixed(2)}</span>
                      <span className="font-mono text-sm text-muted-foreground">{latestSnapshot.bidSizes[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Asks</h4>
                  <Badge variant="secondary" className="bg-red-500/20 text-red-600 dark:text-red-400">
                    Sell
                  </Badge>
                </div>
                <div className="space-y-1">
                  {latestSnapshot.askPrices.map((price, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-red-500/5 rounded">
                      <span className="font-mono text-sm">${price.toFixed(2)}</span>
                      <span className="font-mono text-sm text-muted-foreground">{latestSnapshot.askSizes[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">Select a symbol to view order book</div>
        )}
      </CardContent>
    </Card>
  )
}
