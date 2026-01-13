"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">ABM Device Valuation</h1>
          <p className="text-lg text-gray-600">
            Manage and value your Apple Business Manager device inventory
          </p>
        </div>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>How to Get Your ABM Credentials</CardTitle>
            <CardDescription>
              Follow these steps to generate your Client ID, Key ID, and Private Key from Apple Business Manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Access Apple Business Manager</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Log in to{" "}
                    <a
                      href="https://business.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      business.apple.com
                    </a>{" "}
                    with an account that has Administrator or Device Enrollment Manager role.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Navigate to API Integration</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to <strong>Settings</strong> → <strong>API Integration</strong> (or{" "}
                    <strong>Integrations</strong> → <strong>API</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Create a New API Key</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Click <strong>"Create API Key"</strong> or <strong>"Generate New Key"</strong>.
                    Give it a descriptive name (e.g., "Device Valuation App").
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Download Your Credentials</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    After creating the key, Apple will provide you with:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1 ml-4">
                    <li>
                      <strong>Client ID</strong>: Starts with <code className="bg-gray-100 px-1 rounded">BUSINESSAPI.</code> (e.g.,{" "}
                      <code className="bg-gray-100 px-1 rounded">BUSINESSAPI.xxxx-xxxx-xxxx-xxxx</code>)
                    </li>
                    <li>
                      <strong>Key ID</strong>: A UUID format string (e.g.,{" "}
                      <code className="bg-gray-100 px-1 rounded">xxxx-xxxx-xxxx-xxxx</code>)
                    </li>
                    <li>
                      <strong>Private Key (.pem file)</strong>: A downloadable file ending in <code className="bg-gray-100 px-1 rounded">.pem</code>
                    </li>
                  </ul>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-xs text-yellow-800">
                      <strong>Important:</strong> The private key file can only be downloaded once. Save it securely!
                      If you lose it, you'll need to create a new API key.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Required Permissions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Make sure your API key has the following scopes/permissions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1 ml-4">
                    <li><code className="bg-gray-100 px-1 rounded">business.api</code> - Access to organization devices</li>
                    <li>Device read permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">Need More Help?</h4>
              <p className="text-sm text-blue-800">
                For detailed instructions, visit{" "}
                <a
                  href="https://support.apple.com/guide/apple-business-manager/api-integration-apdbfa0c5b0a/web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  Apple's API Integration documentation
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/login">
            <Button size="lg" className="px-8">
              Continue to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
