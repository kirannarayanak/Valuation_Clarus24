"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PricingSettingsPage() {
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pricing Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage pricing tables for device valuation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual Pricing Table</CardTitle>
          <CardDescription>
            Enter pricing information by device model, storage, and condition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a placeholder for the pricing management interface. In production, this would
            include:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Form to add/edit pricing entries</li>
            <li>Table view of all pricing entries</li>
            <li>CSV import/export functionality</li>
            <li>Bulk pricing updates</li>
            <li>Condition-based pricing (new, excellent, good, fair, poor)</li>
            <li>Storage capacity variations</li>
            <li>Regional pricing support</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Providers</CardTitle>
          <CardDescription>Configure pricing data sources</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">Manual Pricing</div>
                <div className="text-sm text-muted-foreground">
                  Admin-entered price tables by model/condition/storage
                </div>
              </div>
              <div className="text-sm text-green-600 font-medium">Active</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">Apple Trade-In Estimate</div>
                <div className="text-sm text-muted-foreground">
                  Requires authorized integration agreement with Apple
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Not Available</div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <div className="font-medium">Market Pricing</div>
                <div className="text-sm text-muted-foreground">
                  External pricing APIs or CSV upload
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Not Configured</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Pricing estimates are clearly labeled as estimates and include the provider source
          </p>
          <p>• Each pricing result shows the last updated timestamp</p>
          <p>
            • Pricing is computed using the first available provider in priority order: Manual →
            Market → Trade-In
          </p>
          <p>• Multiple providers can be enabled simultaneously</p>
        </CardContent>
      </Card>
    </div>
  )
}
