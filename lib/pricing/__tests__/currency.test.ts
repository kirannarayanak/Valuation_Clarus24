/**
 * Unit Tests: Currency Conversion
 */

import { convertCurrency, Currency, formatCurrency } from "../currency"

describe("Currency Conversion", () => {
  // Mock exchange rates for testing
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it("should return same amount for same currency", () => {
    expect(convertCurrency(100, Currency.USD, Currency.USD)).toBe(100)
    expect(convertCurrency(100, Currency.AED, Currency.AED)).toBe(100)
    expect(convertCurrency(100, Currency.INR, Currency.INR)).toBe(100)
  })

  it("should convert USD to AED correctly", () => {
    const result = convertCurrency(100, Currency.USD, Currency.AED)
    // Default rate: 1 USD = 3.67 AED
    expect(result).toBeCloseTo(367, 0) // 100 * 3.67 = 367
  })

  it("should convert USD to INR correctly", () => {
    const result = convertCurrency(100, Currency.USD, Currency.INR)
    // Default rate: 1 USD = 83 INR
    expect(result).toBeCloseTo(8300, 0) // 100 * 83 = 8300
  })

  it("should convert AED to USD correctly", () => {
    const result = convertCurrency(367, Currency.AED, Currency.USD)
    // 367 AED / 3.67 = 100 USD
    expect(result).toBeCloseTo(100, 0)
  })

  it("should convert INR to USD correctly", () => {
    const result = convertCurrency(8300, Currency.INR, Currency.USD)
    // 8300 INR / 83 = 100 USD
    expect(result).toBeCloseTo(100, 0)
  })

  it("should round to 2 decimal places", () => {
    const result = convertCurrency(1, Currency.USD, Currency.AED)
    expect(result).toBe(3.67)
  })

  it("should use custom exchange rates from environment", () => {
    process.env.EXCHANGE_RATE_USD_TO_AED = "4.0"
    jest.resetModules()
    const { convertCurrency: convert } = require("../currency")
    
    const result = convert(100, Currency.USD, Currency.AED)
    expect(result).toBe(400)
  })

  it("should format currency correctly", () => {
    expect(formatCurrency(999.99, Currency.USD)).toContain("$")
    expect(formatCurrency(999.99, Currency.USD)).toContain("999.99")
    
    expect(formatCurrency(3667, Currency.AED)).toContain("د.إ")
    
    expect(formatCurrency(82917, Currency.INR)).toContain("₹")
  })
})
