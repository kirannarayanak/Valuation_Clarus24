import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Mask a serial number for display (show only first 3 and last 3 characters)
 */
export function maskSerialNumber(serial: string): string {
  if (serial.length <= 6) {
    return "•".repeat(serial.length)
  }
  return `${serial.slice(0, 3)}${"•".repeat(serial.length - 6)}${serial.slice(-3)}`
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | string | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "—"
  const numValue = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(numValue)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numValue)
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const dateObj = typeof date === "string" ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj)
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const dateObj = typeof date === "string" ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}
