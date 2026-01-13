/**
 * API Route: Login with ABM Credentials
 * 
 * Validates ABM credentials by testing the connection
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

    // Decode the base64 private key
    let privateKeyPEM: string
    try {
      privateKeyPEM = Buffer.from(privateKeyBase64, "base64").toString("utf-8")
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Failed to decode private key. Invalid base64 encoding." },
        { status: 400 }
      )
    }

    // Clean up the PEM - remove any extra whitespace
    privateKeyPEM = privateKeyPEM.trim()

    // Validate it looks like a PEM file
    if (!privateKeyPEM.includes("-----BEGIN") || !privateKeyPEM.includes("-----END")) {
      return NextResponse.json(
        { success: false, error: "Invalid private key format. Expected PEM file with -----BEGIN and -----END markers." },
        { status: 400 }
      )
    }

    // Ensure it's a PRIVATE KEY (not PUBLIC KEY)
    if (!privateKeyPEM.includes("PRIVATE KEY")) {
      return NextResponse.json(
        { success: false, error: "Invalid key type. Expected a private key file." },
        { status: 400 }
      )
    }

    // Create ABM config from user input
    const config: ABMConfig = {
      clientId,
      keyId,
      privateKeyBase64,
      tokenUrl: process.env.ABM_TOKEN_URL || "https://account.apple.com/auth/oauth2/token",
      jwtAudience: process.env.ABM_JWT_AUDIENCE || "https://account.apple.com/auth/oauth2/v2/token",
    }

    // Test the connection
    const result = await testABMConnection(config)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        tokenPreview: result.tokenPreview,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to authenticate with ABM",
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred during authentication",
      },
      { status: 500 }
    )
  }
}
