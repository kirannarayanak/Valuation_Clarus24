/**
 * Pricing Engine Types
 * 
 * Core types for the pricing system
 */

import { Currency } from "./currency"

export enum PricingProvider {
  MANUAL = "MANUAL",
  APPLE_TRADEIN = "APPLE_TRADEIN",
  MARKET = "MARKET",
}

export enum PricingCondition {
  NEW = "NEW",
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
  POOR = "POOR",
}

export enum PricingMatchLevel {
  EXACT = "EXACT",
  NO_STORAGE = "NO_STORAGE",
  FAMILY_FALLBACK = "FAMILY_FALLBACK",
  NONE = "NONE",
}

export interface Device {
  deviceId: string
  productFamily: string | null
  deviceModel: string | null
  productType: string | null
  storage: string | null
  condition?: PricingCondition
  region?: string
}

export interface PricingCandidate {
  id: string
  provider: PricingProvider
  productFamily: string
  productType: string | null
  deviceModel: string | null
  storage: string | null
  condition: PricingCondition
  region: string
  price: number
  currency: Currency
  matchLevel: PricingMatchLevel
  explanation: string
}

export interface PricingResult {
  price: number
  currency: Currency
  displayPrice?: number
  displayCurrency?: Currency
  provider: PricingProvider
  matchLevel: PricingMatchLevel
  explanation: string
}
