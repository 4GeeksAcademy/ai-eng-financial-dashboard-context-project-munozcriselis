import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Financial Dashboard - Executive Metrics',
    template: '%s | Financial Dashboard',
  },
  description: 'Executive financial dashboard showing income, outcome, profit metrics and visual analytics for business intelligence.',
  keywords: ['financial dashboard', 'business metrics', 'income outcome', 'profit analysis', 'KPI'],
  authors: [{ name: 'Financial Dashboard Team' }],
  openGraph: {
    title: 'Financial Dashboard - Executive Metrics',
    description: 'Executive financial dashboard showing income, outcome, profit metrics and visual analytics.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
