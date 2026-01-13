"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
          <CardTitle className="text-2xl text-center">ABM Sign In</CardTitle>
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

          <div className="mt-6 space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              <p>Your credentials are stored securely in your browser session.</p>
              <p className="mt-1">They are not saved to the server.</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/login/instructions"
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                How to generate credentials
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
