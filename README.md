# ABM Device Valuation

A production-grade web application for managing Apple Business Manager (ABM) device inventory and valuation estimates.

## Features

- **ABM Integration**: Authenticate and sync devices from Apple Business Manager using OAuth client credentials with ES256 JWT
- **Device Inventory Dashboard**: View, search, filter, and paginate through your device inventory
- **Device Details**: Detailed view of each device with purchase dates, status, and valuation
- **Pricing Providers**: Pluggable pricing system supporting manual price tables, market pricing, and trade-in estimates
- **Security**: Role-based access control, masked serial numbers, audit logging, and secure credential management

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Email/password with bcrypt
- **ABM OAuth**: ES256 JWT signing with jose library

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Apple Business Manager API credentials (Client ID, Key ID, and private key .pem file)

## Setup Instructions

### 1. Clone and Install

```bash
cd ABM_Valuation
npm install
```

### 2. Database Setup

Create a PostgreSQL database and set the connection string:

```bash
# Create .env file
cp .env.example .env

# Edit .env and set your DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/abm_valuation?schema=public"
```

Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

### 3. Configure ABM Credentials

Add your ABM credentials to `.env`:

```env
ABM_CLIENT_ID="BUSINESSAPI.your-client-id"
ABM_KEY_ID="your-key-id"
ABM_PRIVATE_KEY_PATH="./abm_key_unencrypted.pem"
# OR use base64 encoded key (more secure):
# ABM_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTi..."
```

**Security Note**: 
- For local development, you can use `ABM_PRIVATE_KEY_PATH` pointing to your `.pem` file
- For production, use `ABM_PRIVATE_KEY_BASE64` with a base64-encoded key (more secure)
- Never commit `.pem` files or `.env` files to version control

### 4. Configure NextAuth

Set a secure secret for NextAuth:

```bash
# Generate a random secret
openssl rand -base64 32
```

Add to `.env`:
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret"
```

### 5. Create Initial Admin User

Create a seed script or manually insert a user:

```typescript
// You can run this in a script or via Prisma Studio
await prisma.user.create({
  data: {
    email: "admin@example.com",
    passwordHash: await hashPassword("your-secure-password"),
    role: "ADMIN",
    name: "Admin User",
  },
})
```

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
ABM_Valuation/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   └── abm/             # ABM integration endpoints
│   ├── dashboard/           # Dashboard page
│   ├── devices/             # Device listing and detail pages
│   └── settings/            # Settings pages
├── components/              # React components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility libraries
│   ├── abm/                 # ABM OAuth and API client
│   ├── pricing/             # Pricing provider system
│   ├── auth.ts              # Authentication utilities
│   └── db.ts                # Prisma client
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## Key Features Explained

### ABM OAuth Integration

The app implements OAuth client credentials flow with ES256 JWT:

1. Loads your EC P-256 private key
2. Builds a JWT client_assertion with claims: `iss`, `sub`, `aud`, `iat`, `exp`, `jti`
3. Signs with ES256 algorithm and includes your `key_id` in header
4. Exchanges JWT for access token via `POST /auth/oauth2/token`
5. Uses access token to call ABM API endpoints

### Device Sync

- `/api/abm/sync` - Fetches devices from ABM and stores/updates them in the database
- Supports pagination with cursor-based navigation
- Preserves raw ABM payload for audit/debugging
- Masks serial numbers by default for security

### Pricing Providers

The pricing system is pluggable with these providers:

1. **Manual Pricing** - Admin-entered price tables by model/storage/condition
2. **Apple Trade-In** - Stub for authorized integration (returns null if not available)
3. **Market Pricing** - Stub for external pricing APIs or CSV uploads

Providers are checked in order, and the first available price is used.

### Security Features

- **Role-Based Access Control**: Admin and Viewer roles
- **Masked Serial Numbers**: Serial numbers are masked by default (reveal requires permission)
- **Audit Logging**: All credential changes and sensitive actions are logged
- **Environment Variables**: Sensitive credentials stored in env, never in code
- **Secure Token Storage**: ABM tokens stored in memory (refresh as needed)

## API Routes

- `GET /api/abm/devices` - Fetch devices from ABM (with pagination)
- `POST /api/abm/sync` - Sync devices from ABM to database
- `POST /api/abm/test` - Test ABM connection

## Database Schema

Key models:
- **User** - Authentication and authorization
- **Device** - Device inventory from ABM
- **Pricing** - Price table entries
- **PricingResult** - Computed prices per device
- **PurchaseMetadata** - Manual purchase date/price entry
- **AuditLog** - Security audit trail

See `prisma/schema.prisma` for full schema.

## Development

### Database Management

```bash
# Open Prisma Studio to view/edit data
npm run db:studio

# Create a migration
npm run db:migrate

# Push schema changes (dev only)
npm run db:push
```

### Testing

```bash
# Run tests (when implemented)
npm test
```

## Production Deployment

### Environment Variables

Set these in your production environment:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production domain
- `NEXTAUTH_SECRET` - Strong random secret
- `ABM_CLIENT_ID` - Your ABM client ID
- `ABM_KEY_ID` - Your ABM key ID
- `ABM_PRIVATE_KEY_BASE64` - Base64-encoded private key (preferred)
- `NODE_ENV=production`

### Security Checklist

- [ ] Use `ABM_PRIVATE_KEY_BASE64` instead of file paths
- [ ] Store secrets in a secure secret management system
- [ ] Enable HTTPS/TLS
- [ ] Set up rate limiting on API routes
- [ ] Configure CORS appropriately
- [ ] Set up database backups
- [ ] Enable audit logging
- [ ] Review and restrict admin access

## Troubleshooting

### "ABM authentication failed: invalid_client"

- Verify your `ABM_CLIENT_ID` matches your API client
- Verify your `ABM_KEY_ID` matches the key used to sign the JWT
- Verify your private key matches the public key registered with Apple
- Ensure the key file path is correct or base64 encoding is valid

### "No devices found"

- First, sync devices using the "Sync from ABM" button or `/api/abm/sync`
- Check that your ABM account has devices
- Verify API permissions include `business.api` scope

### Database connection errors

- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run `npx prisma generate` and `npx prisma db push`

## License

[Your License Here]

## Support

[Your Support Contact Information]
