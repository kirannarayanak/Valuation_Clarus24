/**
 * API Route to run Prisma migrations
 * 
 * Call this after deployment to ensure database is up to date
 * GET /api/migrate?secret=YOUR_SECRET
 */

import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Only allow in production or with a secret key
    const secret = process.env.MIGRATE_SECRET
    const requestSecret = request.nextUrl.searchParams.get("secret")
    
    if (secret && requestSecret !== secret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { execSync } = require("child_process")
    
    console.log("🔄 Running Prisma migrations...")
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      env: process.env,
    })
    
    return NextResponse.json({
      success: true,
      message: "Migrations completed successfully",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    )
  }
}
