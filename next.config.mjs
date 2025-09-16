/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // CSP moved to middleware.ts to support per-request nonces
}

export default nextConfig
