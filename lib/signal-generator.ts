// Alpha signal generation with feature engineering and regularization

import type { LOBSnapshot, LOBFeatures, AlphaSignal, RegularizationConfig } from "./types"
import { LOBProcessor } from "./lob-processor"

export class SignalGenerator {
  private processor: LOBProcessor
  private regularization: RegularizationConfig

  constructor(regularization: RegularizationConfig) {
    this.processor = new LOBProcessor()
    this.regularization = regularization
  }

  // Generate alpha signals from LOB snapshots
  generateSignals(snapshots: LOBSnapshot[], modelName = "default"): AlphaSignal[] {
    const signals: AlphaSignal[] = []

    // Need historical context for feature extraction
    for (let i = 50; i < snapshots.length; i++) {
      const currentSnapshot = snapshots[i]
      const historicalSnapshots = snapshots.slice(0, i)

      // Extract features
      const features = this.processor.extractFeatures(currentSnapshot, historicalSnapshots)

      // Apply regularization and generate signal
      const signalValue = this.calculateSignal(features)
      const confidence = this.calculateConfidence(features)

      const signal: AlphaSignal = {
        timestamp: currentSnapshot.timestamp,
        symbol: currentSnapshot.symbol,
        signalValue,
        confidence,
        features,
        metadata: {
          model: modelName,
          version: "1.0.0",
        },
      }

      signals.push(signal)
    }

    return signals
  }

  // Calculate signal value using regularized feature combination
  private calculateSignal(features: LOBFeatures): number {
    // Feature weights (would be learned from data in production)
    const weights = this.getFeatureWeights()

    // Combine features with regularization
    let signal = 0
    signal += weights.volumeImbalance * features.volumeImbalance
    signal += weights.depthImbalance * features.depthImbalance
    signal += weights.priceImbalance * features.priceImbalance
    signal += weights.relativeSpread * features.relativeSpread
    signal += weights.micropriceVolatility * features.micropriceVolatility
    signal += weights.orderFlowToxicity * features.orderFlowToxicity
    signal += weights.vpin * features.vpin

    // Apply regularization penalty
    signal = this.applyRegularization(signal, weights)

    // Normalize to [-1, 1]
    return Math.tanh(signal)
  }

  // Get feature weights based on regularization method
  private getFeatureWeights(): Record<string, number> {
    // Simplified weights - in production these would be learned
    const baseWeights = {
      volumeImbalance: 0.3,
      depthImbalance: 0.25,
      priceImbalance: 0.2,
      relativeSpread: -0.15,
      micropriceVolatility: -0.1,
      orderFlowToxicity: 0.15,
      vpin: 0.1,
    }

    // Apply regularization to weights
    if (this.regularization.method === "lasso") {
      return this.applyLasso(baseWeights)
    } else if (this.regularization.method === "ridge") {
      return this.applyRidge(baseWeights)
    } else {
      return this.applyElasticNet(baseWeights)
    }
  }

  // Lasso regularization (L1) - promotes sparsity
  private applyLasso(weights: Record<string, number>): Record<string, number> {
    const alpha = this.regularization.alpha
    const regularized: Record<string, number> = {}

    for (const [key, value] of Object.entries(weights)) {
      // Soft thresholding
      if (Math.abs(value) < alpha) {
        regularized[key] = 0
      } else {
        regularized[key] = Math.sign(value) * (Math.abs(value) - alpha)
      }
    }

    return regularized
  }

  // Ridge regularization (L2) - shrinks coefficients
  private applyRidge(weights: Record<string, number>): Record<string, number> {
    const alpha = this.regularization.alpha
    const regularized: Record<string, number> = {}

    for (const [key, value] of Object.entries(weights)) {
      regularized[key] = value / (1 + alpha)
    }

    return regularized
  }

  // Elastic Net regularization (L1 + L2)
  private applyElasticNet(weights: Record<string, number>): Record<string, number> {
    const alpha = this.regularization.alpha
    const l1Ratio = this.regularization.l1Ratio || 0.5

    // First apply L1
    const regularized = this.applyLasso(weights)

    // Then apply L2
    const l2Alpha = alpha * (1 - l1Ratio)
    for (const [key, value] of Object.entries(regularized)) {
      regularized[key] = value / (1 + l2Alpha)
    }

    return regularized
  }

  // Apply regularization penalty to signal
  private applyRegularization(signal: number, weights: Record<string, number>): number {
    const alpha = this.regularization.alpha

    if (this.regularization.method === "lasso") {
      // L1 penalty
      const l1Norm = Object.values(weights).reduce((sum, w) => sum + Math.abs(w), 0)
      return signal - alpha * l1Norm
    } else if (this.regularization.method === "ridge") {
      // L2 penalty
      const l2Norm = Math.sqrt(Object.values(weights).reduce((sum, w) => sum + w * w, 0))
      return signal - alpha * l2Norm
    } else {
      // Elastic Net
      const l1Ratio = this.regularization.l1Ratio || 0.5
      const l1Norm = Object.values(weights).reduce((sum, w) => sum + Math.abs(w), 0)
      const l2Norm = Math.sqrt(Object.values(weights).reduce((sum, w) => sum + w * w, 0))
      return signal - alpha * (l1Ratio * l1Norm + (1 - l1Ratio) * l2Norm)
    }
  }

  // Calculate confidence based on feature quality
  private calculateConfidence(features: LOBFeatures): number {
    // Higher confidence when:
    // - Strong imbalances
    // - Low volatility
    // - Low spread
    // - High VPIN

    const imbalanceStrength = Math.abs(features.volumeImbalance) + Math.abs(features.depthImbalance)
    const spreadQuality = 1 - Math.min(features.relativeSpread * 100, 1)
    const volatilityQuality = 1 - Math.min(features.micropriceVolatility * 10, 1)
    const vpinStrength = features.vpin

    const confidence =
      (imbalanceStrength * 0.4 + spreadQuality * 0.3 + volatilityQuality * 0.2 + vpinStrength * 0.1) / 2

    return Math.min(Math.max(confidence, 0), 1)
  }

  // Walk-forward feature selection
  selectFeatures(features: LOBFeatures[], targetReturns: number[]): string[] {
    // Simplified feature selection based on correlation
    const featureNames = [
      "volumeImbalance",
      "depthImbalance",
      "priceImbalance",
      "relativeSpread",
      "micropriceVolatility",
      "orderFlowToxicity",
      "vpin",
    ]

    const correlations = featureNames.map((name) => {
      const featureValues = features.map((f) => f[name as keyof LOBFeatures] as number)
      return {
        name,
        correlation: Math.abs(this.calculateCorrelation(featureValues, targetReturns)),
      }
    })

    // Sort by correlation and select top features
    correlations.sort((a, b) => b.correlation - a.correlation)

    const maxFeatures = this.regularization.maxFeatures || 5
    return correlations.slice(0, maxFeatures).map((c) => c.name)
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length)
    if (n === 0) return 0

    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = y.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denomX = 0
    let denomY = 0

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX
      const dy = y[i] - meanY
      numerator += dx * dy
      denomX += dx * dx
      denomY += dy * dy
    }

    const denom = Math.sqrt(denomX * denomY)
    return denom === 0 ? 0 : numerator / denom
  }
}
