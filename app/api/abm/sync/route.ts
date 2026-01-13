/**
 * API Route: Sync Devices from ABM to Database
 * 
 * Fetches devices from ABM and stores/updates them in the database
 * Uses credentials from request body (from client session)
 */

import { NextRequest, NextResponse } from "next/server"
import { fetchDevices, type ABMDevice } from "@/lib/abm/api"
import { prisma } from "@/lib/db"
import { maskSerialNumber } from "@/lib/utils"
import type { ABMConfig } from "@/lib/abm/auth"

function parseDate(dateString: string | undefined): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

function formatArray(value: string[] | undefined): string | null {
  if (!value || !Array.isArray(value)) return null
  return JSON.stringify(value)
}

async function syncDevice(device: ABMDevice) {
  const attrs = device.attributes
  const serialNumber = attrs.serialNumber || device.id
  const serialNumberMasked = maskSerialNumber(serialNumber)

  const purchaseDate = parseDate(attrs.orderDateTime)
  const addedToOrgDate = parseDate(attrs.addedToOrgDateTime)
  const updatedDate = parseDate(attrs.updatedDateTime)
  const releasedFromOrgDate = parseDate(attrs.releasedFromOrgDateTime ?? undefined)

  const ethernetMacAddress = Array.isArray(attrs.ethernetMacAddress)
    ? attrs.ethernetMacAddress.join(", ")
    : attrs.ethernetMacAddress || null

  return prisma.device.upsert({
    where: { deviceId: device.id },
    create: {
      deviceId: device.id,
      serialNumber,
      serialNumberMasked,
      productFamily: attrs.productFamily || null,
      deviceModel: attrs.deviceModel || null,
      productType: attrs.productType || null,
      deviceCapacity: attrs.deviceCapacity || null,
      color: attrs.color || null,
      status: attrs.status || null,
      purchaseDate,
      addedToOrgDate,
      updatedDate,
      wifiMacAddress: attrs.wifiMacAddress || null,
      bluetoothMacAddress: attrs.bluetoothMacAddress || null,
      ethernetMacAddress,
      imei: formatArray(attrs.imei),
      meid: formatArray(attrs.meid),
      eid: attrs.eid || null,
      assignedServerId: attrs.assignedServerId || null,
      purchaseSourceType: attrs.purchaseSourceType || null,
      purchaseSourceId: attrs.purchaseSourceId || null,
      orderNumber: attrs.orderNumber || null,
      releasedFromOrgDate,
      rawPayload: device as any,
      lastSeenFromABM: new Date(),
    },
    update: {
      serialNumberMasked,
      productFamily: attrs.productFamily || null,
      deviceModel: attrs.deviceModel || null,
      productType: attrs.productType || null,
      deviceCapacity: attrs.deviceCapacity || null,
      color: attrs.color || null,
      status: attrs.status || null,
      purchaseDate,
      addedToOrgDate,
      updatedDate,
      wifiMacAddress: attrs.wifiMacAddress || null,
      bluetoothMacAddress: attrs.bluetoothMacAddress || null,
      ethernetMacAddress,
      imei: formatArray(attrs.imei),
      meid: formatArray(attrs.meid),
      eid: attrs.eid || null,
      assignedServerId: attrs.assignedServerId || null,
      purchaseSourceType: attrs.purchaseSourceType || null,
      purchaseSourceId: attrs.purchaseSourceId || null,
      orderNumber: attrs.orderNumber || null,
      releasedFromOrgDate,
      rawPayload: device as any,
      lastSeenFromABM: new Date(),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, keyId, privateKeyBase64, limit, cursor } = body

    if (!clientId || !keyId || !privateKeyBase64) {
      return NextResponse.json(
        { error: "ABM credentials required. Please sign in first." },
        { status: 401 }
      )
    }

    const config: ABMConfig = {
      clientId,
      keyId,
      privateKeyBase64,
      tokenUrl: process.env.ABM_TOKEN_URL || "https://account.apple.com/auth/oauth2/token",
      jwtAudience: process.env.ABM_JWT_AUDIENCE || "https://account.apple.com/auth/oauth2/v2/token",
    }

    let devicesResponse = await fetchDevices(config, { limit: limit || 50, cursor })
    let devices = devicesResponse.data
    let nextCursor = devicesResponse.meta?.paging?.nextCursor

    let synced = 0
    let errors: string[] = []

    // Sync all devices in current batch
    for (const device of devices) {
      try {
        await syncDevice(device)
        synced++
      } catch (error) {
        errors.push(`Device ${device.id}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors: errors.length > 0 ? errors : undefined,
      nextCursor,
      message: `Synced ${synced} device(s)${nextCursor ? ". More available." : "."}`,
    })
  } catch (error) {
    console.error("Error syncing devices:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to sync devices",
      },
      { status: 500 }
    )
  }
}
