# Pricing Calculation Explained

## Overview

The pricing system uses a **multi-tier approach** with fallback mechanisms to ensure every device gets a resale price estimate.

---

## Pricing Sources (Priority Order)

### 1. **MANUAL Pricing** (Primary Source)
- **Source**: Admin-entered prices in the `Pricing` database table
- **How to add**: Use `/settings/pricing` page or import via scripts
- **Priority**: Highest (checked first)

### 2. **MARKET Pricing** (Secondary Source)
- **Source**: Admin-entered market prices in `Pricing` table where `provider="MARKET"`
- **Use case**: Imported from CSV, market research, or third-party pricing APIs
- **Priority**: Second

### 3. **APPLE_TRADEIN** (Stub - Not Active)
- **Source**: Would require authorized Apple integration (not implemented)
- **Status**: Returns empty results unless manually entered in Pricing table
- **Priority**: Third (lowest)

### 4. **Dynamic Estimator** (Fallback)
- **Source**: Hardcoded formulas and multipliers (see below)
- **When used**: When no exact match found in Pricing table
- **Priority**: Last resort

---

## Matching Logic (How We Find Prices)

When calculating a price, the system tries to match in this **strict order**:

### Level 1: EXACT Match
```
productFamily + deviceModel + storage + condition + region
```
**Example**: "iPhone 15 Pro 256GB EXCELLENT US"

### Level 2: NO_STORAGE Match
```
productFamily + deviceModel + condition + region (storage ignored)
```
**Example**: "iPhone 15 Pro EXCELLENT US" (any storage)

### Level 3: FAMILY_FALLBACK Match
```
productFamily + condition + region (model and storage ignored)
```
**Example**: "iPhone EXCELLENT US" (any iPhone model)

### Level 4: NONE (Use Estimator)
If no match found, falls back to dynamic estimation.

---

## Dynamic Estimator Formula

When no pricing data exists, the system uses this formula:

```
Estimated Price = Base Price × Storage Multiplier × Model Multiplier
```

### Base Prices (by Product Family & Condition)

| Product Family | NEW | EXCELLENT | GOOD | FAIR | POOR |
|---------------|-----|-----------|------|------|------|
| iPhone | $800 | $650 | $500 | $350 | $200 |
| iPad | $600 | $480 | $360 | $240 | $120 |
| Mac | $1,200 | $960 | $720 | $480 | $240 |
| Apple Watch | $400 | $320 | $240 | $160 | $80 |

**Note**: These are approximate market values used as fallbacks.

### Storage Multipliers

| Storage | Multiplier |
|---------|------------|
| 64GB | 0.85x |
| 128GB | 1.0x (base) |
| 256GB | 1.15x |
| 512GB | 1.35x |
| 1TB | 1.6x |
| 2TB | 2.0x |

### Model Generation Multipliers

**iPhone:**
- iPhone 15: 1.0x (latest)
- iPhone 14: 0.85x
- iPhone 13: 0.70x
- iPhone 12: 0.55x
- iPhone 11: 0.40x
- iPhone X: 0.30x
- iPhone 8: 0.25x
- iPhone 7: 0.20x
- iPhone 6: 0.15x

**iPad:**
- M5/M4: 1.0x
- M3: 0.85x
- M2: 0.70x
- M1: 0.55x

**Mac:**
- M3: 1.0x
- M2: 0.85x
- M1: 0.70x
- Intel (2018-2020): 0.50x

---

## Condition Determination (Resale-Only)

**Important**: All devices are treated as **used/resale** (never NEW).

Condition is determined by **device age** (from purchase date):

| Age | Condition |
|-----|-----------|
| < 1 year | EXCELLENT |
| 1-2 years | EXCELLENT |
| 2-3 years | GOOD |
| 3-5 years | FAIR |
| 5+ years | POOR |

If no purchase date exists, defaults to **GOOD** condition.

---

## Example Calculations

### Example 1: iPhone 15 Pro 256GB (1 year old)
1. Try EXACT match: "iPhone 15 Pro 256GB EXCELLENT US"
2. If not found, try NO_STORAGE: "iPhone 15 Pro EXCELLENT US"
3. If not found, try FAMILY_FALLBACK: "iPhone EXCELLENT US"
4. If not found, use Estimator:
   - Base: $650 (iPhone EXCELLENT)
   - Storage: 1.15x (256GB)
   - Model: 1.0x (iPhone 15)
   - **Result**: $650 × 1.15 × 1.0 = **$748**

### Example 2: iPhone X 64GB (5 years old)
1. Try EXACT match: "iPhone X 64GB POOR US"
2. If not found, use Estimator:
   - Base: $200 (iPhone POOR)
   - Storage: 0.85x (64GB)
   - Model: 0.30x (iPhone X)
   - **Result**: $200 × 0.85 × 0.30 = **$51**

---

## Currency Conversion

If display currency differs from source currency, prices are converted using exchange rates:

- **USD ↔ AED**: 1 USD = 3.67 AED
- **USD ↔ INR**: 1 USD = 83 INR
- **AED ↔ INR**: Via USD (AED → USD → INR)

Exchange rates are configurable in `lib/pricing/currency.ts`.

---

## Data Sources

### Current Implementation
- **Manual Pricing**: Admin-entered (no external source)
- **Market Pricing**: Admin-entered (no external source)
- **Estimator**: Hardcoded base prices and multipliers (not from real-time market data)

### Future Enhancements (Not Implemented)
- Real-time market pricing APIs (e.g., eBay, Swappa, Gazelle)
- Apple Trade-In API (requires authorized integration)
- Automated price scraping (requires compliance with terms of service)

---

## Accuracy & Confidence

- **EXACT Match**: High confidence (exact pricing data)
- **NO_STORAGE Match**: Medium confidence (approximate for storage)
- **FAMILY_FALLBACK Match**: Low confidence (generic family pricing)
- **Estimator**: Low confidence (formula-based estimate)

All estimates are clearly labeled with `[ESTIMATE - Add pricing data for accurate value]` in the explanation.

---

## Recommendations

1. **Add Manual Pricing**: Enter real market prices for your most common devices
2. **Import Market Data**: Use CSV import or scripts to bulk-add pricing
3. **Update Regularly**: Market prices change, update your Pricing table quarterly
4. **Use Estimator as Fallback**: Estimator is for devices without explicit pricing only

---

## Files Reference

- **Engine**: `lib/pricing/engine.ts` - Main calculation logic
- **Matcher**: `lib/pricing/matcher.ts` - Matching algorithm
- **Estimator**: `lib/pricing/estimator.ts` - Dynamic estimation formulas
- **Providers**: `lib/pricing/providers.ts` - Pricing source abstraction
- **Currency**: `lib/pricing/currency.ts` - Exchange rate conversion
