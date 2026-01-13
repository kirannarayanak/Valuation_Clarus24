# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Database

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/abm_valuation?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
ABM_CLIENT_ID="your-client-id"
ABM_KEY_ID="your-key-id"
ABM_PRIVATE_KEY_PATH="./abm_key_unencrypted.pem"
```

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
```

## 3. Create Admin User

You can create a user via Prisma Studio:

```bash
npx prisma studio
```

Or create a simple script:

```typescript
// scripts/create-admin.ts
import { prisma } from "../lib/db"
import { hashPassword } from "../lib/auth"

async function main() {
  const email = "admin@example.com"
  const password = "your-secure-password"
  
  await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
      name: "Admin User",
    },
  })
  
  console.log("Admin user created!")
}

main()
```

Run with: `npx tsx scripts/create-admin.ts`

## 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 5. Sync Devices from ABM

1. Navigate to Settings → ABM Configuration
2. Click "Test Connection" to verify your credentials
3. Go to Devices page and click "Sync from ABM"

## Using Mock Data (Development)

To test without real ABM credentials, add to `.env`:

```env
USE_MOCK_ABM=true
NODE_ENV=development
```

The app will use mock device data for testing.
