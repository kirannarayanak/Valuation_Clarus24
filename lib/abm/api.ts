/**
 * Apple Business Manager (ABM) API Client
 * 
 * Handles API calls to ABM endpoints after authentication
 */

import { getAccessToken } from "./auth"
import type { ABMConfig } from "./config"

export interface ABMDevice {
  type: string
  id: string
  attributes: {
    productFamily?: string
    deviceModel?: string
    serialNumber?: string
    orderDateTime?: string
    addedToOrgDateTime?: string
    updatedDateTime?: string
    deviceCapacity?: string
    color?: string
    status?: string
    wifiMacAddress?: string
    bluetoothMacAddress?: string
    ethernetMacAddress?: string | string[]
    imei?: string[]
    meid?: string[]
    eid?: string
    assignedServerId?: string
    purchaseSourceType?: string
    purchaseSourceId?: string
    orderNumber?: string
    releasedFromOrgDateTime?: string | null
    partNumber?: string
    productType?: string
    [key: string]: any
  }
  relationships?: any
  links?: any
}

export interface ABMDevicesResponse {
  data: ABMDevice[]
  links?: {
    self?: string
    next?: string
  }
  meta?: {
    paging?: {
      limit?: number
      nextCursor?: string
    }
  }
}

/**
 * Fetch devices from ABM API
 */
export async function fetchDevices(
  config: ABMConfig,
  options: {
    limit?: number
    cursor?: string
  } = {}
): Promise<ABMDevicesResponse> {
  const tokenResponse = await getAccessToken(config)
  const accessToken = tokenResponse.access_token

  const apiBaseUrl = process.env.ABM_API_BASE_URL || "https://api-business.apple.com/v1"
  const url = new URL(`${apiBaseUrl}/orgDevices`)

  if (options.limit) {
    url.searchParams.set("limit", options.limit.toString())
  }
  if (options.cursor) {
    url.searchParams.set("cursor", options.cursor)
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorBody
    try {
      errorBody = JSON.parse(errorText)
    } catch {
      errorBody = { raw: errorText }
    }

    throw new Error(
      `ABM API request failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
    )
  }

  return (await response.json()) as ABMDevicesResponse
}

/**
 * Test ABM connection (get token only)
 */
export async function testABMConnection(config: ABMConfig): Promise<{
  success: boolean
  error?: string
  tokenPreview?: string
}> {
  try {
    const tokenResponse = await getAccessToken(config)
    return {
      success: true,
      tokenPreview: `${tokenResponse.access_token.substring(0, 20)}...`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
