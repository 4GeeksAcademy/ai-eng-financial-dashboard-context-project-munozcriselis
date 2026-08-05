import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  label: string
  value: string
  helperText: string
  icon: LucideIcon
  variant: 'income' | 'outcome' | 'profit' | 'profitPercent'
  loading?: boolean
  trend?: {
    value: number // Percentage change from previous period
    label?: string // e.g., "vs last month"
  }
}

const variantStyles: Record<KPICardProps['variant'], { badge: string; icon: string }> = {
  income: {
    badge: 'bg-[var(--income-badge)] text-[var(--income-badge-fg)]',
    icon: 'text-[var(--income-badge-fg)]',
  },
  outcome: {
    badge: 'bg-[var(--outcome-badge)] text-[var(--outcome-badge-fg)]',
    icon: 'text-[var(--outcome-badge-fg)]',
  },
  profit: {
    badge: 'bg-[var(--profit-badge)] text-[var(--profit-badge-fg)]',
    icon: 'text-[var(--profit-badge-fg)]',
  },
  profitPercent: {
    badge: 'bg-[var(--profit-badge)] text-[var(--profit-badge-fg)]',
    icon: 'text-[var(--profit-badge-fg)]',
  },
}

export function KPICard({ label, value, helperText, icon: Icon, variant, loading, trend }: KPICardProps) {
  const styles = variantStyles[variant]

  if (loading) {
    return (
      <Card className="border-border/60" aria-busy="true" aria-label={`Loading ${label}`}>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" aria-hidden="true" />
            <Skeleton className="h-8 w-8 rounded-lg" aria-hidden="true" />
          </div>
          <Skeleton className="h-8 w-36" aria-hidden="true" />
          <Skeleton className="h-3 w-44" aria-hidden="true" />
        </CardContent>
      </Card>
    )
  }

  // Determine trend color and icon
  const trendPositive = trend && trend.value > 0
  const trendNegative = trend && trend.value < 0
  const trendNeutral = trend && trend.value === 0

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase text-pretty">
            {label}
          </span>
          <span aria-hidden="true" className={cn('p-1.5 rounded-lg', styles.badge)}>
            <Icon size={16} className={styles.icon} aria-hidden="true" focusable="false" />
          </span>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        
        {/* Trend indicator - follows KPI dashboard best practices */}
        {trend && (
          <div className="flex items-center gap-2">
            <span 
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium',
                trendPositive && 'text-emerald-500',
                trendNegative && 'text-red-500',
                trendNeutral && 'text-muted-foreground'
              )}
              aria-label={`Trend: ${trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'no change'} ${Math.abs(trend.value)}%`}
            >
              {trendPositive && <TrendingUp size={14} aria-hidden="true" />}
              {trendNegative && <TrendingDown size={14} aria-hidden="true" />}
              {trendNeutral && <Minus size={14} aria-hidden="true" />}
              <span>{trendPositive ? '+' : ''}{trend.value}%</span>
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground leading-relaxed">{helperText}</p>
      </CardContent>
    </Card>
  )
}
