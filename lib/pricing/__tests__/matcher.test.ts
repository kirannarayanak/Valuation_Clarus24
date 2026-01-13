/**
 * Unit Tests: Pricing Matcher
 * 
 * Tests matching priority and fallback logic
 */

import { matchPricing } from "../matcher"
import { PricingProvider, PricingCondition, PricingMatchLevel } from "../types"
import { prisma } from "@/lib/db"

// Mock prisma for testing
jest.mock("@/lib/db", () => ({
  prisma: {
    pricing: {
      findFirst: jest.fn(),
    },
  },
}))

describe("Pricing Matcher", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should match EXACT level when all fields match", async () => {
    const device = {
      deviceId: "test-1",
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
    }

    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "pricing-1",
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
      price: 999.00,
      currency: "USD",
    })

    const result = await matchPricing(device)

    expect(result).not.toBeNull()
    expect(result?.matchLevel).toBe(PricingMatchLevel.EXACT)
    expect(result?.price).toBe(999.00)
  })

  it("should fallback to NO_STORAGE when storage doesn't match", async () => {
    const device = {
      deviceId: "test-2",
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: "512GB", // Different storage
      condition: PricingCondition.NEW,
      region: "US",
    }

    // First call (EXACT) returns null
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce(null)
    // Second call (NO_STORAGE) returns match
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "pricing-2",
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: "MacBook Air",
      storage: null, // No storage requirement
      condition: PricingCondition.NEW,
      region: "US",
      price: 999.00,
      currency: "USD",
    })

    const result = await matchPricing(device)

    expect(result).not.toBeNull()
    expect(result?.matchLevel).toBe(PricingMatchLevel.NO_STORAGE)
    expect(prisma.pricing.findFirst).toHaveBeenCalledTimes(2)
  })

  it("should fallback to FAMILY_FALLBACK when model doesn't match", async () => {
    const device = {
      deviceId: "test-3",
      productFamily: "Mac",
      deviceModel: "MacBook Pro", // Different model
      storage: "256GB",
      condition: PricingCondition.NEW,
      region: "US",
    }

    // EXACT returns null
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce(null)
    // NO_STORAGE returns null
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce(null)
    // FAMILY_FALLBACK returns match
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValueOnce({
      id: "pricing-3",
      provider: PricingProvider.MANUAL,
      productFamily: "Mac",
      deviceModel: null,
      productType: null,
      storage: null,
      condition: PricingCondition.NEW,
      region: "US",
      price: 799.00,
      currency: "USD",
    })

    const result = await matchPricing(device)

    expect(result).not.toBeNull()
    expect(result?.matchLevel).toBe(PricingMatchLevel.FAMILY_FALLBACK)
    expect(prisma.pricing.findFirst).toHaveBeenCalledTimes(3)
  })

  it("should return null (NONE) when no match found", async () => {
    const device = {
      deviceId: "test-4",
      productFamily: "Apple Watch",
      deviceModel: "Series 9",
      storage: "45mm",
      condition: PricingCondition.NEW,
      region: "US",
    }

    // All calls return null
    ;(prisma.pricing.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await matchPricing(device)

    expect(result).toBeNull()
    expect(prisma.pricing.findFirst).toHaveBeenCalledTimes(3)
  })
})
