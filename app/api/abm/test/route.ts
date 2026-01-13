/**
 * API Route: Test ABM Connection
 * 
 * Tests the ABM OAuth connection using credentials from request
 */

import { NextRequest, NextResponse } from "next/server"
import { testABMConnection } from "@/lib/abm/api"
import type { ABMConfig } from "@/lib/abm/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, keyId, privateKeyBase64 } = body

    if (!clientId || !keyId || !privateKeyBase64) {
      return NextResponse.json(
        { success: false, error: "Client ID, Key ID, and Private Key are required" },
        { status: 400 }
      )
    }

    const config: ABMConfig = {
      clientId,
      keyId,
      privateKeyBase64,
      tokenUrl: process.env.ABM_TOKEN_URL || "https://account.apple.com/auth/oauth2/token",
      jwtAudience: process.env.ABM_JWT_AUDIENCE || "https://account.apple.com/auth/oauth2/v2/token",
    }

    const result = await testABMConnection(config)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "ABM connection successful",
        tokenPreview: result.tokenPreview,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Unknown error",
        },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
