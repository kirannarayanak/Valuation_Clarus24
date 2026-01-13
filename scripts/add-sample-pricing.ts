/**
 * Script to add sample pricing data
 * 
 * Populates sample pricing for iPhone, iPad, Mac
 * Includes all 5 conditions and all 3 currencies (AED, USD, INR)
 * 
 * Run with: npx tsx scripts/add-sample-pricing.ts
 */

import { prisma } from "../lib/db"
import { PricingProvider, PricingCondition } from "../lib/pricing/types"
import { Currency } from "../lib/pricing/currency"

async function main() {
  console.log("Adding sample pricing data...")

  // Sample pricing entries with realistic values
  // Labeled as sample data - replace with actual market data
  const samplePricing = [
    // ===== iPhone Pricing =====
    // iPhone 15 Pro - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 999.00,
      currency: Currency.USD,
      notes: "Sample pricing - iPhone 15 Pro 256GB new condition (US market)",
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.EXCELLENT,
      region: "US",
      price: 849.00,
      currency: Currency.USD,
      notes: "Sample pricing - excellent condition",
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.GOOD,
      region: "US",
      price: 699.00,
      currency: Currency.USD,
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.FAIR,
      region: "US",
      price: 549.00,
      currency: Currency.USD,
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.POOR,
      region: "US",
      price: 399.00,
      currency: Currency.USD,
    },
    // iPhone 15 Pro - AED
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "UAE",
      price: 3667.00, // ~$999 USD
      currency: Currency.AED,
      notes: "Sample pricing - UAE market",
    },
    // iPhone 15 Pro - INR
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone 15 Pro",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "IN",
      price: 82917.00, // ~$999 USD
      currency: Currency.INR,
      notes: "Sample pricing - India market",
    },
    // iPhone X - USD (older model)
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPhone",
      deviceModel: "iPhone X",
      storage: "256GB",
      condition: PricingCondition.EXCELLENT,
      region: "US",
      price: 299.00,
      currency: Currency.USD,
      notes: "Sample pricing - older model",
    },

    // ===== iPad Pricing =====
    // iPad Pro 13-inch - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPad",
      deviceModel: "iPad Pro 13-inch",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 1299.00,
      currency: Currency.USD,
      notes: "Sample pricing - iPad Pro 13-inch",
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPad",
      deviceModel: "iPad Pro 13-inch",
      storage: "256GB",
      condition: PricingCondition.EXCELLENT,
      region: "US",
      price: 1099.00,
      currency: Currency.USD,
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPad",
      deviceModel: "iPad Pro 13-inch",
      storage: "256GB",
      condition: PricingCondition.GOOD,
      region: "US",
      price: 899.00,
      currency: Currency.USD,
    },
    // iPad Pro 13-inch (M5) - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "iPad",
      deviceModel: "iPad Pro 13-inch (M5)",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 1399.00,
      currency: Currency.USD,
      notes: "Sample pricing - latest M5 model",
    },

    // ===== Mac Pricing =====
    // MacBook Air - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 999.00,
      currency: Currency.USD,
      notes: "Sample pricing - MacBook Air 256GB",
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "256GB",
      condition: PricingCondition.EXCELLENT,
      region: "US",
      price: 849.00,
      currency: Currency.USD,
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "256GB",
      condition: PricingCondition.GOOD,
      region: "US",
      price: 699.00,
      currency: Currency.USD,
    },
    // MacBook Air (13-inch, M3, 2024) - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air (13-inch, M3, 2024)",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 1099.00,
      currency: Currency.USD,
      notes: "Sample pricing - M3 model",
    },
    // Mac mini - USD
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "Mac mini",
      storage: "512GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 599.00,
      currency: Currency.USD,
      notes: "Sample pricing - Mac mini 512GB",
    },
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "Mac mini",
      storage: "512GB",
      condition: PricingCondition.EXCELLENT,
      region: "US",
      price: 499.00,
      currency: Currency.USD,
    },
    // Mac mini - AED
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "Mac mini",
      storage: "512GB",
      condition: PricingCondition.NEW,
      region: "UAE",
      price: 2198.00, // ~$599 USD
      currency: Currency.AED,
      notes: "Sample pricing - UAE market",
    },
    // Mac mini - INR
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "Mac mini",
      storage: "512GB",
      condition: PricingCondition.NEW,
      region: "IN",
      price: 49717.00, // ~$599 USD
      currency: Currency.INR,
      notes: "Sample pricing - India market",
    },
    // Family fallback - Mac (any model, any storage)
    {
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: null,
      productType: null,
      storage: null,
      condition: PricingCondition.NEW,
      region: "US",
      price: 799.00,
      currency: Currency.USD,
      notes: "Sample pricing - Mac family fallback (any model, any storage)",
    },
  ]

  let imported = 0
  let updated = 0

  for (const pricing of samplePricing) {
    // Check if pricing already exists
    const existing = await prisma.pricing.findFirst({
      where: {
        provider: pricing.provider as any,
        productFamily: pricing.productFamily,
        deviceModel: pricing.deviceModel || null,
        productType: pricing.productType || null,
        storage: pricing.storage || null,
        condition: pricing.condition as any,
        region: pricing.region,
      },
    })

    const pricingData = {
      provider: pricing.provider as any,
      productFamily: pricing.productFamily,
      deviceModel: pricing.deviceModel || null,
      productType: pricing.productType || null,
      storage: pricing.storage || null,
      condition: pricing.condition as any,
      region: pricing.region,
      price: pricing.price,
      currency: pricing.currency as any,
      notes: pricing.notes || null,
      effectiveDate: new Date(),
    }

    if (existing) {
      await prisma.pricing.update({
        where: { id: existing.id },
        data: pricingData,
      })
      updated++
    } else {
      await prisma.pricing.create({
        data: pricingData,
      })
      imported++
    }
  }

  console.log(`✓ Pricing import complete!`)
  console.log(`  Imported: ${imported} new entries`)
  console.log(`  Updated: ${updated} existing entries`)
  console.log(`  Total: ${samplePricing.length} entries`)
  console.log("\nSample data includes:")
  console.log("  - iPhone, iPad, Mac models")
  console.log("  - All 5 conditions (NEW, EXCELLENT, GOOD, FAIR, POOR)")
  console.log("  - All 3 currencies (USD, AED, INR)")
  console.log("  - Multiple regions (US, UAE, IN)")
  console.log("\n⚠️  NOTE: These are SAMPLE values. Replace with actual market data.")
  console.log("\nNext steps:")
  console.log("1. Use calculatePricingForDevice() to compute prices")
  console.log("2. Or click 'Calculate Pricing' in the dashboard")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
