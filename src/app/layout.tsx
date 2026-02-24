import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEO Content Analyzer — Free Demo',
  description: 'Analyze your content for SEO performance. Get keyword density, readability scores, and actionable recommendations — free demo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
