/**
 * Mock ABM API Responses
 * 
 * Sample data for testing and development without real ABM credentials
 */

import { ABMDevice, ABMDevicesResponse } from "./api"

export const mockDevices: ABMDevice[] = [
  {
    type: "orgDevices",
    id: "FM6GYQ35W6",
    attributes: {
      productFamily: "iPad",
      deviceModel: "iPad Pro 13-inch (M5)",
      serialNumber: "FM6GYQ35W6",
      orderDateTime: "2025-12-06T22:30:30Z",
      addedToOrgDateTime: "2025-12-06T14:30:30.324Z",
      updatedDateTime: "2025-12-06T14:36:02.093Z",
      deviceCapacity: "256GB",
      color: "SPACE BLACK",
      status: "ASSIGNED",
      wifiMacAddress: "449E8B2951FA",
      bluetoothMacAddress: "449E8B27473F",
      imei: ["352355703979403"],
      eid: "89049032020008885900226789312874",
      orderNumber: "CE-2025-12-06-06-30-30-027",
      purchaseSourceType: "MANUALLY_ADDED",
      productType: "iPad17,4",
      partNumber: "ME7W4HN/A",
    },
  },
  {
    type: "orgDevices",
    id: "C07DT4PGQ6NW",
    attributes: {
      productFamily: "Mac",
      deviceModel: "Mac mini",
      serialNumber: "C07DT4PGQ6NW",
      orderDateTime: "2024-12-06T00:28:46Z",
      addedToOrgDateTime: "2024-12-05T16:28:46.743Z",
      updatedDateTime: "2025-09-17T04:54:40.236Z",
      deviceCapacity: "512GB",
      color: "SILVER",
      status: "UNASSIGNED",
      orderNumber: "CE-2024-12-05-08-28-46-594",
      purchaseSourceType: "MANUALLY_ADDED",
      productType: "Macmini9,1",
      partNumber: "MGNT3HN/A",
    },
  },
  {
    type: "orgDevices",
    id: "G0NVXQMNJCL7",
    attributes: {
      productFamily: "iPhone",
      deviceModel: "iPhone X",
      serialNumber: "G0NVXQMNJCL7",
      orderDateTime: "2025-02-12T13:47:47Z",
      addedToOrgDateTime: "2025-02-12T05:47:48.191Z",
      updatedDateTime: "2025-02-12T06:05:05.544Z",
      deviceCapacity: "256GB",
      color: "SILVER",
      status: "ASSIGNED",
      wifiMacAddress: "B8C1117B7308",
      bluetoothMacAddress: "B8C1117B7309",
      imei: ["353053096149358"],
      meid: ["35305309614935"],
      orderNumber: "CE-2025-02-11-09-47-47-986",
      purchaseSourceType: "MANUALLY_ADDED",
      productType: "iPhone10,3",
      partNumber: "MQA92HN/A",
    },
  },
  {
    type: "orgDevices",
    id: "HKX6KQ45M2",
    attributes: {
      productFamily: "Mac",
      deviceModel: "MacBook Air (13-inch, M3, 2024)",
      serialNumber: "HKX6KQ45M2",
      orderDateTime: "2025-03-14T19:38:31Z",
      addedToOrgDateTime: "2025-03-14T12:38:31.939Z",
      updatedDateTime: "2025-08-22T07:30:20.825Z",
      deviceCapacity: "256GB",
      color: "MIDNIGHT",
      status: "UNASSIGNED",
      wifiMacAddress: "849437DA919E",
      bluetoothMacAddress: "849437E4E1D4",
      ethernetMacAddress: ["84AC16000186F8DA"],
      orderNumber: "CE-2025-03-14-05-38-31-760",
      purchaseSourceType: "MANUALLY_ADDED",
      productType: "Mac15,12",
      partNumber: "MRXV3LL/A",
    },
  },
]

export function getMockDevicesResponse(
  limit: number = 50,
  cursor?: string
): ABMDevicesResponse {
  const startIndex = cursor ? parseInt(cursor) || 0 : 0
  const endIndex = startIndex + limit
  const devices = mockDevices.slice(startIndex, endIndex)
  const hasMore = endIndex < mockDevices.length

  return {
    data: devices,
    links: {
      self: `https://api-business.apple.com/v1/orgDevices?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`,
      ...(hasMore && {
        next: `https://api-business.apple.com/v1/orgDevices?limit=${limit}&cursor=${endIndex}`,
      }),
    },
    meta: {
      paging: {
        limit,
        ...(hasMore && { nextCursor: endIndex.toString() }),
      },
    },
  }
}

/**
 * Use mock data in development when ABM is not configured
 */
export function shouldUseMockData(): boolean {
  return process.env.NODE_ENV === "development" && process.env.USE_MOCK_ABM === "true"
}
