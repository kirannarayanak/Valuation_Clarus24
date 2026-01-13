/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If deploying to clarus24.net/valuation path, uncomment basePath:
  // basePath: '/valuation',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
