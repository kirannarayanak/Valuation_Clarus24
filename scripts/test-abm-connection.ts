/**
 * Test script to check ABM connection and fetch devices
 * 
 * Usage: npx tsx scripts/test-abm-connection.ts
 */

import { readFileSync } from "fs"
import { join } from "path"
import { fetchDevices } from "../lib/abm/api"
import type { ABMConfig } from "../lib/abm/auth"

async function testABM() {
  // Get credentials from environment or prompt
  const clientId = process.env.ABM_CLIENT_ID || ""
  const keyId = process.env.ABM_KEY_ID || ""
  const privateKeyPath = process.env.ABM_PRIVATE_KEY_PATH || join(process.cwd(), "Device_Management_API.pem")

  if (!clientId || !keyId) {
    console.error("❌ Error: ABM_CLIENT_ID and ABM_KEY_ID must be set in environment")
    console.log("\nUsage:")
    console.log("  ABM_CLIENT_ID=your_client_id ABM_KEY_ID=your_key_id npx tsx scripts/test-abm-connection.ts")
    process.exit(1)
  }

  console.log("🔍 Testing ABM Connection...")
  console.log(`Client ID: ${clientId}`)
  console.log(`Key ID: ${keyId}`)
  console.log(`Private Key Path: ${privateKeyPath}`)
  console.log("")

  try {
    // Read private key
    let privateKeyPEM: string
    try {
      privateKeyPEM = readFileSync(privateKeyPath, "utf-8")
    } catch (error) {
      console.error(`❌ Error reading private key file: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }

    // Encode to base64
    const privateKeyBase64 = Buffer.from(privateKeyPEM).toString("base64")

    // Create config
    const config: ABMConfig = {
      clientId,
      keyId,
      privateKeyBase64,
    }

    console.log("📡 Fetching devices from ABM...")
    const response = await fetchDevices(config, { limit: 10 })

    console.log("✅ Success!")
    console.log(`\n📊 Response Summary:`)
    console.log(`  - Total devices in this page: ${response.data.length}`)
    console.log(`  - Has next page: ${response.meta?.paging?.nextCursor ? "Yes" : "No"}`)
    
    if (response.data.length > 0) {
      console.log(`\n📱 Sample Device:`)
      const device = response.data[0]
      console.log(`  - ID: ${device.id}`)
      console.log(`  - Model: ${device.attributes.deviceModel || "N/A"}`)
      console.log(`  - Family: ${device.attributes.productFamily || "N/A"}`)
      console.log(`  - Serial: ${device.attributes.serialNumber || "N/A"}`)
      console.log(`  - Status: ${device.attributes.status || "N/A"}`)
    } else {
      console.log("\n⚠️  No devices found in your ABM account")
      console.log("   This could mean:")
      console.log("   - Your account has no devices")
      console.log("   - Your API credentials don't have access")
      console.log("   - There's an issue with the API call")
    }

    console.log(`\n📋 Full Response:`)
    console.log(JSON.stringify(response, null, 2))

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error("\nStack trace:")
      console.error(error.stack)
    }
    process.exit(1)
  }
}

testABM()
