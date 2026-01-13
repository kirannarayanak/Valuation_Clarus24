"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ABMSettingsPage() {
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/abm/test", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setTestResult({
          success: true,
          message: `Connection successful! Token preview: ${data.tokenPreview}`,
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || "Connection failed",
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ABM Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your Apple Business Manager API connection
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
          <CardDescription>
            Configure ABM credentials via environment variables. See .env.example for details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              ABM configuration is managed through environment variables for security. Update your{" "}
              <code className="bg-muted px-1 py-0.5 rounded">.env</code> file with:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <code>ABM_CLIENT_ID</code> - Your ABM API client ID
              </li>
              <li>
                <code>ABM_KEY_ID</code> - Your ABM API key ID
              </li>
              <li>
                <code>ABM_PRIVATE_KEY_PATH</code> - Path to your .pem private key file, or
              </li>
              <li>
                <code>ABM_PRIVATE_KEY_BASE64</code> - Base64-encoded private key (more secure for
                deployment)
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={handleTestConnection} disabled={testing}>
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-md ${
                testResult.success
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              <div className="font-medium">
                {testResult.success ? "✓ Success" : "✗ Failed"}
              </div>
              <div className="text-sm mt-1">{testResult.message}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Never commit your private key file or environment variables to version control
          </p>
          <p>• Use ABM_PRIVATE_KEY_BASE64 for production deployments instead of file paths</p>
          <p>• Rotate keys regularly and monitor access logs</p>
          <p>• Store keys securely using secret management systems (AWS Secrets Manager, etc.)</p>
        </CardContent>
      </Card>
    </div>
  )
}
