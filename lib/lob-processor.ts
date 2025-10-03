// Limit Order Book data processing utilities

import type { LOBSnapshot, LOBFeatures } from "./types"

export class LOBProcessor {
  private snapshots: LOBSnapshot[] = []

  addSnapshot(snapshot: LOBSnapshot) {
    this.snapshots.push(snapshot)
  }

  addSnapshots(snapshots: LOBSnapshot[]) {
    this.snapshots.push(...snapshots)
  }

  getSnapshots(): LOBSnapshot[] {
    return this.snapshots
  }

  clearSnapshots() {
    this.snapshots = []
  }

  // Calculate volume-weighted imbalance
  calculateVolumeImbalance(snapshot: LOBSnapshot, levels = 5): number {
    const bidVolume = snapshot.bidSizes.slice(0, levels).reduce((a, b) => a + b, 0)
    const askVolume = snapshot.askSizes.slice(0, levels).reduce((a, b) => a + b, 0)
    return (bidVolume - askVolume) / (bidVolume + askVolume)
  }

  // Calculate depth imbalance
  calculateDepthImbalance(snapshot: LOBSnapshot, levels = 5): number {
    const bidDepth = snapshot.bidSizes.slice(0, levels).reduce((sum, size, i) => {
      return sum + size * snapshot.bidPrices[i]
    }, 0)
    const askDepth = snapshot.askSizes.slice(0, levels).reduce((sum, size, i) => {
      return sum + size * snapshot.askPrices[i]
    }, 0)
    return (bidDepth - askDepth) / (bidDepth + askDepth)
  }

  // Calculate microprice
  calculateMicroprice(snapshot: LOBSnapshot): number {
    const bestBid = snapshot.bidPrices[0]
    const bestAsk = snapshot.askPrices[0]
    const bidSize = snapshot.bidSizes[0]
    const askSize = snapshot.askSizes[0]
    return (bestBid * askSize + bestAsk * bidSize) / (bidSize + askSize)
  }

  // Calculate relative spread
  calculateRelativeSpread(snapshot: LOBSnapshot): number {
    return snapshot.spread / snapshot.midPrice
  }

  // Calculate VPIN (Volume-Synchronized Probability of Informed Trading)
  calculateVPIN(snapshots: LOBSnapshot[], window = 50): number {
    if (snapshots.length < window) return 0

    const recentSnapshots = snapshots.slice(-window)
    let buyVolume = 0
    let sellVolume = 0

    for (let i = 1; i < recentSnapshots.length; i++) {
      const priceDiff = recentSnapshots[i].midPrice - recentSnapshots[i - 1].midPrice
      const volume = recentSnapshots[i].bidSizes[0] + recentSnapshots[i].askSizes[0]

      if (priceDiff > 0) {
        buyVolume += volume
      } else if (priceDiff < 0) {
        sellVolume += volume
      }
    }

    const totalVolume = buyVolume + sellVolume
    return totalVolume > 0 ? Math.abs(buyVolume - sellVolume) / totalVolume : 0
  }

  // Extract all features from a snapshot
  extractFeatures(snapshot: LOBSnapshot, historicalSnapshots: LOBSnapshot[]): LOBFeatures {
    const volumeImbalance = this.calculateVolumeImbalance(snapshot)
    const depthImbalance = this.calculateDepthImbalance(snapshot)
    const microprice = this.calculateMicroprice(snapshot)
    const priceImbalance = (microprice - snapshot.midPrice) / snapshot.midPrice
    const relativeSpread = this.calculateRelativeSpread(snapshot)

    // Calculate volatility over recent window
    const recentSnapshots = historicalSnapshots.slice(-20)
    const micropriceVolatility = this.calculateVolatility(recentSnapshots.map((s) => this.calculateMicroprice(s)))
    const spreadVolatility = this.calculateVolatility(recentSnapshots.map((s) => s.spread))

    const vpin = this.calculateVPIN(historicalSnapshots)

    return {
      timestamp: snapshot.timestamp,
      symbol: snapshot.symbol,
      volumeImbalance,
      depthImbalance,
      priceImbalance,
      relativeSpread,
      effectiveSpread: snapshot.spread,
      micropriceVolatility,
      spreadVolatility,
      orderFlowToxicity: Math.abs(volumeImbalance) * relativeSpread,
      vpin,
    }
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  // Parse CSV data into LOB snapshots
  static parseCSV(csvData: string): LOBSnapshot[] {
    const lines = csvData.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())
    const snapshots: LOBSnapshot[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length < headers.length) continue

      const snapshot: LOBSnapshot = {
        timestamp: Number.parseFloat(values[0]),
        symbol: values[1],
        bidPrices: [
          Number.parseFloat(values[2]),
          Number.parseFloat(values[3]),
          Number.parseFloat(values[4]),
          Number.parseFloat(values[5]),
          Number.parseFloat(values[6]),
        ],
        bidSizes: [
          Number.parseFloat(values[7]),
          Number.parseFloat(values[8]),
          Number.parseFloat(values[9]),
          Number.parseFloat(values[10]),
          Number.parseFloat(values[11]),
        ],
        askPrices: [
          Number.parseFloat(values[12]),
          Number.parseFloat(values[13]),
          Number.parseFloat(values[14]),
          Number.parseFloat(values[15]),
          Number.parseFloat(values[16]),
        ],
        askSizes: [
          Number.parseFloat(values[17]),
          Number.parseFloat(values[18]),
          Number.parseFloat(values[19]),
          Number.parseFloat(values[20]),
          Number.parseFloat(values[21]),
        ],
        midPrice: Number.parseFloat(values[22]),
        spread: Number.parseFloat(values[23]),
      }

      snapshots.push(snapshot)
    }

    return snapshots
  }
}
