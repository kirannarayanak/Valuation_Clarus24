/**
 * API Route: Get Devices from Database
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const devices = await prisma.device.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        pricingResults: {
          orderBy: { computedAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json({ devices })
  } catch (error) {
    console.error("Error fetching devices:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch devices",
      },
      { status: 500 }
    )
  }
}
