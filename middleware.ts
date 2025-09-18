import { NextResponse, type NextRequest } from 'next/server'

function genNonce() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  // Base64 without padding using Web API utilities
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/=+$/, '')
}

export function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production'
  const nonce = genNonce()

  const res = NextResponse.next({ request: { headers: req.headers } })

  // Pass nonce to app (Next will apply it to its own inline scripts when present)
  res.headers.set('x-nonce', nonce)

  // Build CSP with per-request nonce
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "img-src": ["'self'", 'data:', 'blob:'],
    "style-src": ["'self'", "'unsafe-inline'"],
    "script-src": isDev
      ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'blob:', `'nonce-${nonce}'`]
      : ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"],
    "font-src": ["'self'", 'data:'],
    "connect-src": isDev ? ["'self'", 'ws:', 'wss:'] : ["'self'"],
    "worker-src": ["'self'", 'blob:'],
    "frame-ancestors": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  }
  const csp = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ')

  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
