# ChatGPT Prompt: Get Accurate Apple Device Resale Prices

Copy and paste this prompt to ChatGPT to get comprehensive, accurate resale pricing data for all Apple devices:

---

## PROMPT FOR CHATGPT:

I need comprehensive, accurate resale/trade-in pricing data for all Apple devices to populate a device inventory management system. Please provide pricing information in a structured format that I can import into a database.

**Requirements:**
1. Include ALL Apple product categories: iPhone, iPad, Mac (all models), Apple Watch, AirPods, Apple TV, HomePod
2. For each device, provide pricing for different storage capacities (64GB, 128GB, 256GB, 512GB, 1TB, 2TB where applicable)
3. Include pricing for different conditions: "new", "excellent", "good", "fair", "poor"
4. Focus on US market pricing in USD
5. Use current market rates (as of 2025) from reputable sources like:
   - Apple Trade-In program
   - Swappa market prices
   - Gazelle/Decluttr trade-in values
   - eBay sold listings (average)
   - Back Market refurbished prices

**Output Format:**
Provide the data as a JSON array where each entry follows this structure:

```json
{
  "provider": "market",
  "productFamily": "iPhone",
  "deviceModel": "iPhone 15 Pro",
  "storage": "256GB",
  "condition": "excellent",
  "region": "US",
  "price": 850.00,
  "currency": "USD",
  "notes": "Based on Swappa average for excellent condition"
}
```

**Specific Device Models to Include:**

**iPhone:**
- iPhone 15 Pro / Pro Max (all storage, all conditions)
- iPhone 15 / 15 Plus (all storage, all conditions)
- iPhone 14 Pro / Pro Max (all storage, all conditions)
- iPhone 14 / 14 Plus (all storage, all conditions)
- iPhone 13 Pro / Pro Max (all storage, all conditions)
- iPhone 13 / 13 mini (all storage, all conditions)
- iPhone 12 Pro / Pro Max (all storage, all conditions)
- iPhone 12 / 12 mini (all storage, all conditions)
- iPhone 11 Pro / Pro Max (all storage, all conditions)
- iPhone 11 / XR / XS / XS Max (all storage, all conditions)
- iPhone X / 8 / 8 Plus (all storage, all conditions)

**iPad:**
- iPad Pro 13-inch (M4, M3, M2, M1) - all storage, all conditions
- iPad Pro 11-inch (M4, M3, M2, M1) - all storage, all conditions
- iPad Air (M2, M1, previous generations) - all storage, all conditions
- iPad (10th, 9th, 8th gen) - all storage, all conditions
- iPad mini (6th, 5th gen) - all storage, all conditions

**Mac:**
- MacBook Pro 16-inch (M3 Pro/Max, M2 Pro/Max, M1 Pro/Max) - all storage, all conditions
- MacBook Pro 14-inch (M3 Pro/Max, M2 Pro/Max, M1 Pro/Max) - all storage, all conditions
- MacBook Pro 13-inch (M2, M1) - all storage, all conditions
- MacBook Air 15-inch (M3, M2) - all storage, all conditions
- MacBook Air 13-inch (M3, M2, M1) - all storage, all conditions
- Mac Studio (M2 Ultra, M1 Ultra, M2 Max, M1 Max) - all storage, all conditions
- Mac mini (M2 Pro, M2, M1) - all storage, all conditions
- iMac 24-inch (M3, M1) - all storage, all conditions
- Mac Pro (Intel and Apple Silicon) - all configurations

**Apple Watch:**
- Apple Watch Series 9, 8, 7, 6, SE (all sizes, all conditions)

**Other:**
- AirPods Pro (2nd, 1st gen)
- AirPods (3rd, 2nd gen)
- Apple TV 4K
- HomePod / HomePod mini

**Pricing Guidelines:**
- "new" condition: 85-95% of retail price
- "excellent" condition: 70-85% of retail price (like new, minimal wear)
- "good" condition: 55-70% of retail price (some wear, fully functional)
- "fair" condition: 40-55% of retail price (visible wear, minor issues)
- "poor" condition: 25-40% of retail price (significant wear, may have issues)

**Important Notes:**
- Base prices on actual market data, not MSRP
- Consider device age and depreciation
- Include notes about data source for each entry
- If a specific model/storage combination isn't available, note it
- Provide at least 3-5 price points per device model (different conditions)

Please provide this data in a clean, importable JSON format that I can use to populate a pricing database table.

---

## How to Use This Prompt:

1. Copy the entire prompt above
2. Paste it into ChatGPT
3. ChatGPT will generate comprehensive pricing data
4. Save the JSON output
5. Use the script below to import it into your database
