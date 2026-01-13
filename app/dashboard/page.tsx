"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { formatDate, formatCurrency, maskSerialNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Device {
  id: string
  deviceId: string
  deviceModel: string | null
  serialNumberMasked: string | null
  productFamily: string | null
  productType: string | null
  purchaseDate: Date | null
  status: string | null
  deviceCapacity: string | null
  color: string | null
  resalePrice: number | null
  resaleCurrency: string | null
  resaleProvider: string | null
  matchLevel: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDevices: 0,
    devicesByType: {} as Record<string, number>,
    missingPurchaseDate: 0,
    devicesWithPricing: 0,
    totalValue: 0,
    avgAge: 0,
    devices: [] as Device[],
  })
  const [loading, setLoading] = useState(true)
  const [calculatingPricing, setCalculatingPricing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const stored = sessionStorage.getItem("abm_credentials")
    if (!stored) {
      router.push("/login")
      return
    }

    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Add cache busting to ensure fresh data
      const response = await fetch(`/api/dashboard/stats?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        console.log("📊 Loaded stats:", {
          totalDevices: data.totalDevices,
          devicesWithPricing: data.devicesWithPricing,
          totalValue: data.totalValue,
          devicesCount: data.devices?.length || 0,
        })
        console.log("📱 Devices array:", data.devices)
        const devicesWithPricing = data.devices?.filter((d: any) => d.resalePrice) || []
        console.log("💰 Devices with pricing:", devicesWithPricing.length, devicesWithPricing)
        setStats(data)
      } else {
        const errorText = await response.text()
        console.error("❌ API Error:", response.status, errorText)
      }
    } catch (error) {
      console.error("❌ Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const syncDevices = async () => {
    const stored = sessionStorage.getItem("abm_credentials")
    if (!stored) {
      router.push("/login")
      return
    }

    setSyncing(true)
    setSyncError(null)
    try {
      const credentials = JSON.parse(stored)
      const response = await fetch("/api/abm/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: credentials.clientId,
          keyId: credentials.keyId,
          privateKeyBase64: credentials.privateKeyBase64,
          limit: 100, // Sync up to 100 devices at a time
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync devices")
      }

      console.log("✅ Sync successful:", data)
      alert(`Successfully synced ${data.synced} device(s) from ABM!`)
      
      // Reload stats after sync
      await loadStats()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to sync devices"
      console.error("❌ Sync error:", errorMessage)
      setSyncError(errorMessage)
      alert(`Sync failed: ${errorMessage}`)
    } finally {
      setSyncing(false)
    }
  }

  const calculatePricing = async () => {
    setCalculatingPricing(true)
    try {
      const response = await fetch("/api/pricing/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Send empty body explicitly
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        alert(`Pricing calculated for ${data.calculated} device(s)!`)
        // Wait a moment for database to commit, then reload with cache busting
        setTimeout(() => {
          loadStats()
        }, 500)
      } else {
        alert(`Error: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Pricing calculation error:", error)
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setCalculatingPricing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading dashboard...</p>
      </div>
    )
  }

  const coveragePercentage =
    stats.totalDevices > 0
      ? Math.round((stats.devicesWithPricing / stats.totalDevices) * 100)
      : 0

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your Apple Business Manager device inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={syncDevices}
            disabled={syncing}
            variant="default"
          >
            {syncing ? "Syncing..." : "Sync from ABM"}
          </Button>
          <Button
            onClick={calculatePricing}
            disabled={calculatingPricing}
            variant="outline"
          >
            {calculatingPricing ? "Calculating..." : "Calculate Pricing"}
          </Button>
          <button
            onClick={() => {
              sessionStorage.removeItem("abm_credentials")
              router.push("/login")
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalDevices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Devices in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimated Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.totalValue, "USD")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined resale estimate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgAge}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Years since purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pricing Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{coveragePercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.devicesWithPricing} devices with pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(stats.devicesByType).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Different product families
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Devices by Type</CardTitle>
            <CardDescription>Breakdown by product family</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.devicesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">{type || "Unknown"}</span>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
              {Object.keys(stats.devicesByType).length === 0 && (
                <p className="text-sm text-muted-foreground">No devices yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Inventory summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Missing Purchase Date</span>
                <span className="text-sm font-semibold">{stats.missingPurchaseDate}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Average Value per Device</span>
                <span className="text-sm font-semibold">
                  {stats.totalDevices > 0
                    ? formatCurrency(stats.totalValue / stats.totalDevices, "USD")
                    : "$0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.devicesWithPricing === 0 && stats.totalDevices > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-900">
                  No pricing data available
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Click "Calculate Pricing" to compute resale estimates. You'll need to add pricing tables first in Settings → Pricing.
                </p>
              </div>
              <Button
                onClick={calculatePricing}
                disabled={calculatingPricing}
                variant="outline"
              >
                {calculatingPricing ? "Calculating..." : "Calculate Pricing"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Device Inventory</CardTitle>
          <CardDescription>
            Complete list of all devices with purchase dates and resale estimates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.devices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No devices found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Sync devices from ABM to see your inventory
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resale Price</TableHead>
                    <TableHead>Provider</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.devices.map((device) => {
                    const purchaseYear = device.purchaseDate
                      ? new Date(device.purchaseDate).getFullYear()
                      : null
                    return (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/devices/${device.id}`}
                            className="hover:underline"
                          >
                            {device.deviceModel || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {device.serialNumberMasked || "—"}
                        </TableCell>
                        <TableCell>{device.productFamily || "—"}</TableCell>
                        <TableCell>
                          {device.purchaseDate ? formatDate(device.purchaseDate) : "—"}
                        </TableCell>
                        <TableCell>
                          {purchaseYear || "—"}
                        </TableCell>
                        <TableCell>{device.deviceCapacity || "—"}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              device.status === "ASSIGNED"
                                ? "bg-green-100 text-green-800"
                                : device.status === "UNASSIGNED"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {device.status || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {device.resalePrice ? (
                            <div>
                              <div className="font-semibold">
                                {formatCurrency(device.resalePrice, device.resaleCurrency || "USD")}
                              </div>
                              {device.matchLevel === "NONE" && (
                                <div className="text-xs text-yellow-600 mt-0.5">
                                  ⚠️ Estimated
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {device.resaleProvider ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                                {device.resaleProvider === "MANUAL" ? "Manual" : device.resaleProvider === "MARKET" ? "Market" : device.resaleProvider === "APPLE_TRADEIN" ? "Apple Trade-In" : device.resaleProvider}
                              </span>
                              {device.matchLevel && device.matchLevel !== "NONE" && (
                                <div className="text-[10px] text-gray-500 mt-1">
                                  {device.matchLevel === "EXACT" ? "Exact match" : device.matchLevel === "NO_STORAGE" ? "No storage match" : device.matchLevel === "FAMILY_FALLBACK" ? "Family fallback" : device.matchLevel}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
