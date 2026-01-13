/**
 * Apple Business Manager (ABM) OAuth Authentication
 * 
 * Implements OAuth client credentials flow with ES256 JWT client_assertion
 * Based on the working Python implementation in test.py
 */

import { SignJWT, importPKCS8 } from "jose"
import { readFileSync } from "fs"
import { join } from "path"
import crypto from "crypto"

const JWT_TTL_SECONDS = 15 * 60 // 15 minutes

export interface ABMConfig {
  clientId: string
  keyId: string
  privateKeyPath?: string
  privateKeyBase64?: string
  tokenUrl?: string
  jwtAudience?: string
}

export interface ABMTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * Load EC private key from PEM file or base64 string
 */
function loadPrivateKey(config: ABMConfig): string {
  let privateKeyPEM: string
  
  if (config.privateKeyBase64) {
    try {
      // Try multiple decoding approaches
      let decoded: string
      try {
        // Standard base64 decode
        decoded = Buffer.from(config.privateKeyBase64, "base64").toString("utf-8")
      } catch (e1) {
        try {
          // Try if it's already a string (double-encoded)
          decoded = Buffer.from(config.privateKeyBase64, "base64").toString("utf-8")
          // If that doesn't work, try direct decode
          if (!decoded.includes("BEGIN")) {
            decoded = atob(config.privateKeyBase64)
          }
        } catch (e2) {
          // Last resort: try as direct string
          decoded = config.privateKeyBase64
        }
      }
      
      privateKeyPEM = decoded
      
      // If it's still base64 encoded (doesn't contain BEGIN), decode again
      if (!privateKeyPEM.includes("BEGIN") && !privateKeyPEM.includes("PRIVATE")) {
        try {
          privateKeyPEM = Buffer.from(privateKeyPEM, "base64").toString("utf-8")
        } catch {
          // If that fails, it might already be decoded
        }
      }
    } catch (error) {
      throw new Error(`Failed to decode base64 private key: ${error instanceof Error ? error.message : String(error)}`)
    }
  } else if (config.privateKeyPath) {
    // Resolve path relative to project root or use absolute path
    const keyPath = config.privateKeyPath.startsWith("/")
      ? config.privateKeyPath
      : join(process.cwd(), config.privateKeyPath)
    
    privateKeyPEM = readFileSync(keyPath, "utf-8")
  } else {
    throw new Error("Either privateKeyPath or privateKeyBase64 must be provided")
  }
  
  // Clean and normalize the PEM key
  privateKeyPEM = privateKeyPEM.trim()
  
  // Remove any carriage returns and normalize line endings
  privateKeyPEM = privateKeyPEM.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  
  // Validate it's a PEM key
  if (!privateKeyPEM.includes("-----BEGIN") || !privateKeyPEM.includes("-----END")) {
    throw new Error("Invalid PEM format: missing BEGIN/END markers. The key might not be properly decoded.")
  }
  
  // Ensure proper line endings between header and content
  privateKeyPEM = privateKeyPEM.replace(/-----BEGIN([^-]+)-----\s*/g, "-----BEGIN$1-----\n")
  privateKeyPEM = privateKeyPEM.replace(/\s*-----END([^-]+)-----/g, "\n-----END$1-----")
  
  // Ensure proper line endings
  if (!privateKeyPEM.endsWith("\n")) {
    privateKeyPEM += "\n"
  }
  
  return privateKeyPEM
}

/**
 * Build ES256 client_assertion JWT for ABM OAuth
 */
export async function buildClientAssertion(config: ABMConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const jwtId = crypto.randomUUID()
  
  console.log("[ABM Auth] Building client assertion JWT...")
  console.log("[ABM Auth] Client ID:", config.clientId)
  console.log("[ABM Auth] Key ID:", config.keyId)
  
  const privateKeyPEM = loadPrivateKey(config)
  
  // Validate the key is EC P-256
  let keyObj: crypto.KeyObject
  try {
    keyObj = crypto.createPrivateKey(privateKeyPEM)
    
    // Check key type
    if (keyObj.asymmetricKeyType !== "ec") {
      throw new Error("Key must be an EC (Elliptic Curve) private key")
    }
    
    // Check curve (P-256)
    const keyDetails = keyObj.asymmetricKeyDetails
    if (keyDetails && keyDetails.namedCurve !== "prime256v1") {
      throw new Error(`Key curve must be P-256 (prime256v1), got: ${keyDetails.namedCurve}`)
    }
    
    console.log("[ABM Auth] ✓ Key validated: EC P-256")
  } catch (error) {
    console.error("[ABM Auth] ✗ Key validation failed:", error)
    if (error instanceof Error && error.message.includes("Key must be")) {
      throw error
    }
    throw new Error(`Invalid private key: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Convert PEM to PKCS8 format for jose library
  // jose library expects PKCS8 format (which is what PEM private keys typically are)
  let pkcs8Key: string
  try {
    const exported = keyObj.export({ format: "pem", type: "pkcs8" })
    pkcs8Key = typeof exported === "string" ? exported : exported.toString("utf-8")
    console.log("[ABM Auth] ✓ Key exported to PKCS8 format")
  } catch (error) {
    console.warn("[ABM Auth] ⚠ Export to PKCS8 failed, using original PEM:", error)
    // If export fails, try using the original PEM (it might already be PKCS8)
    pkcs8Key = privateKeyPEM
  }
  
  // Import the PKCS8 key for signing with jose
  let signingKey
  try {
    signingKey = await importPKCS8(pkcs8Key, "ES256")
    console.log("[ABM Auth] ✓ Key imported for signing")
  } catch (error) {
    console.error("[ABM Auth] ✗ Failed to import key for signing:", error)
    throw new Error(`Failed to import private key for signing: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  const jwtAudience = config.jwtAudience || "https://account.apple.com/auth/oauth2/v2/token"
  console.log("[ABM Auth] JWT Audience:", jwtAudience)
  console.log("[ABM Auth] JWT Claims: iss=", config.clientId, ", sub=", config.clientId, ", aud=", jwtAudience)
  
  const jwt = await new SignJWT({
    iss: config.clientId, // issuer = client_id
    sub: config.clientId, // subject = client_id
    aud: jwtAudience,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
    jti: jwtId,
  })
    .setProtectedHeader({
      alg: "ES256",
      kid: config.keyId,
    })
    .setIssuedAt(now)
    .setExpirationTime(now + JWT_TTL_SECONDS)
    .sign(signingKey)
  
  console.log("[ABM Auth] ✓ JWT signed successfully")
  return jwt
}

/**
 * Exchange client_assertion for an ABM access token
 */
export async function getAccessToken(config: ABMConfig): Promise<ABMTokenResponse> {
  console.log("[ABM Auth] Getting access token...")
  const clientAssertion = await buildClientAssertion(config)
  
  const tokenUrl = config.tokenUrl || "https://account.apple.com/auth/oauth2/token"
  console.log("[ABM Auth] Token URL:", tokenUrl)
  
  const formData = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: clientAssertion,
    scope: "business.api",
  })
  
  console.log("[ABM Auth] Requesting token from Apple...")
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorBody
    try {
      errorBody = JSON.parse(errorText)
    } catch {
      errorBody = { raw: errorText }
    }
    
    console.error("[ABM Auth] ✗ Token request failed:", response.status, errorBody)
    throw new Error(
      `ABM authentication failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
    )
  }
  
  const tokenResponse = await response.json() as ABMTokenResponse
  console.log("[ABM Auth] ✓ Access token received")
  return tokenResponse
}

/**
 * Decode and validate JWT (for debugging - never log full token in production)
 */
export function decodeJWT(jwt: string): { header: any; payload: any } {
  const parts = jwt.split(".")
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format")
  }
  
  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8"))
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"))
  
  return { header, payload }
}
