"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    keyId: "",
    privateKeyFile: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, privateKeyFile: file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Read the PEM file content
      let privateKeyBase64: string | null = null
      if (formData.privateKeyFile) {
        // Read file as text (PEM files are text)
        const fileContent = await formData.privateKeyFile.text()
        // Convert to base64 - use btoa for text content
        privateKeyBase64 = btoa(unescape(encodeURIComponent(fileContent)))
      }

      // Send credentials to login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          keyId: formData.keyId,
          privateKeyBase64,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed")
      }

      if (data.success) {
        // Store credentials in sessionStorage (or you can use cookies)
        sessionStorage.setItem("abm_credentials", JSON.stringify({
          clientId: formData.clientId,
          keyId: formData.keyId,
          privateKeyBase64,
        }))

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        throw new Error(data.error || "Authentication failed")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl text-center">ABM Sign In</CardTitle>
            <div className="relative group">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold hover:bg-blue-200 transition-colors cursor-help"
                aria-label="How to get ABM credentials"
              >
                ℹ️
              </button>
              {/* Tooltip/Popover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                <div className="relative z-10 space-y-3 text-sm">
                  <h4 className="font-semibold text-gray-900 mb-2">How to Get Your ABM Credentials</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div>
                      <strong className="text-gray-900">1. Access Apple Business Manager</strong>
                      <p className="mt-1">Log in to <a href="https://business.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">business.apple.com</a> with an Administrator or Device Enrollment Manager account.</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">2. Navigate to API Integration</strong>
                      <p className="mt-1">Go to <strong>Settings</strong> → <strong>API Integration</strong> (or <strong>Integrations</strong> → <strong>API</strong>).</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">3. Create a New API Key</strong>
                      <p className="mt-1">Click <strong>"Create API Key"</strong> and give it a name (e.g., "Device Valuation App").</p>
                    </div>
                    <div>
                      <strong className="text-gray-900">4. Download Your Credentials</strong>
                      <p className="mt-1">Apple will provide:</p>
                      <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                        <li><strong>Client ID</strong>: Starts with <code className="bg-gray-100 px-1 rounded">BUSINESSAPI.</code></li>
                        <li><strong>Key ID</strong>: A UUID format string</li>
                        <li><strong>Private Key (.pem file)</strong>: Downloadable file</li>
                      </ul>
                      <p className="mt-2 text-yellow-700 bg-yellow-50 p-2 rounded text-xs">
                        <strong>⚠️ Important:</strong> The private key can only be downloaded once. Save it securely!
                      </p>
                    </div>
                    <div>
                      <strong className="text-gray-900">5. Required Permissions</strong>
                      <p className="mt-1">Ensure your API key has <code className="bg-gray-100 px-1 rounded">business.api</code> scope and device read permissions.</p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-blue-700">
                        <a href="https://support.apple.com/guide/apple-business-manager/api-integration-apdbfa0c5b0a/web" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                          View Apple's API Integration documentation →
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CardDescription className="text-center">
            Enter your Apple Business Manager credentials to access your device inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                placeholder="BUSINESSAPI.xxxx-xxxx-xxxx-xxxx"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyId">Key ID</Label>
              <Input
                id="keyId"
                type="text"
                placeholder="xxxx-xxxx-xxxx-xxxx"
                value={formData.keyId}
                onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateKey">Private Key (.pem file)</Label>
              <Input
                id="privateKey"
                type="file"
                accept=".pem"
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Upload your ABM private key file
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-xs text-muted-foreground text-center">
            <p>Your credentials are stored securely in your browser session.</p>
            <p className="mt-1">They are not saved to the server.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
