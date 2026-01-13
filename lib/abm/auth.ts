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
    privateKeyPEM = Buffer.from(config.privateKeyBase64, "base64").toString("utf-8")
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
  } catch (error) {
    if (error instanceof Error && error.message.includes("Key must be")) {
      throw error
    }
    throw new Error(`Invalid private key: ${error instanceof Error ? error.message : String(error)}`)
  }
  
  // Convert PEM to PKCS8 format for jose library
  // jose library expects PKCS8 format (which is what PEM private keys typically are)
  let pkcs8Key: string
  try {
    pkcs8Key = keyObj.export({ format: "pem", type: "pkcs8" })
  } catch (error) {
    // If export fails, try using the original PEM (it might already be PKCS8)
    pkcs8Key = privateKeyPEM
  }
  
  // Import the PKCS8 key for signing with jose
  const signingKey = await importPKCS8(pkcs8Key, "ES256")
  
  const jwt = await new SignJWT({
    iss: config.clientId, // issuer = client_id
    sub: config.clientId, // subject = client_id
    aud: config.jwtAudience || "https://account.apple.com/auth/oauth2/v2/token",
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
  
  return jwt
}

/**
 * Exchange client_assertion for an ABM access token
 */
export async function getAccessToken(config: ABMConfig): Promise<ABMTokenResponse> {
  const clientAssertion = await buildClientAssertion(config)
  
  const tokenUrl = config.tokenUrl || "https://account.apple.com/auth/oauth2/token"
  
  const formData = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: clientAssertion,
    scope: "business.api",
  })
  
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
    
    throw new Error(
      `ABM authentication failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorBody)}`
    )
  }
  
  return (await response.json()) as ABMTokenResponse
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
