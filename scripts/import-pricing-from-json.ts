/**
 * Script to import pricing data from ChatGPT-generated JSON
 * 
 * Usage:
 * 1. Get pricing data from ChatGPT using the prompt in CHATGPT_PROMPT_FOR_PRICING.md
 * 2. Save the JSON to a file (e.g., pricing-data.json)
 * 3. Run: npx tsx scripts/import-pricing-from-json.ts pricing-data.json
 */

import { prisma } from "../lib/db"
import { readFileSync } from "fs"
import { PricingProvider, PricingCondition } from "../lib/pricing/types"
import { Currency } from "../lib/pricing/currency"

interface PricingEntry {
  provider: string
  productFamily: string
  deviceModel?: string
  productType?: string
  storage?: string
  condition: string
  region: string
  price: number
  currency: string
  notes?: string
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/import-pricing-from-json.ts <json-file>")
    console.error("Example: npx tsx scripts/import-pricing-from-json.ts pricing-data.json")
    process.exit(1)
  }

  const jsonFile = args[0]
  
  console.log(`Reading pricing data from ${jsonFile}...`)
  
  let pricingData: PricingEntry[]
  try {
    const fileContent = readFileSync(jsonFile, "utf-8")
    pricingData = JSON.parse(fileContent)
  } catch (error) {
    console.error(`Error reading file: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }

  if (!Array.isArray(pricingData)) {
    console.error("Error: JSON file must contain an array of pricing entries")
    process.exit(1)
  }

  console.log(`Found ${pricingData.length} pricing entries`)
  console.log("Importing...")

  let imported = 0
  let updated = 0
  let errors = 0

  for (const entry of pricingData) {
    try {
      // Validate required fields
      if (!entry.provider || !entry.productFamily || !entry.condition || !entry.region || !entry.price) {
        console.warn(`Skipping invalid entry: ${JSON.stringify(entry)}`)
        errors++
        continue
      }

      // Cast string values to enum types
      const provider = entry.provider.toUpperCase() as PricingProvider
      const condition = entry.condition.toUpperCase() as PricingCondition
      const currency = (entry.currency || "USD").toUpperCase() as Currency

      // Check if pricing already exists
      const existing = await prisma.pricing.findFirst({
        where: {
          provider: provider,
          productFamily: entry.productFamily,
          deviceModel: entry.deviceModel || null,
          productType: entry.productType || null,
          storage: entry.storage || null,
          condition: condition,
          region: entry.region,
        },
      })

      const pricingData = {
        provider: provider,
        productFamily: entry.productFamily,
        deviceModel: entry.deviceModel || null,
        productType: entry.productType || null,
        storage: entry.storage || null,
        condition: condition,
        region: entry.region,
        price: entry.price,
        currency: currency,
        notes: entry.notes || null,
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
    } catch (error) {
      console.error(`Error importing entry: ${JSON.stringify(entry)}`)
      console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`)
      errors++
    }
  }

  console.log("\n✓ Import complete!")
  console.log(`  Imported: ${imported} new entries`)
  console.log(`  Updated: ${updated} existing entries`)
  console.log(`  Errors: ${errors}`)
  console.log("\nNext steps:")
  console.log("1. Go to your dashboard")
  console.log("2. Click 'Calculate Pricing'")
  console.log("3. See resale prices for all your devices!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
