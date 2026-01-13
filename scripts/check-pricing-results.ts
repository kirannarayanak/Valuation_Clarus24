/**
 * Script to check if pricing results exist in database
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkPricingResults() {
  try {
    console.log("🔍 Checking pricing results in database...\n")

    // Count devices
    const deviceCount = await prisma.device.count()
    console.log(`📱 Total devices: ${deviceCount}`)

    // Count pricing results
    const pricingResultCount = await prisma.pricingResult.count()
    console.log(`💰 Total pricing results: ${pricingResultCount}\n`)

    // Get all devices with their pricing results
    const devices = await prisma.device.findMany({
      include: {
        pricingResults: {
          orderBy: { computedAt: "desc" },
          take: 1,
        },
      },
      take: 10,
    })

    console.log("📊 Sample devices and their pricing:\n")
    devices.forEach((device) => {
      const pricing = device.pricingResults[0]
      console.log(`Device ID: ${device.id}`)
      console.log(`  ABM Device ID: ${device.deviceId}`)
      console.log(`  Model: ${device.deviceModel || "N/A"}`)
      console.log(`  Family: ${device.productFamily || "N/A"}`)
      if (pricing) {
        console.log(`  ✅ Pricing: $${pricing.price} ${pricing.currency} (${pricing.matchLevel})`)
        console.log(`     Provider: ${pricing.provider}`)
        console.log(`     Explanation: ${pricing.explanation}`)
      } else {
        console.log(`  ❌ No pricing result`)
      }
      console.log("")
    })

    // Check if there's a mismatch
    const allPricingResults = await prisma.pricingResult.findMany({
      take: 5,
    })

    console.log("🔗 Sample PricingResult records:\n")
    allPricingResults.forEach((pr) => {
      console.log(`PricingResult ID: ${pr.id}`)
      console.log(`  Device ID (FK): ${pr.deviceId}`)
      console.log(`  Price: $${pr.price} ${pr.currency}`)
      console.log(`  Provider: ${pr.provider}`)
      console.log(`  Match Level: ${pr.matchLevel}`)
      console.log("")
    })

    // Check for orphaned pricing results
    const orphaned = await prisma.pricingResult.findMany({
      where: {
        device: null,
      },
    })

    if (orphaned.length > 0) {
      console.log(`⚠️  Found ${orphaned.length} orphaned pricing results (device doesn't exist)`)
    } else {
      console.log("✅ No orphaned pricing results")
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPricingResults()
