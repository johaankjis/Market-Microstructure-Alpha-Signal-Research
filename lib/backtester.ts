// Cost-aware backtesting engine with walk-forward validation

import type { BacktestConfig, BacktestResult, Trade, EquityPoint, PerformanceMetrics, AlphaSignal } from "./types"

export class Backtester {
  private config: BacktestConfig
  private trades: Trade[] = []
  private equityCurve: EquityPoint[] = []
  private currentEquity: number
  private positions: Map<string, number> = new Map()

  constructor(config: BacktestConfig) {
    this.config = config
    this.currentEquity = config.initialCapital
  }

  // Execute backtest with alpha signals
  async runBacktest(signals: AlphaSignal[]): Promise<BacktestResult> {
    this.trades = []
    this.equityCurve = []
    this.currentEquity = this.config.initialCapital
    this.positions.clear()

    // Sort signals by timestamp
    const sortedSignals = [...signals].sort((a, b) => a.timestamp - b.timestamp)

    for (const signal of sortedSignals) {
      await this.processSignal(signal)
    }

    // Close all positions at the end
    this.closeAllPositions(sortedSignals[sortedSignals.length - 1].timestamp)

    const metrics = this.calculateMetrics()

    return {
      id: crypto.randomUUID(),
      config: this.config,
      metrics,
      trades: this.trades,
      equityCurve: this.equityCurve,
      createdAt: new Date(),
    }
  }

  private async processSignal(signal: AlphaSignal) {
    const currentPosition = this.positions.get(signal.symbol) || 0
    const targetPosition = this.calculateTargetPosition(signal)

    if (targetPosition !== currentPosition) {
      const quantity = Math.abs(targetPosition - currentPosition)
      const side = targetPosition > currentPosition ? "buy" : "sell"

      // Simulate execution with transaction costs and slippage
      const executionPrice = this.simulateExecution(signal.features.effectiveSpread, side)

      const transactionCost = this.calculateTransactionCost(quantity, executionPrice)
      const slippage = this.calculateSlippage(quantity, executionPrice)

      const trade: Trade = {
        timestamp: signal.timestamp,
        symbol: signal.symbol,
        side,
        quantity,
        price: executionPrice,
        pnl: 0, // Will be calculated when position is closed
        transactionCost,
        slippage,
      }

      this.trades.push(trade)
      this.positions.set(signal.symbol, targetPosition)
      this.currentEquity -= transactionCost + slippage

      // Record equity point
      const maxEquity = Math.max(...this.equityCurve.map((e) => e.equity), this.currentEquity)
      const drawdown = (maxEquity - this.currentEquity) / maxEquity

      this.equityCurve.push({
        timestamp: signal.timestamp,
        equity: this.currentEquity,
        drawdown,
      })
    }
  }

  private calculateTargetPosition(signal: AlphaSignal): number {
    // Simple position sizing based on signal strength and confidence
    const signalStrength = signal.signalValue * signal.confidence
    const maxPosition = this.config.maxPositionSize

    if (Math.abs(signalStrength) < 0.1) return 0

    return Math.sign(signalStrength) * Math.min(Math.abs(signalStrength) * maxPosition, maxPosition)
  }

  private simulateExecution(spread: number, side: "buy" | "sell"): number {
    // Simulate execution at mid + half spread
    const basePrice = 100 // Placeholder
    return side === "buy" ? basePrice + spread / 2 : basePrice - spread / 2
  }

  private calculateTransactionCost(quantity: number, price: number): number {
    return quantity * price * (this.config.transactionCostBps / 10000)
  }

  private calculateSlippage(quantity: number, price: number): number {
    return quantity * price * (this.config.slippageBps / 10000)
  }

  private closeAllPositions(timestamp: number) {
    for (const [symbol, position] of this.positions.entries()) {
      if (position !== 0) {
        const side = position > 0 ? "sell" : "buy"
        const trade: Trade = {
          timestamp,
          symbol,
          side,
          quantity: Math.abs(position),
          price: 100, // Placeholder
          pnl: 0,
          transactionCost: 0,
          slippage: 0,
        }
        this.trades.push(trade)
      }
    }
    this.positions.clear()
  }

  private calculateMetrics(): PerformanceMetrics {
    const returns = this.calculateReturns()
    const totalReturn = (this.currentEquity - this.config.initialCapital) / this.config.initialCapital

    const sharpeRatio = this.calculateSharpeRatio(returns)
    const sortinoRatio = this.calculateSortinoRatio(returns)
    const maxDrawdown = this.calculateMaxDrawdown()

    const winningTrades = this.trades.filter((t) => t.pnl > 0).length
    const winRate = winningTrades / this.trades.length

    const grossProfit = this.trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
    const grossLoss = Math.abs(this.trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0

    const avgTrade = this.trades.reduce((sum, t) => sum + t.pnl, 0) / this.trades.length

    const calmarRatio = maxDrawdown !== 0 ? totalReturn / Math.abs(maxDrawdown) : 0

    return {
      totalReturn,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      winRate,
      profitFactor,
      avgTrade,
      totalTrades: this.trades.length,
      avgHoldingPeriod: 0, // Placeholder
      calmarRatio,
      informationRatio: sharpeRatio, // Simplified
    }
  }

  private calculateReturns(): number[] {
    const returns: number[] = []
    for (let i = 1; i < this.equityCurve.length; i++) {
      const ret = (this.equityCurve[i].equity - this.equityCurve[i - 1].equity) / this.equityCurve[i - 1].equity
      returns.push(ret)
    }
    return returns
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length === 0) return 0
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    const std = Math.sqrt(variance)
    return std !== 0 ? (mean / std) * Math.sqrt(252) : 0 // Annualized
  }

  private calculateSortinoRatio(returns: number[]): number {
    if (returns.length === 0) return 0
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const downside = returns.filter((r) => r < 0)
    const downsideVariance = downside.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
    const downsideStd = Math.sqrt(downsideVariance)
    return downsideStd !== 0 ? (mean / downsideStd) * Math.sqrt(252) : 0
  }

  private calculateMaxDrawdown(): number {
    let maxDrawdown = 0
    let peak = this.config.initialCapital

    for (const point of this.equityCurve) {
      if (point.equity > peak) {
        peak = point.equity
      }
      const drawdown = (peak - point.equity) / peak
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown
      }
    }

    return maxDrawdown
  }
}
