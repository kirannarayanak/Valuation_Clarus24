/**
 * Pricing Matcher
 * 
 * Implements strict matching logic for pricing entries
 * Matches in order: EXACT → NO_STORAGE → FAMILY_FALLBACK → NONE
 */

import { prisma } from "@/lib/db"
import {
  PricingMatchLevel,
  PricingCondition,
  PricingProvider,
  type Device,
  type PricingCandidate,
} from "./types"

/**
 * Match pricing for a device with strict priority order
 */
export async function matchPricing(
  device: Device,
  provider: PricingProvider = PricingProvider.MANUAL
): Promise<PricingCandidate | null> {
  // Never use NEW condition for resale - if NEW is requested, fall back to EXCELLENT
  // Once a device is purchased, it's used, so always use resale conditions
  let condition = device.condition || PricingCondition.EXCELLENT
  if (condition === PricingCondition.NEW) {
    condition = PricingCondition.EXCELLENT // Fall back to excellent (like-new resale price)
  }
  const region = device.region || "US"

  // Try EXACT match: productFamily + deviceModel + storage + condition + region
  // Build where clause conditionally to handle null values
  const exactWhere: any = {
    provider: provider as any,
    condition: condition as any,
    region,
    effectiveDate: { lte: new Date() },
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  }
  
  if (device.productFamily) exactWhere.productFamily = device.productFamily
  if (device.deviceModel) exactWhere.deviceModel = device.deviceModel
  if (device.storage) exactWhere.storage = device.storage
  
  let pricing = await prisma.pricing.findFirst({
    where: exactWhere,
    orderBy: { effectiveDate: "desc" },
  })

  if (pricing) {
    return {
      id: pricing.id,
      provider: pricing.provider as PricingProvider,
      productFamily: pricing.productFamily,
      productType: pricing.productType,
      deviceModel: pricing.deviceModel,
      storage: pricing.storage,
      condition: pricing.condition as PricingCondition,
      region: pricing.region,
      price: Number(pricing.price),
      currency: pricing.currency as any,
      matchLevel: PricingMatchLevel.EXACT,
      explanation: `Matched ${pricing.deviceModel || pricing.productFamily} ${pricing.storage || ""} – ${pricing.condition.toLowerCase()} – ${pricing.region}`.trim(),
    }
  }

  // Try NO_STORAGE match: productFamily + deviceModel + condition + region (no storage)
  const noStorageWhere: any = {
    provider: provider as any,
    storage: null,
    condition: condition as any,
    region,
    effectiveDate: { lte: new Date() },
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  }
  
  if (device.productFamily) noStorageWhere.productFamily = device.productFamily
  if (device.deviceModel) noStorageWhere.deviceModel = device.deviceModel
  
  pricing = await prisma.pricing.findFirst({
    where: noStorageWhere,
    orderBy: { effectiveDate: "desc" },
  })

  if (pricing) {
    return {
      id: pricing.id,
      provider: pricing.provider as PricingProvider,
      productFamily: pricing.productFamily,
      productType: pricing.productType,
      deviceModel: pricing.deviceModel,
      storage: pricing.storage,
      condition: pricing.condition as PricingCondition,
      region: pricing.region,
      price: Number(pricing.price),
      currency: pricing.currency as any,
      matchLevel: PricingMatchLevel.NO_STORAGE,
      explanation: `Matched ${pricing.deviceModel || pricing.productFamily} (any storage) – ${pricing.condition.toLowerCase()} – ${pricing.region}`,
    }
  }

  // Try FAMILY_FALLBACK match: productFamily + condition + region (no model, no storage)
  // Only try if we have a productFamily
  if (device.productFamily) {
    pricing = await prisma.pricing.findFirst({
      where: {
        provider: provider as any,
        productFamily: device.productFamily,
        deviceModel: null,
        productType: null,
        storage: null,
        condition: condition as any,
        region,
        effectiveDate: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { effectiveDate: "desc" },
    })
  }

  if (pricing) {
    return {
      id: pricing.id,
      provider: pricing.provider as PricingProvider,
      productFamily: pricing.productFamily,
      productType: pricing.productType,
      deviceModel: pricing.deviceModel,
      storage: pricing.storage,
      condition: pricing.condition as PricingCondition,
      region: pricing.region,
      price: Number(pricing.price),
      currency: pricing.currency as any,
      matchLevel: PricingMatchLevel.FAMILY_FALLBACK,
      explanation: `Matched ${pricing.productFamily} (family fallback) – ${pricing.condition.toLowerCase()} – ${pricing.region}`,
    }
  }

  // NONE - No match found
  return null
}
