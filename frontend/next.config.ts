import type { NextConfig } from 'next'

// Backend that serves /api/*. In docker compose it is the `backend` service;
// outside Docker set API_PROXY_TARGET=http://localhost:8000.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || 'http://backend:8000'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Replaces the former Vite proxy: the browser calls /api on the same origin.
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_PROXY_TARGET}/api/:path*` }]
  },
}

export default nextConfig
