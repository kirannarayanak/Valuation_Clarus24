/**
 * Pricing Providers
 * 
 * Provider abstraction for different pricing sources
 */

import {
  PricingProvider,
  PricingCondition,
  type Device,
  type PricingCandidate,
} from "./types"
import { matchPricing } from "./matcher"

export interface IPricingProvider {
  name: PricingProvider
  getPrice(device: Device): Promise<PricingCandidate[]>
}

/**
 * Manual Pricing Provider
 * Reads from Pricing table where provider="MANUAL"
 * Fully implemented and used as primary pricing source
 */
export class ManualPricingProvider implements IPricingProvider {
  name = PricingProvider.MANUAL

  async getPrice(device: Device): Promise<PricingCandidate[]> {
    const candidate = await matchPricing(device, PricingProvider.MANUAL)
    return candidate ? [candidate] : []
  }
}

/**
 * Apple Trade-In Provider (STUB)
 * 
 * IMPORTANT: This is a stub implementation.
 * Do NOT claim any official Apple API integration.
 * Returns empty results or clearly labeled as requiring manual/authorized source.
 */
export class AppleTradeInProvider implements IPricingProvider {
  name = PricingProvider.APPLE_TRADEIN

  async getPrice(device: Device): Promise<PricingCandidate[]> {
    // Stub implementation - returns empty
    // In production, this would require:
    // - Authorized integration agreement with Apple
    // - Official API access
    // - Or manual data entry
    
    // For now, try to match from Pricing table where provider="APPLE_TRADEIN"
    // This allows manual entry of Apple Trade-In estimates
    const candidate = await matchPricing(device, PricingProvider.APPLE_TRADEIN)
    
    if (candidate) {
      // Override explanation to clearly label as estimate
      candidate.explanation = `Apple Trade-In Estimate (manual or authorized source required): ${candidate.explanation}`
      return [candidate]
    }
    
    return []
  }
}

/**
 * Market Pricing Provider
 * Reads from Pricing table where provider="MARKET"
 * Designed to ingest CSV or admin-entered market values
 */
export class MarketPricingProvider implements IPricingProvider {
  name = PricingProvider.MARKET

  async getPrice(device: Device): Promise<PricingCandidate[]> {
    const candidate = await matchPricing(device, PricingProvider.MARKET)
    return candidate ? [candidate] : []
  }
}

/**
 * Provider Registry
 */
export const pricingProviders: Record<PricingProvider, IPricingProvider> = {
  [PricingProvider.MANUAL]: new ManualPricingProvider(),
  [PricingProvider.APPLE_TRADEIN]: new AppleTradeInProvider(),
  [PricingProvider.MARKET]: new MarketPricingProvider(),
}
