import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/db"
import { formatDate, formatCurrency, formatDateTime, maskSerialNumber } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DeviceDetailPageProps {
  params: {
    id: string
  }
}

async function getDevice(id: string) {
  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      pricingResults: {
        orderBy: { computedAt: "desc" },
      },
      purchaseMetadata: true,
    },
  })

  return device
}

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  const device = await getDevice(params.id)

  if (!device) {
    notFound()
  }

  const latestPricing = device.pricingResults[0]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{device.deviceModel || "Device"}</h1>
          <p className="text-muted-foreground mt-2">Device Details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/devices">← Back to Devices</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Basic device details from ABM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Serial Number</div>
              <div className="font-mono text-sm">
                {device.serialNumberMasked || maskSerialNumber(device.serialNumber)}
              </div>
              <div className="text-xs text-muted-foreground">
                Click to reveal (requires permission)
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Device ID</div>
              <div className="font-mono text-sm">{device.deviceId}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Product Family</div>
              <div>{device.productFamily || "—"}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Device Model</div>
              <div>{device.deviceModel || "—"}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Product Type</div>
              <div className="font-mono text-sm">{device.productType || "—"}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Capacity</div>
              <div>{device.deviceCapacity || "—"}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Color</div>
              <div>{device.color || "—"}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Status</div>
              <div>
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
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dates & Acquisition</CardTitle>
            <CardDescription>Purchase and organization dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Purchase Date</div>
              <div>{formatDate(device.purchaseDate)}</div>
              {!device.purchaseDate && (
                <div className="text-xs text-muted-foreground">
                  Unknown - can be added manually in settings
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Added to Org</div>
              <div>{formatDateTime(device.addedToOrgDate)}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Last Updated</div>
              <div>{formatDateTime(device.updatedDate)}</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Last Synced from ABM</div>
              <div>{formatDateTime(device.lastSeenFromABM)}</div>
            </div>

            {device.releasedFromOrgDate && (
              <div className="grid gap-2">
                <div className="text-sm font-medium">Released from Org</div>
                <div>{formatDate(device.releasedFromOrgDate)}</div>
              </div>
            )}

            {device.orderNumber && (
              <div className="grid gap-2">
                <div className="text-sm font-medium">Order Number</div>
                <div className="font-mono text-sm">{device.orderNumber}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {latestPricing && (
          <Card>
            <CardHeader>
              <CardTitle>Resale Valuation</CardTitle>
              <CardDescription>Current pricing estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Estimated Price</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(Number(latestPricing.price), latestPricing.currency)}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Provider</div>
                <div>{latestPricing.provider}</div>
              </div>

              {latestPricing.condition && (
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Condition</div>
                  <div>{latestPricing.condition}</div>
                </div>
              )}

              <div className="grid gap-2">
                <div className="text-sm font-medium">Last Updated</div>
                <div>{formatDateTime(latestPricing.computedAt)}</div>
              </div>

              {latestPricing.explanation && (
                <div className="grid gap-2">
                  <div className="text-sm font-medium">Explanation</div>
                  <div className="text-sm text-muted-foreground">
                    {latestPricing.explanation}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                * This is an estimate. Actual resale value may vary.
              </div>
            </CardContent>
          </Card>
        )}

        {device.rawPayload && (
          <Card>
            <CardHeader>
              <CardTitle>Raw ABM Data</CardTitle>
              <CardDescription>Full API response snapshot</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(device.rawPayload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
