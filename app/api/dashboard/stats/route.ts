/**
 * API Route: Get Dashboard Statistics and Devices
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma, ensureDatabaseSchema } from "@/lib/db"

// Mark this route as dynamic to prevent build-time analysis
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Ensure database schema exists
    await ensureDatabaseSchema()
    const [
      totalDevices,
      devicesByType,
      missingPurchaseDate,
      pricingResults,
      devices,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.groupBy({
        by: ["productFamily"],
        _count: true,
      }),
      prisma.device.count({
        where: {
          purchaseDate: null,
        },
      }),
      prisma.pricingResult.findMany({
        distinct: ["deviceId"],
        select: { deviceId: true },
      }),
      prisma.device.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          pricingResults: {
            orderBy: { computedAt: "desc" },
            take: 1,
          },
        },
      }),
    ])

    console.log(`[Dashboard Stats] Found ${devices.length} devices`)
    console.log(`[Dashboard Stats] Found ${pricingResults.length} unique pricing results`)
    
    // Log ALL devices and their pricing
    console.log(`[Dashboard Stats] Device pricing breakdown:`)
    devices.forEach((device) => {
      const pricingCount = device.pricingResults.length
      const latestPricing = device.pricingResults[0]
      console.log(`  Device ${device.id} (${device.deviceModel || "N/A"}):`)
      console.log(`    - Pricing results: ${pricingCount}`)
      if (latestPricing) {
        console.log(`    - Latest: $${latestPricing.price} ${latestPricing.currency} (${latestPricing.matchLevel})`)
        console.log(`    - Provider: ${latestPricing.provider}`)
      } else {
        console.log(`    - ❌ NO PRICING RESULT`)
      }
    })

    const devicesWithPricing = pricingResults.length

    // Calculate total estimated value
    const totalValue = devices.reduce((sum, device) => {
      const latestPricing = device.pricingResults[0]
      if (latestPricing) {
        return sum + Number(latestPricing.price)
      }
      return sum
    }, 0)

    // Calculate average device age (in years)
    const devicesWithDates = devices.filter((d) => d.purchaseDate)
    const avgAge = devicesWithDates.length > 0
      ? devicesWithDates.reduce((sum, device) => {
          const age = (Date.now() - new Date(device.purchaseDate!).getTime()) / (1000 * 60 * 60 * 24 * 365)
          return sum + age
        }, 0) / devicesWithDates.length
      : 0

    return NextResponse.json({
      totalDevices,
      devicesByType: devicesByType.reduce(
        (acc, item) => {
          acc[item.productFamily || "Unknown"] = item._count
          return acc
        },
        {} as Record<string, number>
      ),
      missingPurchaseDate,
      devicesWithPricing,
      totalValue,
      avgAge: Math.round(avgAge * 10) / 10,
      devices: devices.map((device) => {
        const latestPricing = device.pricingResults[0]
        const resalePrice = latestPricing ? Number(latestPricing.price) : null
        const resaleCurrency = latestPricing?.currency || null
        const resaleProvider = latestPricing?.provider || null
        const matchLevel = latestPricing?.matchLevel || null
        
        // Debug log for devices with pricing
        if (resalePrice) {
          console.log(`[Dashboard Stats] Device ${device.id} (${device.deviceModel}): $${resalePrice} ${resaleCurrency} (${resaleProvider})`)
        }
        
        return {
          id: device.id,
          deviceId: device.deviceId,
          deviceModel: device.deviceModel,
          serialNumberMasked: device.serialNumberMasked,
          productFamily: device.productFamily,
          productType: device.productType,
          purchaseDate: device.purchaseDate,
          status: device.status,
          deviceCapacity: device.deviceCapacity,
          color: device.color,
          resalePrice,
          resaleCurrency,
          resaleProvider,
          matchLevel,
        }
      }),
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch stats",
      },
      { status: 500 }
    )
  }
}
