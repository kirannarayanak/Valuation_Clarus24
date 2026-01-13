# Pricing System Documentation

## How Pricing is Stored

### Database Structure

Pricing data is stored in the `Pricing` table with the following structure:

```typescript
{
  id: string                    // Unique identifier
  provider: string              // "manual", "apple_tradein", "market"
  productFamily: string         // "iPhone", "iPad", "Mac", "Apple Watch", etc.
  productType: string?          // Optional: "iPhone14,2", "Mac14,2" (model identifier)
  deviceModel: string?          // "iPhone 15 Pro", "MacBook Air", etc.
  storage: string?              // "64GB", "256GB", "512GB", "1TB"
  condition: string             // "new", "excellent", "good", "fair", "poor"
  region: string                // "US", "EU", "UK", etc.
  price: Decimal                // The resale price
  currency: string              // "USD", "EUR", etc.
  effectiveDate: DateTime       // When this price becomes effective
  expiresAt: DateTime?          // Optional: when price expires
  notes: string?                // Additional notes
}
```

### How It Works

1. **Pricing Entries**: Stored in the `Pricing` table (manual entries, market data, etc.)
2. **Pricing Results**: When you click "Calculate Pricing", the system:
   - Matches each device to pricing entries
   - Looks for matches by: productFamily → deviceModel → storage → condition
   - Stores results in `PricingResult` table (one per device)
3. **Display**: Dashboard shows the latest `PricingResult` for each device

### Current Sample Data

Sample pricing is stored in `scripts/add-sample-pricing.ts` and includes:
- Mac models (Mac mini, MacBook Air)
- iPad models (iPad Pro)
- iPhone models (iPhone X, iPhone 8 Plus)

These are example prices that you should replace with accurate market data.

## How to Update Pricing

### Option 1: Add Pricing via Script
Edit `scripts/add-sample-pricing.ts` and run:
```bash
npx tsx scripts/add-sample-pricing.ts
```

### Option 2: Add via Database (Prisma Studio)
```bash
npx prisma studio
```
Navigate to `Pricing` table and add entries manually.

### Option 3: Add via API (Future)
A pricing management UI can be built to add/edit pricing entries.

## Pricing Matching Logic

The system tries to match devices in this order:
1. Exact match: productFamily + deviceModel + storage + condition
2. Without storage: productFamily + deviceModel + condition
3. Generic: productFamily + condition (no specific model)

This allows flexible pricing - you can have:
- Specific prices for "MacBook Air M3 256GB"
- Generic prices for "MacBook Air" (any storage)
- Fallback prices for "Mac" (any model)
