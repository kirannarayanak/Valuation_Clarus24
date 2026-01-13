/**
 * API Route: Calculate Pricing for All Devices
 * 
 * Uses the new pricing engine to calculate resale estimates for all devices
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { calculatePricingForDevice } from "@/lib/pricing/engine"
import { PricingCondition } from "@/lib/pricing/types"
import { Currency } from "@/lib/pricing/currency"

// Mark this route as dynamic to prevent build-time analysis
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Parse body if present, otherwise use defaults
    let displayCurrency: Currency | undefined
    try {
      const body = await request.json().catch(() => ({}))
      displayCurrency = body.displayCurrency as Currency | undefined
    } catch {
      // Empty body is fine, use defaults
      displayCurrency = undefined
    }

    // Get all devices
    const devices = await prisma.device.findMany()
    
    console.log(`[Pricing] Processing ${devices.length} devices`)

    let calculated = 0
    let errors: string[] = []

    for (const device of devices) {
      try {
        console.log(`[Pricing] Processing device: ${device.deviceId}, family: ${device.productFamily}, model: ${device.deviceModel}`)
        
        // Determine resale condition (NEVER use NEW - once purchased, it's used)
        // All devices in inventory are used devices, so always use resale conditions
        let resaleCondition: PricingCondition = PricingCondition.EXCELLENT // Default to excellent
        
        // Adjust condition based on device age (more realistic depreciation)
        if (device.purchaseDate) {
          const ageInYears = (Date.now() - new Date(device.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
          
          if (ageInYears < 1) {
            // Less than 1 year old - like new condition
            resaleCondition = PricingCondition.EXCELLENT
          } else if (ageInYears < 2) {
            // 1-2 years old - still excellent but slightly used
            resaleCondition = PricingCondition.EXCELLENT
          } else if (ageInYears < 3) {
            // 2-3 years old - good condition
            resaleCondition = PricingCondition.GOOD
          } else if (ageInYears < 5) {
            // 3-5 years old - fair condition
            resaleCondition = PricingCondition.FAIR
          } else {
            // 5+ years old - poor condition
            resaleCondition = PricingCondition.POOR
          }
        } else {
          // No purchase date - use status as indicator
          if (device.status === "ASSIGNED") {
            // In active use - assume good condition (realistic for used devices)
            resaleCondition = PricingCondition.GOOD
          } else {
            // Unknown status - conservative estimate
            resaleCondition = PricingCondition.GOOD
          }
        }
        
        const result = await calculatePricingForDevice(
          {
            deviceId: device.deviceId, // ABM device ID for matching
            productFamily: device.productFamily,
            deviceModel: device.deviceModel,
            productType: device.productType,
            storage: device.deviceCapacity,
            condition: resaleCondition, // Always use resale-appropriate condition (EXCELLENT, GOOD, FAIR)
            region: "US", // Default to US, can be extracted from device data
          },
          displayCurrency,
          device.id // Database ID for saving PricingResult
        )

        // Function always returns a result (never null)
        calculated++
        console.log(`[Pricing] ✓ Calculated price for ${device.deviceId}: $${result.price} ${result.currency} (${result.matchLevel}) - ${result.explanation}`)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[Pricing] ✗ Error for device ${device.deviceId}:`, errorMsg)
        errors.push(
          `Device ${device.deviceId}: ${errorMsg}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      calculated,
      totalDevices: devices.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Calculated pricing for ${calculated} of ${devices.length} device(s).`,
    })
  } catch (error) {
    console.error("Error calculating pricing:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to calculate pricing",
      },
      { status: 500 }
    )
  }
}
