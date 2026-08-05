'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { type MonthlyDataPoint } from '@/lib/financial-types'

const ProfitPercentChartInner = dynamic(
  () => import('@/components/dashboard/profit-percent-chart').then((m) => m.ProfitPercentChart),
  {
    ssr: false,
    loading: () => (
      <Card className="border-border/60" aria-busy="true" aria-label="Loading profit margin chart">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-52" aria-hidden="true" />
          <Skeleton className="h-3 w-64 mt-1" aria-hidden="true" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-lg" aria-hidden="true" />
        </CardContent>
      </Card>
    ),
  }
)

interface Props {
  data: MonthlyDataPoint[]
  loading?: boolean
}

export function ClientProfitPercentChart({ data, loading }: Props) {
  return <ProfitPercentChartInner data={data} loading={loading} />
}