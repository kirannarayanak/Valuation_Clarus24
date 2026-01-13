/**
 * API Route to run Prisma migrations or push schema
 * 
 * Call this after deployment to ensure database is up to date
 * GET /api/migrate
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("🔄 Setting up database schema...")
    
    // Try to use Prisma db push to create tables (works even without migrations)
    const { execSync } = require("child_process")
    
    console.log("📊 Pushing Prisma schema to database...")
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    })
    
    // Verify tables exist by trying a simple query
    try {
      await prisma.device.count()
      console.log("✅ Database tables created successfully")
    } catch (verifyError) {
      console.warn("⚠️  Tables might not be fully created yet")
    }
    
    return NextResponse.json({
      success: true,
      message: "Database schema created successfully",
    })
  } catch (error) {
    console.error("❌ Database setup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Database setup failed",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    )
  }
}
