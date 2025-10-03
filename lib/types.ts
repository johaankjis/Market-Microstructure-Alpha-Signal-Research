// Core data types for Market Microstructure Alpha Signal Research

export interface LOBSnapshot {
  timestamp: number
  symbol: string
  bidPrices: number[]
  bidSizes: number[]
  askPrices: number[]
  askSizes: number[]
  midPrice: number
  spread: number
}

export interface LOBFeatures {
  timestamp: number
  symbol: string
  // Imbalance features
  volumeImbalance: number
  depthImbalance: number
  priceImbalance: number
  // Spread features
  relativeSpread: number
  effectiveSpread: number
  // Volatility features
  micropriceVolatility: number
  spreadVolatility: number
  // Order flow features
  orderFlowToxicity: number
  vpin: number
}

export interface AlphaSignal {
  timestamp: number
  symbol: string
  signalValue: number
  confidence: number
  features: LOBFeatures
  metadata: {
    model: string
    version: string
  }
}

export interface BacktestConfig {
  startDate: Date
  endDate: Date
  symbols: string[]
  initialCapital: number
  transactionCostBps: number
  slippageBps: number
  maxPositionSize: number
  rebalanceFrequency: "tick" | "second" | "minute"
  walkForwardWindow: number
  validationWindow: number
}

export interface BacktestResult {
  id: string
  config: BacktestConfig
  metrics: PerformanceMetrics
  trades: Trade[]
  equityCurve: EquityPoint[]
  createdAt: Date
}

export interface PerformanceMetrics {
  totalReturn: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
  winRate: number
  profitFactor: number
  avgTrade: number
  totalTrades: number
  avgHoldingPeriod: number
  calmarRatio: number
  informationRatio: number
}

export interface Trade {
  timestamp: number
  symbol: string
  side: "buy" | "sell"
  quantity: number
  price: number
  pnl: number
  transactionCost: number
  slippage: number
}

export interface EquityPoint {
  timestamp: number
  equity: number
  drawdown: number
}

export interface RegularizationConfig {
  method: "lasso" | "ridge" | "elastic-net"
  alpha: number
  l1Ratio?: number
  maxFeatures?: number
}

export interface SignalModel {
  id: string
  name: string
  features: string[]
  regularization: RegularizationConfig
  trainedAt: Date
  performance: PerformanceMetrics
}
