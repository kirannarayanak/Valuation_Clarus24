-- Run this SQL in your Supabase SQL Editor to create all tables
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste this → Run

-- Create enums first
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER');
CREATE TYPE "PricingProvider" AS ENUM ('MANUAL', 'APPLE_TRADEIN', 'MARKET');
CREATE TYPE "PricingCondition" AS ENUM ('NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR');
CREATE TYPE "Currency" AS ENUM ('USD', 'AED', 'INR');
CREATE TYPE "PricingMatchLevel" AS ENUM ('EXACT', 'NO_STORAGE', 'FAMILY_FALLBACK', 'NONE');

-- User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Session table
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE INDEX "Session_userId_idx" ON "Session"("userId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Device table
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "serialNumberMasked" TEXT NOT NULL,
    "productFamily" TEXT,
    "deviceModel" TEXT,
    "productType" TEXT,
    "deviceCapacity" TEXT,
    "color" TEXT,
    "status" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "addedToOrgDate" TIMESTAMP(3),
    "updatedDate" TIMESTAMP(3),
    "wifiMacAddress" TEXT,
    "bluetoothMacAddress" TEXT,
    "ethernetMacAddress" TEXT,
    "imei" TEXT,
    "meid" TEXT,
    "eid" TEXT,
    "assignedServerId" TEXT,
    "purchaseSourceType" TEXT,
    "purchaseSourceId" TEXT,
    "orderNumber" TEXT,
    "releasedFromOrgDate" TIMESTAMP(3),
    "rawPayload" JSONB,
    "lastSeenFromABM" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");
CREATE UNIQUE INDEX "Device_serialNumber_key" ON "Device"("serialNumber");
CREATE INDEX "Device_productFamily_idx" ON "Device"("productFamily");
CREATE INDEX "Device_status_idx" ON "Device"("status");
CREATE INDEX "Device_purchaseDate_idx" ON "Device"("purchaseDate");
CREATE INDEX "Device_lastSeenFromABM_idx" ON "Device"("lastSeenFromABM");

-- PurchaseMetadata table
CREATE TABLE "PurchaseMetadata" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DECIMAL(10,2),
    "notes" TEXT,
    "enteredBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseMetadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PurchaseMetadata_deviceId_key" ON "PurchaseMetadata"("deviceId");

ALTER TABLE "PurchaseMetadata" ADD CONSTRAINT "PurchaseMetadata_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Pricing table
CREATE TABLE "Pricing" (
    "id" TEXT NOT NULL,
    "provider" "PricingProvider" NOT NULL,
    "productFamily" TEXT NOT NULL,
    "productType" TEXT,
    "deviceModel" TEXT,
    "storage" TEXT,
    "condition" "PricingCondition" NOT NULL DEFAULT 'NEW',
    "region" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Pricing_provider_productFamily_productType_idx" ON "Pricing"("provider", "productFamily", "productType");
CREATE INDEX "Pricing_effectiveDate_idx" ON "Pricing"("effectiveDate");
CREATE INDEX "Pricing_productFamily_deviceModel_storage_condition_region_idx" ON "Pricing"("productFamily", "deviceModel", "storage", "condition", "region");

-- PricingResult table
CREATE TABLE "PricingResult" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "provider" "PricingProvider" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "displayCurrency" "Currency",
    "displayPrice" DECIMAL(10,2),
    "matchLevel" "PricingMatchLevel" NOT NULL,
    "condition" "PricingCondition",
    "explanation" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PricingResult_deviceId_idx" ON "PricingResult"("deviceId");
CREATE INDEX "PricingResult_provider_idx" ON "PricingResult"("provider");
CREATE INDEX "PricingResult_computedAt_idx" ON "PricingResult"("computedAt");
CREATE INDEX "PricingResult_matchLevel_idx" ON "PricingResult"("matchLevel");

ALTER TABLE "PricingResult" ADD CONSTRAINT "PricingResult_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ABMConfig table
CREATE TABLE "ABMConfig" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configuredBy" TEXT,
    "configuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestResult" BOOLEAN,
    "lastTestError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABMConfig_pkey" PRIMARY KEY ("id")
);

-- AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
