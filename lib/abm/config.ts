/**
 * ABM Configuration Management
 * 
 * Loads ABM configuration from environment variables
 */

import type { ABMConfig as ABMConfigType } from "./auth"

export type { ABMConfigType as ABMConfig }

/**
 * Get ABM configuration from environment variables
 */
export function getABMConfig(): ABMConfigType | null {
  const clientId = process.env.ABM_CLIENT_ID
  const keyId = process.env.ABM_KEY_ID
  const privateKeyPath = process.env.ABM_PRIVATE_KEY_PATH
  const privateKeyBase64 = process.env.ABM_PRIVATE_KEY_BASE64
  const tokenUrl = process.env.ABM_TOKEN_URL
  const jwtAudience = process.env.ABM_JWT_AUDIENCE

  if (!clientId || !keyId) {
    return null
  }

  if (!privateKeyPath && !privateKeyBase64) {
    return null
  }

  return {
    clientId,
    keyId,
    privateKeyPath,
    privateKeyBase64,
    tokenUrl,
    jwtAudience,
  }
}

/**
 * Validate ABM configuration is complete
 */
export function validateABMConfig(config: ABMConfigType | null): { valid: boolean; error?: string } {
  if (!config) {
    return { valid: false, error: "ABM configuration not found. Please configure in settings." }
  }

  if (!config.clientId) {
    return { valid: false, error: "ABM_CLIENT_ID is required" }
  }

  if (!config.keyId) {
    return { valid: false, error: "ABM_KEY_ID is required" }
  }

  if (!config.privateKeyPath && !config.privateKeyBase64) {
    return { valid: false, error: "Either ABM_PRIVATE_KEY_PATH or ABM_PRIVATE_KEY_BASE64 is required" }
  }

  return { valid: true }
}
