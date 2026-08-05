import type { Metadata } from 'next'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = {
  title: 'Financial Dashboard — Executive Metrics',
  description:
    'Real-time executive financial dashboard showing income, outcome, profit metrics and visual analytics for business intelligence.',
  openGraph: {
    title: 'Financial Dashboard — Executive Metrics',
    description:
      'Real-time executive financial dashboard showing income, outcome, profit metrics and visual analytics.',
  },
}

export default function DashboardPage() {
  return <DashboardClient />
}
