"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InstructionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
            How to Get Your ABM Credentials
          </h1>
          <p className="text-lg text-gray-600">
            Follow these steps to generate your Client ID, Key ID, and Private Key from Apple Business Manager
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Access Apple Business Manager
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Log in to{" "}
                    <a
                      href="https://business.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                    >
                      business.apple.com
                    </a>{" "}
                    with an account that has Administrator or Device Enrollment Manager role.
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Step 2 */}
          <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Navigate to API Integration
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Go to <strong className="font-semibold text-gray-900">Settings</strong> →{" "}
                    <strong className="font-semibold text-gray-900">API Integration</strong> (or{" "}
                    <strong className="font-semibold text-gray-900">Integrations</strong> →{" "}
                    <strong className="font-semibold text-gray-900">API</strong>).
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Step 3 */}
          <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Create a New API Key
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed">
                    Click <strong className="font-semibold text-gray-900">"Create API Key"</strong> or{" "}
                    <strong className="font-semibold text-gray-900">"Generate New Key"</strong>. Give it a
                    descriptive name (e.g., "Device Valuation App").
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Step 4 */}
          <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-3">
                    Download Your Credentials
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    After creating the key, Apple will provide you with:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-gray-600 mb-4">
                    <li>
                      <strong className="font-semibold text-gray-900">Client ID</strong>: Starts with{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                        BUSINESSAPI.
                      </code>{" "}
                      (e.g.,{" "}
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                        BUSINESSAPI.xxxx-xxxx-xxxx-xxxx
                      </code>
                      )
                    </li>
                    <li>
                      <strong className="font-semibold text-gray-900">Key ID</strong>: A UUID format string
                      (e.g., <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">xxxx-xxxx-xxxx-xxxx</code>)
                    </li>
                    <li>
                      <strong className="font-semibold text-gray-900">Private Key (.pem file)</strong>: A
                      downloadable file ending in <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">.pem</code>
                    </li>
                  </ul>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-amber-900 leading-relaxed">
                        <strong className="font-semibold">Important:</strong> The private key file can only be
                        downloaded once. Save it securely! If you lose it, you'll need to create a new API key.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Step 5 */}
          <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
                  5
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                    Required Permissions
                  </CardTitle>
                  <p className="text-gray-600 leading-relaxed mb-3">
                    Make sure your API key has the following scopes/permissions:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-gray-600">
                    <li>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                        business.api
                      </code>{" "}
                      - Access to organization devices
                    </li>
                    <li>Device read permissions</li>
                  </ul>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card className="border-blue-200/60 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">Need More Help?</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  For detailed instructions, visit{" "}
                  <a
                    href="https://support.apple.com/guide/apple-business-manager/api-integration-apdbfa0c5b0a/web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900 font-medium"
                  >
                    Apple's API Integration documentation
                  </a>
                  .
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="px-6 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08l-4.158 3.96H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
