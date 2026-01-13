/**
 * Currency Service
 * 
 * Handles currency conversion between AED, USD, and INR
 * Exchange rates are configurable via environment variables
 */

export enum Currency {
  USD = "USD",
  AED = "AED",
  INR = "INR",
}

export interface ExchangeRates {
  USD_TO_AED: number
  USD_TO_INR: number
  AED_TO_USD: number
  AED_TO_INR: number
  INR_TO_USD: number
  INR_TO_AED: number
}

/**
 * Get exchange rates from environment or use defaults
 */
function getExchangeRates(): ExchangeRates {
  // Default rates (as of 2025, should be updated regularly)
  const defaults: ExchangeRates = {
    USD_TO_AED: 3.67, // 1 USD = 3.67 AED
    USD_TO_INR: 83.0, // 1 USD = 83 INR
    AED_TO_USD: 1 / 3.67,
    AED_TO_INR: 83.0 / 3.67,
    INR_TO_USD: 1 / 83.0,
    INR_TO_AED: 3.67 / 83.0,
  }

  // Allow override via environment variables
  return {
    USD_TO_AED: parseFloat(process.env.EXCHANGE_RATE_USD_TO_AED || String(defaults.USD_TO_AED)),
    USD_TO_INR: parseFloat(process.env.EXCHANGE_RATE_USD_TO_INR || String(defaults.USD_TO_INR)),
    AED_TO_USD: parseFloat(process.env.EXCHANGE_RATE_AED_TO_USD || String(defaults.AED_TO_USD)),
    AED_TO_INR: parseFloat(process.env.EXCHANGE_RATE_AED_TO_INR || String(defaults.AED_TO_INR)),
    INR_TO_USD: parseFloat(process.env.EXCHANGE_RATE_INR_TO_USD || String(defaults.INR_TO_USD)),
    INR_TO_AED: parseFloat(process.env.EXCHANGE_RATE_INR_TO_AED || String(defaults.INR_TO_AED)),
  }
}

/**
 * Convert price from one currency to another
 * 
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted amount (rounded to 2 decimal places)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const rates = getExchangeRates()
  let converted: number

  // Convert via USD as base currency
  if (fromCurrency === Currency.USD) {
    if (toCurrency === Currency.AED) {
      converted = amount * rates.USD_TO_AED
    } else if (toCurrency === Currency.INR) {
      converted = amount * rates.USD_TO_INR
    } else {
      converted = amount
    }
  } else if (fromCurrency === Currency.AED) {
    if (toCurrency === Currency.USD) {
      converted = amount * rates.AED_TO_USD
    } else if (toCurrency === Currency.INR) {
      converted = amount * rates.AED_TO_INR
    } else {
      converted = amount
    }
  } else if (fromCurrency === Currency.INR) {
    if (toCurrency === Currency.USD) {
      converted = amount * rates.INR_TO_USD
    } else if (toCurrency === Currency.AED) {
      converted = amount * rates.INR_TO_AED
    } else {
      converted = amount
    }
  } else {
    throw new Error(`Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`)
  }

  // Round to 2 decimal places
  return Math.round(converted * 100) / 100
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    [Currency.USD]: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }),
    [Currency.AED]: new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }),
    [Currency.INR]: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }),
  }

  return formatters[currency].format(amount)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    [Currency.USD]: "$",
    [Currency.AED]: "د.إ",
    [Currency.INR]: "₹",
  }
  return symbols[currency]
}
