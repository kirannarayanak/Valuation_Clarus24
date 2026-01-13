# Pricing Engine Documentation

## Overview

Production-ready pricing engine for Apple device inventory system. Implements strict matching logic, multi-currency support, and provider abstraction.

## Architecture

### Core Components

1. **Types** (`lib/pricing/types.ts`)
   - TypeScript interfaces and enums
   - Device, PricingCandidate, PricingResult types

2. **Currency Service** (`lib/pricing/currency.ts`)
   - Multi-currency support (USD, AED, INR)
   - Configurable exchange rates
   - Currency conversion utilities

3. **Matcher** (`lib/pricing/matcher.ts`)
   - Strict matching priority: EXACT → NO_STORAGE → FAMILY_FALLBACK → NONE
   - Database queries with proper indexing

4. **Providers** (`lib/pricing/providers.ts`)
   - ManualPricingProvider (fully implemented)
   - AppleTradeInProvider (stub - clearly labeled)
   - MarketPricingProvider (reads from database)

5. **Engine** (`lib/pricing/engine.ts`)
   - Main `calculatePricingForDevice()` function
   - Provider priority: MANUAL → MARKET → APPLE_TRADEIN
   - Persists results to database

## Data Model

### Pricing Table
- `provider`: Enum (MANUAL, APPLE_TRADEIN, MARKET)
- `productFamily`: String (iPhone, iPad, Mac, etc.)
- `deviceModel`: String? (e.g., "iPhone 15 Pro")
- `storage`: String? (e.g., "256GB")
- `condition`: Enum (NEW, EXCELLENT, GOOD, FAIR, POOR)
- `region`: String (US, UAE, IN)
- `price`: Decimal
- `currency`: Enum (USD, AED, INR)

### PricingResult Table
- `deviceId`: String (FK to Device)
- `provider`: PricingProvider enum
- `price`: Decimal (original price)
- `currency`: Currency enum (original currency)
- `displayPrice`: Decimal? (converted price)
- `displayCurrency`: Currency? (user-selected currency)
- `matchLevel`: Enum (EXACT, NO_STORAGE, FAMILY_FALLBACK, NONE)
- `explanation`: String (human-readable)

## Matching Logic

Strict priority order:

1. **EXACT**: productFamily + deviceModel + storage + condition + region
2. **NO_STORAGE**: productFamily + deviceModel + condition + region (storage ignored)
3. **FAMILY_FALLBACK**: productFamily + condition + region (model/storage ignored)
4. **NONE**: No match found

First successful match wins.

## Currency Support

### Supported Currencies
- **USD** (United States Dollar)
- **AED** (United Arab Emirates Dirham)
- **INR** (Indian Rupee)

### Exchange Rates
Configurable via environment variables:
- `EXCHANGE_RATE_USD_TO_AED` (default: 3.67)
- `EXCHANGE_RATE_USD_TO_INR` (default: 83.0)
- All other rates calculated automatically

### Usage
```typescript
import { calculatePricingForDevice } from "@/lib/pricing/engine"
import { Currency } from "@/lib/pricing/types"

const result = await calculatePricingForDevice(device, Currency.AED)
// Returns price in original currency + converted displayPrice in AED
```

## API

### Main Function

```typescript
calculatePricingForDevice(
  device: Device,
  displayCurrency?: Currency
): Promise<PricingResult | null>
```

**Input:**
```typescript
{
  deviceId: string
  productFamily: string | null
  deviceModel: string | null
  productType: string | null
  storage: string | null
  condition?: PricingCondition
  region?: string
}
```

**Output:**
```typescript
{
  price: number              // Original price
  currency: Currency          // Original currency
  displayPrice?: number       // Converted price (if displayCurrency specified)
  displayCurrency?: Currency  // Display currency
  provider: PricingProvider
  matchLevel: PricingMatchLevel
  explanation: string         // Human-readable explanation
}
```

## Sample Data

Run to populate sample pricing:
```bash
npx tsx scripts/add-sample-pricing.ts
```

Includes:
- iPhone, iPad, Mac models
- All 5 conditions (NEW, EXCELLENT, GOOD, FAIR, POOR)
- All 3 currencies (USD, AED, INR)
- Multiple regions (US, UAE, IN)

**Note:** Sample values are clearly labeled. Replace with actual market data.

## Testing

Unit tests included:
- `lib/pricing/__tests__/matcher.test.ts` - Matching priority tests
- `lib/pricing/__tests__/currency.test.ts` - Currency conversion tests

Run tests:
```bash
npm test
```

## Usage Example

```typescript
import { calculatePricingForDevice } from "@/lib/pricing/engine"
import { PricingCondition, Currency } from "@/lib/pricing/types"

const device = {
  deviceId: "device-123",
  productFamily: "Mac",
  deviceModel: "MacBook Air",
  storage: "256GB",
  condition: PricingCondition.EXCELLENT,
  region: "US",
}

// Calculate in original currency
const result = await calculatePricingForDevice(device)

// Calculate with currency conversion
const resultAED = await calculatePricingForDevice(device, Currency.AED)

console.log(result)
// {
//   price: 849.00,
//   currency: "USD",
//   displayPrice: 3114.33,
//   displayCurrency: "AED",
//   provider: "MANUAL",
//   matchLevel: "EXACT",
//   explanation: "Matched MacBook Air 256GB – excellent – US"
// }
```

## Key Features

✅ Strict matching priority (no ambiguity)
✅ Multi-currency support with conversion
✅ Provider abstraction (extensible)
✅ Match level tracking (EXACT, NO_STORAGE, etc.)
✅ Human-readable explanations
✅ Database persistence
✅ Type-safe (TypeScript)
✅ Unit tested
✅ Production-ready

## Important Notes

- **Apple Trade-In Provider**: Stub only. Clearly labeled as requiring manual/authorized source.
- **Exchange Rates**: Update regularly via environment variables.
- **Sample Data**: Replace with actual market data from reputable sources.
- **No Scraping**: Does not scrape Apple websites or claim official APIs.
