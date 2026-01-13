/**
 * Pricing Engine
 * 
 * Main pricing calculation engine
 * Exposes calculatePricingForDevice function
 */

import { prisma } from "@/lib/db"
import { pricingProviders } from "./providers"
import { convertCurrency, Currency } from "./currency"
import { estimateDevicePrice } from "./estimator"
import {
  PricingProvider,
  PricingMatchLevel,
  type Device,
  type PricingResult,
} from "./types"

/**
 * Calculate pricing for a single device
 * 
 * @param device - Device object with pricing-relevant fields
 * @param displayCurrency - Optional currency to convert price to (defaults to original currency)
 * @param databaseDeviceId - Optional database ID of the device (for saving PricingResult). If not provided, uses device.deviceId
 * @returns PricingResult with price, currency, provider, matchLevel, and explanation
 */
export async function calculatePricingForDevice(
  device: Device,
  displayCurrency?: Currency,
  databaseDeviceId?: string
): Promise<PricingResult> {
  // Use database ID if provided, otherwise fall back to device.deviceId
  const deviceIdForDb = databaseDeviceId || device.deviceId
  
  console.log(`[Pricing Engine] Starting calculation for device ${device.deviceId} (DB ID: ${deviceIdForDb})`)
  console.log(`[Pricing Engine] Device data: family=${device.productFamily}, model=${device.deviceModel}, storage=${device.storage}, condition=${device.condition}`)
  
  // Try providers in order: MANUAL → MARKET → APPLE_TRADEIN
  const providerOrder = [
    PricingProvider.MANUAL,
    PricingProvider.MARKET,
    PricingProvider.APPLE_TRADEIN,
  ]

  for (const providerName of providerOrder) {
    const provider = pricingProviders[providerName]
    if (!provider) {
      console.log(`[Pricing Engine] Provider ${providerName} not found, skipping`)
      continue
    }

    try {
      console.log(`[Pricing Engine] Trying provider: ${providerName}`)
      const candidates = await provider.getPrice(device)
      console.log(`[Pricing Engine] Provider ${providerName} returned ${candidates.length} candidates`)
      
      if (candidates.length > 0) {
      // Use the first candidate (highest priority match)
      const candidate = candidates[0]
      
      // Calculate display price if display currency is specified and different
      let displayPrice: number | undefined
      if (displayCurrency && displayCurrency !== candidate.currency) {
        displayPrice = convertCurrency(candidate.price, candidate.currency, displayCurrency)
      }

      // Persist result to database
      const resultData = {
        deviceId: deviceIdForDb,
        provider: candidate.provider as any,
        price: candidate.price,
        currency: candidate.currency as any,
        displayCurrency: displayCurrency as any,
        displayPrice: displayPrice || null,
        matchLevel: candidate.matchLevel as any,
        condition: candidate.condition as any,
        explanation: candidate.explanation,
      }

      console.log(`[Pricing Engine] Saving match result to database (deviceId: ${deviceIdForDb})...`)
      console.log(`[Pricing Engine] Result data:`, {
        deviceId: deviceIdForDb,
        price: candidate.price,
        currency: candidate.currency,
        provider: candidate.provider,
        matchLevel: candidate.matchLevel,
      })

      try {
        const existing = await prisma.pricingResult.findFirst({
          where: { deviceId: deviceIdForDb },
          orderBy: { computedAt: "desc" },
        })

        if (existing) {
          console.log(`[Pricing Engine] Updating existing PricingResult ${existing.id}`)
          const updated = await prisma.pricingResult.update({
            where: { id: existing.id },
            data: resultData,
          })
          console.log(`[Pricing Engine] ✓ Updated successfully:`, {
            id: updated.id,
            deviceId: updated.deviceId,
            price: Number(updated.price),
          })
        } else {
          console.log(`[Pricing Engine] Creating new PricingResult`)
          const created = await prisma.pricingResult.create({
            data: resultData,
          })
          console.log(`[Pricing Engine] ✓ Created successfully:`, {
            id: created.id,
            deviceId: created.deviceId,
            price: Number(created.price),
          })
        }
      } catch (dbError) {
        console.error(`[Pricing Engine] ✗ Database error:`, dbError)
        throw dbError
      }

        console.log(`[Pricing Engine] ✓ Match found via ${providerName}: $${candidate.price} ${candidate.currency} (${candidate.matchLevel})`)
        return {
          price: candidate.price,
          currency: candidate.currency,
          displayPrice,
          displayCurrency,
          provider: candidate.provider,
          matchLevel: candidate.matchLevel,
          explanation: candidate.explanation,
        }
      }
    } catch (error) {
      console.error(`[Pricing Engine] Error in provider ${providerName}:`, error)
      // Continue to next provider
    }
  }
  
  console.log(`[Pricing Engine] No provider matches found, using estimator`)

  // No pricing found - use dynamic estimation
  // This should ALWAYS return a result, never null
  try {
    console.log(`[Pricing Engine] Calling estimator...`)
    const estimate = estimateDevicePrice(device, displayCurrency || Currency.USD)
    console.log(`[Pricing Engine] Estimator returned: $${estimate.price} ${estimate.currency}`)
    
    // Calculate display price if different currency requested
    let displayPrice: number | undefined
    if (displayCurrency && displayCurrency !== estimate.currency) {
      displayPrice = convertCurrency(estimate.price, estimate.currency, displayCurrency)
    }

    const estimatedResult = {
      deviceId: deviceIdForDb,
      provider: PricingProvider.MANUAL as any,
      price: estimate.price,
      currency: estimate.currency as any,
      displayCurrency: displayCurrency as any,
      displayPrice: displayPrice || null,
      matchLevel: PricingMatchLevel.NONE as any,
      condition: device.condition as any,
      explanation: estimate.explanation,
    }

    console.log(`[Pricing Engine] Saving to database (deviceId: ${deviceIdForDb})...`)
    console.log(`[Pricing Engine] Estimated result data:`, {
      deviceId: deviceIdForDb,
      price: estimate.price,
      currency: estimate.currency,
      provider: PricingProvider.MANUAL,
      matchLevel: PricingMatchLevel.NONE,
    })
    
    try {
      const existing = await prisma.pricingResult.findFirst({
        where: { deviceId: deviceIdForDb },
        orderBy: { computedAt: "desc" },
      })

      if (existing) {
        console.log(`[Pricing Engine] Updating existing PricingResult ${existing.id}`)
        const updated = await prisma.pricingResult.update({
          where: { id: existing.id },
          data: estimatedResult,
        })
        console.log(`[Pricing Engine] ✓ Updated successfully:`, {
          id: updated.id,
          deviceId: updated.deviceId,
          price: Number(updated.price),
        })
      } else {
        console.log(`[Pricing Engine] Creating new PricingResult`)
        const created = await prisma.pricingResult.create({
          data: estimatedResult,
        })
        console.log(`[Pricing Engine] ✓ Created successfully:`, {
          id: created.id,
          deviceId: created.deviceId,
          price: Number(created.price),
        })
      }
    } catch (dbError) {
      console.error(`[Pricing Engine] ✗ Database error:`, dbError)
      throw dbError
    }

    return {
      price: estimate.price,
      currency: estimate.currency,
      displayPrice,
      displayCurrency,
      provider: PricingProvider.MANUAL,
      matchLevel: PricingMatchLevel.NONE,
      explanation: estimate.explanation,
    }
  } catch (error) {
    console.error(`[Pricing Engine] ✗ Error in estimation for device ${device.deviceId}:`, error)
    // Even if estimation fails, return a fallback result
    const fallbackPrice = 100 // Minimum fallback
    const fallbackResult = {
      price: fallbackPrice,
      currency: Currency.USD,
      displayPrice: undefined,
      displayCurrency: undefined,
      provider: PricingProvider.MANUAL,
      matchLevel: PricingMatchLevel.NONE,
      explanation: `Error estimating price - using fallback value. Original error: ${error instanceof Error ? error.message : String(error)}`,
    }
    
    // Try to save fallback result
    try {
      const existing = await prisma.pricingResult.findFirst({
        where: { deviceId: deviceIdForDb },
        orderBy: { computedAt: "desc" },
      })

      if (existing) {
        await prisma.pricingResult.update({
          where: { id: existing.id },
          data: {
            ...fallbackResult,
            condition: device.condition as any,
          },
        })
      } else {
        await prisma.pricingResult.create({
          data: {
            deviceId: deviceIdForDb,
            ...fallbackResult,
            condition: device.condition as any,
          },
        })
      }
    } catch (saveError) {
      console.error(`[Pricing Engine] Failed to save fallback result:`, saveError)
    }
    
    return fallbackResult
  }
}
