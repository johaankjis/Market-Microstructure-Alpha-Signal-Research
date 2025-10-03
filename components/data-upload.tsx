"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { LOBProcessor } from "@/lib/lob-processor"
import { dataStore } from "@/lib/data-store"
import type { LOBSnapshot } from "@/lib/types"

interface DataUploadProps {
  onUploadComplete?: (symbol: string, snapshots: LOBSnapshot[]) => void
}

export function DataUpload({ onUploadComplete }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [symbol, setSymbol] = useState("")
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setStatus("idle")
      setMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file || !symbol) {
      setStatus("error")
      setMessage("Please select a file and enter a symbol")
      return
    }

    setUploading(true)
    setStatus("idle")

    try {
      const text = await file.text()
      const snapshots = LOBProcessor.parseCSV(text)

      if (snapshots.length === 0) {
        throw new Error("No valid data found in file")
      }

      // Store in data store
      dataStore.addLOBData(symbol, snapshots)

      setStatus("success")
      setMessage(`Successfully uploaded ${snapshots.length} snapshots for ${symbol}`)

      // Reset form
      setFile(null)
      setSymbol("")

      // Callback
      onUploadComplete?.(symbol, snapshots)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Failed to upload data")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload LOB Data
        </CardTitle>
        <CardDescription>
          Upload CSV files containing limit order book snapshots. Expected format: timestamp, symbol, bid_prices (5
          levels), bid_sizes (5 levels), ask_prices (5 levels), ask_sizes (5 levels), mid_price, spread
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            placeholder="e.g., AAPL, BTC-USD"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">CSV File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
            {file && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleUpload} disabled={uploading || !file || !symbol} className="w-full">
          {uploading ? "Uploading..." : "Upload Data"}
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

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">CSV Format Example:</h4>
          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
            {`timestamp,symbol,bid1,bid2,bid3,bid4,bid5,bidsize1,bidsize2,bidsize3,bidsize4,bidsize5,ask1,ask2,ask3,ask4,ask5,asksize1,asksize2,asksize3,asksize4,asksize5,mid_price,spread
1609459200000,AAPL,132.50,132.49,132.48,132.47,132.46,100,150,200,120,80,132.52,132.53,132.54,132.55,132.56,90,140,180,110,70,132.51,0.02`}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
