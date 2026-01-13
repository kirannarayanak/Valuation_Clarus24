/**
 * Debug endpoint to check environment variables
 * 
 * This helps verify DATABASE_URL is available at runtime
 */

import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const hasDatabaseUrl = !!process.env.DATABASE_URL
  const databaseUrlPreview = process.env.DATABASE_URL
    ? `${process.env.DATABASE_URL.substring(0, 30)}...`
    : "NOT SET"

  return NextResponse.json({
    hasDatabaseUrl,
    databaseUrlPreview,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    allEnvKeys: Object.keys(process.env)
      .filter((k) => k.includes("DATABASE") || k.includes("POSTGRES") || k.includes("DB"))
      .sort(),
  })
}
