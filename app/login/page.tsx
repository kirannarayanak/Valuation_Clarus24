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
        const fileContent = await formData.privateKeyFile.text()
        privateKeyBase64 = btoa(fileContent) // Base64 encode
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
