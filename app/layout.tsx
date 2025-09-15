export const metadata = {
  title: 'LearningLoop',
  description: 'Observe • Evaluate • Learn • Adapt',
}

import './globals.css'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

