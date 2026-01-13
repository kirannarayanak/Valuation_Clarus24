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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-gray-200/80">
        <CardHeader>
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl text-center">ABM Sign In</CardTitle>
            <div className="relative group">
              <button
                type="button"
                className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-medium hover:bg-gray-200 hover:text-gray-700 transition-all duration-150 cursor-help focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-label="How to get ABM credentials"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {/* Tooltip/Popover - Apple-style, positioned above and larger */}
              <div className="absolute right-0 bottom-full mb-4 w-[420px] max-h-[600px] overflow-y-auto bg-white border border-gray-200/80 rounded-2xl shadow-2xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none backdrop-blur-sm">
                <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200/80"></div>
                <div className="relative z-10">
                  <h4 className="font-semibold text-gray-900 text-base mb-4">How to Get Your ABM Credentials</h4>
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                          1
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900 font-semibold block mb-1.5">Access Apple Business Manager</strong>
                          <p className="text-gray-600 text-sm leading-relaxed">Log in to <a href="https://business.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline font-medium">business.apple.com</a> with an Administrator or Device Enrollment Manager account.</p>
                        </div>
                      </div>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                          2
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900 font-semibold block mb-1.5">Navigate to API Integration</strong>
                          <p className="text-gray-600 text-sm leading-relaxed">Go to <strong className="font-semibold text-gray-900">Settings</strong> → <strong className="font-semibold text-gray-900">API Integration</strong> (or <strong className="font-semibold text-gray-900">Integrations</strong> → <strong className="font-semibold text-gray-900">API</strong>).</p>
                        </div>
                      </div>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                          3
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900 font-semibold block mb-1.5">Create a New API Key</strong>
                          <p className="text-gray-600 text-sm leading-relaxed">Click <strong className="font-semibold text-gray-900">"Create API Key"</strong> and give it a name (e.g., "Device Valuation App").</p>
                        </div>
                      </div>
                    </div>
                    <div className="pb-3 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                          4
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900 font-semibold block mb-1.5">Download Your Credentials</strong>
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">Apple will provide:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1.5 text-gray-600 text-sm mb-3">
                            <li><strong className="font-semibold text-gray-900">Client ID</strong>: Starts with <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">BUSINESSAPI.</code></li>
                            <li><strong className="font-semibold text-gray-900">Key ID</strong>: A UUID format string</li>
                            <li><strong className="font-semibold text-gray-900">Private Key (.pem file)</strong>: Downloadable file</li>
                          </ul>
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-xs text-amber-900 leading-relaxed">
                              <strong className="font-semibold">Important:</strong> The private key can only be downloaded once. Save it securely!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold mt-0.5">
                          5
                        </div>
                        <div className="flex-1">
                          <strong className="text-gray-900 font-semibold block mb-1.5">Required Permissions</strong>
                          <p className="text-gray-600 text-sm leading-relaxed">Ensure your API key has <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-800">business.api</code> scope and device read permissions.</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-blue-600">
                        <a href="https://support.apple.com/guide/apple-business-manager/api-integration-apdbfa0c5b0a/web" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline font-medium">
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
              <div className="p-3.5 text-sm text-red-700 bg-red-50/80 border border-red-200/60 rounded-xl">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all duration-150 shadow-sm hover:shadow-md" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
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
