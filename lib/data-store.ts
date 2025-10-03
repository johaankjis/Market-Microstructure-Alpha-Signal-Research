// In-memory data store for LOB data and backtest results

import type { LOBSnapshot, BacktestResult, AlphaSignal } from "./types"

class DataStore {
  private lobData: Map<string, LOBSnapshot[]> = new Map()
  private backtestResults: BacktestResult[] = []
  private alphaSignals: Map<string, AlphaSignal[]> = new Map()

  // LOB Data methods
  addLOBData(symbol: string, snapshots: LOBSnapshot[]) {
    const existing = this.lobData.get(symbol) || []
    this.lobData.set(symbol, [...existing, ...snapshots])
  }

  getLOBData(symbol: string): LOBSnapshot[] {
    return this.lobData.get(symbol) || []
  }

  getAllSymbols(): string[] {
    return Array.from(this.lobData.keys())
  }

  clearLOBData(symbol?: string) {
    if (symbol) {
      this.lobData.delete(symbol)
    } else {
      this.lobData.clear()
    }
  }

  // Backtest Results methods
  addBacktestResult(result: BacktestResult) {
    this.backtestResults.push(result)
  }

  getBacktestResults(): BacktestResult[] {
    return this.backtestResults
  }

  getBacktestResult(id: string): BacktestResult | undefined {
    return this.backtestResults.find((r) => r.id === id)
  }

  clearBacktestResults() {
    this.backtestResults = []
  }

  // Alpha Signals methods
  addAlphaSignals(symbol: string, signals: AlphaSignal[]) {
    const existing = this.alphaSignals.get(symbol) || []
    this.alphaSignals.set(symbol, [...existing, ...signals])
  }

  getAlphaSignals(symbol: string): AlphaSignal[] {
    return this.alphaSignals.get(symbol) || []
  }

  clearAlphaSignals(symbol?: string) {
    if (symbol) {
      this.alphaSignals.delete(symbol)
    } else {
      this.alphaSignals.clear()
    }
  }

  // Statistics
  getStats() {
    return {
      totalSymbols: this.lobData.size,
      totalSnapshots: Array.from(this.lobData.values()).reduce((sum, arr) => sum + arr.length, 0),
      totalBacktests: this.backtestResults.length,
      totalSignals: Array.from(this.alphaSignals.values()).reduce((sum, arr) => sum + arr.length, 0),
    }
  }
}

export const dataStore = new DataStore()
