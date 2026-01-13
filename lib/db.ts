/**
 * Prisma Client singleton
 * 
 * Prevents multiple instances in development with hot reloading
 */

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set!")
  console.error("   Please set DATABASE_URL in Vercel environment variables")
  console.error("   Current env vars:", Object.keys(process.env).filter(k => k.includes("DATABASE") || k.includes("POSTGRES")))
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Helper to check if tables exist and create them if needed
let schemaChecked = false
export async function ensureDatabaseSchema() {
  if (schemaChecked) return
  
  try {
    // Try a simple query to check if tables exist
    await prisma.device.count()
    schemaChecked = true
    console.log("✅ Database schema exists")
  } catch (error: any) {
    if (error?.message?.includes("does not exist")) {
      console.log("⚠️  Database tables don't exist. Creating schema...")
      try {
        const { execSync } = require("child_process")
        execSync("npx prisma db push --accept-data-loss --skip-generate", {
          stdio: "inherit",
          env: process.env,
        })
        schemaChecked = true
        console.log("✅ Database schema created")
      } catch (pushError) {
        console.error("❌ Failed to create database schema:", pushError)
        throw pushError
      }
    } else {
      throw error
    }
  }
}
