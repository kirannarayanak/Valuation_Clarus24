/**
 * Debug endpoint to check pricing results in database
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// Mark this route as dynamic to prevent build-time analysis
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Get all devices
    const devices = await prisma.device.findMany({
      take: 5,
      include: {
        pricingResults: {
          orderBy: { computedAt: "desc" },
          take: 1,
        },
      },
    })

    // Get all pricing results
    const allPricingResults = await prisma.pricingResult.findMany({
      take: 10,
    })

    // Check for orphaned results (pricing results without a matching device)
    const allDeviceIds = await prisma.device.findMany({
      select: { id: true },
    })
    const deviceIdSet = new Set(allDeviceIds.map((d) => d.id))
    const allPricingResultsForOrphanCheck = await prisma.pricingResult.findMany({
      select: { id: true, deviceId: true },
    })
    const orphaned = allPricingResultsForOrphanCheck.filter(
      (pr) => !deviceIdSet.has(pr.deviceId)
    )

    return NextResponse.json({
      devices: devices.map((d) => ({
        id: d.id,
        deviceId: d.deviceId,
        model: d.deviceModel,
        pricingResultsCount: d.pricingResults.length,
        latestPricing: d.pricingResults[0] ? {
          price: Number(d.pricingResults[0].price),
          currency: d.pricingResults[0].currency,
          provider: d.pricingResults[0].provider,
          matchLevel: d.pricingResults[0].matchLevel,
        } : null,
      })),
      allPricingResults: allPricingResults.map((pr) => ({
        id: pr.id,
        deviceId: pr.deviceId,
        price: Number(pr.price),
        currency: pr.currency,
        provider: pr.provider,
        matchLevel: pr.matchLevel,
      })),
      orphanedCount: orphaned.length,
      totalPricingResults: await prisma.pricingResult.count(),
      totalDevices: await prisma.device.count(),
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to debug",
      },
      { status: 500 }
    )
  }
}
