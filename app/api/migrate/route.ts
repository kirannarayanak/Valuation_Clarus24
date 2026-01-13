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
    
    // Use Prisma's programmatic API to push schema
    const { PrismaClient } = require("@prisma/client")
    const { execSync } = require("child_process")
    
    console.log("📊 Pushing Prisma schema to database...")
    
    // Try using Prisma's db push via execSync
    // In Vercel, we need to use the full path or ensure npx is available
    try {
      const result = execSync(
        "node_modules/.bin/prisma db push --accept-data-loss --skip-generate || npx prisma db push --accept-data-loss --skip-generate",
        {
          stdio: "pipe",
          env: { ...process.env, PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin" },
          timeout: 60000, // 60 second timeout
        }
      )
      console.log("✅ Prisma db push output:", result.toString())
    } catch (execError: any) {
      console.error("❌ execSync failed, trying alternative method...", execError.message)
      
      // Alternative: Use Prisma's programmatic API if available
      // This is a fallback - Prisma doesn't have a direct programmatic db push
      // So we'll return an error with instructions
      return NextResponse.json(
        {
          error: "Failed to create tables automatically",
          message: "Please run migrations manually. See instructions below.",
          instructions: [
            "1. Install Vercel CLI: npm i -g vercel",
            "2. Run: vercel env pull",
            "3. Run: npx prisma db push",
            "4. Or use Supabase dashboard to run SQL migrations",
          ],
          execError: execError?.message || String(execError),
        },
        { status: 500 }
      )
    }
    
    // Verify tables exist by trying a simple query
    try {
      await prisma.device.count()
      console.log("✅ Database tables created and verified")
    } catch (verifyError) {
      console.warn("⚠️  Tables might not be fully created yet")
      return NextResponse.json(
        {
          success: false,
          warning: "Schema push completed but tables might not be ready yet",
          message: "Please try again in a few seconds",
        },
        { status: 200 }
      )
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
