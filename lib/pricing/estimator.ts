/**
 * Dynamic Price Estimator
 * 
 * Estimates prices for devices that don't have exact matches in pricing table
 * Uses device age, model family, and market patterns
 */

import { PricingCondition, type Device } from "./types"
import { Currency } from "./currency"

interface PriceEstimate {
  price: number
  currency: Currency
  confidence: "high" | "medium" | "low"
  explanation: string
}

/**
 * Base prices for product families (approximate market values)
 * These are fallback estimates when no pricing data exists
 */
const BASE_PRICES: Record<string, Record<string, number>> = {
  iPhone: {
    "NEW": 800,
    "EXCELLENT": 650,
    "GOOD": 500,
    "FAIR": 350,
    "POOR": 200,
  },
  iPad: {
    "NEW": 600,
    "EXCELLENT": 480,
    "GOOD": 360,
    "FAIR": 240,
    "POOR": 120,
  },
  Mac: {
    "NEW": 1200,
    "EXCELLENT": 960,
    "GOOD": 720,
    "FAIR": 480,
    "POOR": 240,
  },
  "Apple Watch": {
    "NEW": 400,
    "EXCELLENT": 320,
    "GOOD": 240,
    "FAIR": 160,
    "POOR": 80,
  },
}

/**
 * Storage multipliers (how storage affects price)
 */
const STORAGE_MULTIPLIERS: Record<string, number> = {
  "64GB": 0.85,
  "128GB": 1.0,
  "256GB": 1.15,
  "512GB": 1.35,
  "1TB": 1.6,
  "2TB": 2.0,
}

/**
 * Model generation multipliers (newer models worth more)
 * Detects model year/generation from deviceModel string
 * This makes the system dynamic - handles ANY device model
 */
function getModelMultiplier(deviceModel: string | null): number {
  if (!deviceModel) return 0.75 // Unknown model - use conservative estimate

  const model = deviceModel.toLowerCase()

  // iPhone generation detection (handles any iPhone model)
  if (model.includes("15")) return 1.0 // Latest
  if (model.includes("14")) return 0.85
  if (model.includes("13")) return 0.70
  if (model.includes("12")) return 0.55
  if (model.includes("11")) return 0.40
  if (model.includes("x") && !model.includes("xs") && !model.includes("max")) return 0.30 // iPhone X
  if (model.includes("8")) return 0.25
  if (model.includes("7")) return 0.20
  if (model.includes("6")) return 0.15
  // Any other iPhone gets 0.35 (older/unknown)

  // iPad generation detection
  if (model.includes("m5") || model.includes("m4")) return 1.0
  if (model.includes("m3")) return 0.85
  if (model.includes("m2")) return 0.70
  if (model.includes("m1")) return 0.55
  // Any other iPad gets 0.60

  // Mac generation detection
  if (model.includes("m3")) return 1.0
  if (model.includes("m2")) return 0.85
  if (model.includes("m1")) return 0.70
  if (model.includes("intel") || model.includes("2020") || model.includes("2019") || model.includes("2018")) return 0.50
  // Any other Mac gets 0.65

  // Default for completely unknown models
  return 0.60
}

/**
 * Estimate price for a device when no pricing data exists
 */
export function estimateDevicePrice(
  device: Device,
  currency: Currency = Currency.USD
): PriceEstimate {
  // Never use NEW condition for resale - if NEW is requested, fall back to EXCELLENT
  // All devices in inventory are used devices
  let condition = device.condition || PricingCondition.EXCELLENT
  if (condition === PricingCondition.NEW) {
    condition = PricingCondition.EXCELLENT // Use excellent (like-new resale price)
  }
  const productFamily = device.productFamily || "Mac" // Default fallback

  // Get base price for product family and condition
  const familyPrices = BASE_PRICES[productFamily] || BASE_PRICES["Mac"]
  const basePrice = familyPrices[condition] || familyPrices["GOOD"]

  // Apply storage multiplier
  const storage = device.storage || "256GB"
  const storageMultiplier = STORAGE_MULTIPLIERS[storage] || 1.0

  // Apply model generation multiplier
  const modelMultiplier = getModelMultiplier(device.deviceModel)

  // Calculate estimated price
  const estimatedPrice = basePrice * storageMultiplier * modelMultiplier

  // Determine confidence
  let confidence: "high" | "medium" | "low" = "low"
  let explanation = `Estimated price for ${device.deviceModel || productFamily}`

  if (device.deviceModel && device.storage) {
    confidence = "medium"
    explanation = `Estimated: ${device.deviceModel} ${device.storage} (${condition.toLowerCase()}) - based on ${productFamily} family pricing`
  } else if (device.productFamily) {
    explanation = `Estimated: ${productFamily} (${condition.toLowerCase()}) - family fallback pricing`
  } else {
    explanation = `Estimated: Generic device (${condition.toLowerCase()}) - low confidence estimate`
  }

  return {
    price: Math.round(estimatedPrice),
    currency,
    confidence,
    explanation: `${explanation} [ESTIMATE - Add pricing data for accurate value]`,
  }
}

/**
 * Check if device is older (for depreciation)
 */
function getDeviceAge(device: Device): number {
  // Try to extract year from deviceModel or use purchase date
  if (device.deviceModel) {
    const yearMatch = device.deviceModel.match(/(20\d{2})/)
    if (yearMatch) {
      const deviceYear = parseInt(yearMatch[1])
      const currentYear = new Date().getFullYear()
      return currentYear - deviceYear
    }
  }
  return 0 // Unknown age
}
