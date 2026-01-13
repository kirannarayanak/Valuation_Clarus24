"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate, formatCurrency, maskSerialNumber } from "@/lib/utils"
import Link from "next/link"

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState("")
  const [credentials, setCredentials] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const stored = sessionStorage.getItem("abm_credentials")
    if (!stored) {
      router.push("/login")
      return
    }

    const creds = JSON.parse(stored)
    setCredentials(creds)
    loadDevices()
  }, [router])

  const loadDevices = async () => {
    const stored = sessionStorage.getItem("abm_credentials")
    if (!stored) return

    try {
      setLoading(true)
      const response = await fetch("/api/devices", {
        method: "GET",
      })

      if (response.ok) {
        const data = await response.json()
        setDevices(data.devices || [])
      }
    } catch (error) {
      console.error("Error loading devices:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    const stored = sessionStorage.getItem("abm_credentials")
    if (!stored) {
      router.push("/login")
      return
    }

    const creds = JSON.parse(stored)
    setSyncing(true)

    try {
      const response = await fetch("/api/abm/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: creds.clientId,
          keyId: creds.keyId,
          privateKeyBase64: creds.privateKeyBase64,
          limit: 50,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Successfully synced ${data.synced} device(s)!`)
        loadDevices()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSyncing(false)
    }
  }

  const filteredDevices = devices.filter((device) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      device.deviceModel?.toLowerCase().includes(searchLower) ||
      device.serialNumber?.toLowerCase().includes(searchLower) ||
      device.productFamily?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading devices...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground mt-2">
            {filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} in inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync from ABM"}
          </Button>
          <Button variant="outline" onClick={() => {
            sessionStorage.removeItem("abm_credentials")
            router.push("/login")
          }}>
            Sign Out
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by model, serial number, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device List</CardTitle>
          <CardDescription>
            {filteredDevices.length === 0 && devices.length > 0
              ? "No devices match your search"
              : "Your device inventory"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No devices found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Sync from ABM" to fetch your devices
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model</TableHead>
                  <TableHead>Serial (Masked)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
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
                      {device.serialNumberMasked || maskSerialNumber(device.serialNumber)}
                    </TableCell>
                    <TableCell>{device.productFamily || "—"}</TableCell>
                    <TableCell>{formatDate(device.purchaseDate)}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
