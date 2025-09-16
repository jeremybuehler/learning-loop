export const metadata = {
  title: 'LearningLoop',
  description: 'Observe • Evaluate • Learn • Adapt',
}

import './globals.css'
import React from 'react'
import { headers } from 'next/headers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') || undefined
  return (
    <html lang="en">
      <head>
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body>{children}</body>
    </html>
  )
}
