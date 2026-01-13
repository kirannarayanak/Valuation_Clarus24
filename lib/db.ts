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
