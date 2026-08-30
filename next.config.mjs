import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ]
  },
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
