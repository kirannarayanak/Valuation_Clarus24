/**
 * API Route: Fetch Devices from ABM
 * 
 * Fetches devices from Apple Business Manager API
 * Uses credentials from request body (from client session)
 */

import { NextRequest, NextResponse } from "next/server"
import { fetchDevices } from "@/lib/abm/api"
import type { ABMConfig } from "@/lib/abm/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, keyId, privateKeyBase64, limit, cursor } = body

    if (!clientId || !keyId || !privateKeyBase64) {
      return NextResponse.json(
        { error: "ABM credentials required. Please sign in first." },
        { status: 401 }
      )
    }

    const config: ABMConfig = {
      clientId,
      keyId,
      privateKeyBase64,
      tokenUrl: process.env.ABM_TOKEN_URL || "https://account.apple.com/auth/oauth2/token",
      jwtAudience: process.env.ABM_JWT_AUDIENCE || "https://account.apple.com/auth/oauth2/v2/token",
    }

    const devices = await fetchDevices(config, {
      limit: limit || 50,
      cursor,
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error("Error fetching devices from ABM:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch devices",
      },
      { status: 500 }
    )
  }
}
