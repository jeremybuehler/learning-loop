/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const directives = {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:", "blob:"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "script-src": isDev
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"]
        : ["'self'"],
      "font-src": ["'self'", "data:"],
      "connect-src": isDev ? ["'self'", "ws:", "wss:"] : ["'self'"],
      "worker-src": ["'self'", "blob:"],
      "frame-ancestors": ["'self'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    };
    const csp = Object.entries(directives)
      .map(([k, v]) => `${k} ${v.join(' ')}`)
      .join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
}

export default nextConfig
