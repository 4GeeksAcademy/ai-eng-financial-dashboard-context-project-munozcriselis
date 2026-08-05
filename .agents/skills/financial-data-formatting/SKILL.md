---
name: financial-data-formatting
description: >
  Standards for formatting, displaying, and making financial data accessible in a
  dashboard context. Covers currency, percentages, null/zero handling, ARIA labels
  for figures, and locale-sensitive number formatting. Apply when touching any file
  that renders monetary values, profit margins, or trend indicators.
license: MIT
metadata:
  author: munozcriselis
  version: "1.0"
---

# Financial Data Formatting & Display Standards

## Purpose

This skill ensures every monetary value, percentage, and trend indicator rendered in
the financial dashboard follows consistent, accessible, and locale-aware formatting
rules. No other installed skill (`accessibility`, `kpi-dashboard-design`,
`vercel-react-best-practices`) covers these data-layer conventions.

---

## 1. Currency Formatting

### Rule: Always use `Intl.NumberFormat` with explicit options

```ts
// ✅ CORRECT — explicit, locale-aware, deterministic
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// ❌ WRONG — hardcoded symbol breaks for non-USD or locales
function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}
```

### Acceptance Criteria

| Criterion | Pass | Fail |
|-----------|------|------|
| Uses `Intl.NumberFormat` | ✅ | String concatenation with `$` |
| Currency code is explicit (`USD`) | ✅ | Omitted or guessed |
| `minimumFractionDigits` / `maximumFractionDigits` set | ✅ | Defaults used implicitly |
| Handles negative values correctly | Shows `- $500` | Shows `$-500` or `( $500 )` |
| Handles zero | Shows `$0` | Shows `$0.00` or empty |

### Negative Values

`Intl.NumberFormat` with `style: 'currency'` renders negatives as `- $500`
(USD locale). Do **not** wrap negatives in parentheses unless the product
specifically requires accounting notation.

---

## 2. Percentage Formatting

### Rule: One decimal place, no trailing zeros

```ts
// ✅ CORRECT
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

// ❌ WRONG — too many decimals or missing symbol
function formatPercent(value: number): string {
  return `${value}%`  // "15%" instead of "15.0%"
}
```

### Acceptance Criteria

- Always show **one decimal** (e.g. `15.0%`, not `15%` or `15.00%`)
- Append `%` symbol directly (no space)
- For very small values near zero, still show `0.0%` (not blank)

---

## 3. Null / Undefined / Zero Handling

Financial dashboards often receive incomplete data. Follow these rules:

| Value | Display | ARIA label |
|-------|---------|------------|
| `null` or `undefined` | `—` (em dash) | "Data not available" |
| `0` | `$0` or `0.0%` | "Zero" (implicit) |
| `NaN` | `—` | "Calculation error" |
| Negative profit | `- $500` | "Loss of 500 dollars" |

```tsx
// ✅ CORRECT — safe formatting with fallback
const displayValue = metrics ? formatCurrency(metrics.totalIncome) : '—'

// ❌ WRONG — will crash on null
const displayValue = formatCurrency(metrics.totalIncome)
```

### In KPICard Components

The `KPICard` component already handles loading/empty states. When passing values:

```tsx
<KPICard
  value={metrics ? formatCurrency(metrics.totalIncome) : '—'}
  // ...
/>
```

---

## 4. ARIA Labels for Financial Figures

Screen readers need context to understand financial data. Apply these patterns:

### KPI Values

```tsx
// ✅ CORRECT — descriptive ARIA
<p className="text-3xl font-semibold" aria-label={`Total income: ${formattedValue}`}>
  {formattedValue}
</p>

// For loading states
<Card aria-busy="true" aria-label={`Loading ${label}`}>
```

### Trend Indicators

```tsx
// ✅ CORRECT — trend with direction and magnitude
<span
  aria-label={`Trend: ${direction} ${Math.abs(trend.value)}%`}
  className={cn(
    trendPositive && 'text-emerald-500',
    trendNegative && 'text-red-500'
  )}
>
  {trendPositive && <TrendingUp size={14} aria-hidden="true" />}
  {trend.value > 0 ? '+' : ''}{trend.value}%
</span>
```

### Charts

```tsx
// ✅ CORRECT — charts wrapped with role="img" and label
<div role="img" aria-label="Line chart comparing monthly income and outcome trends.">
  <ResponsiveContainer>
    <LineChart>...</LineChart>
  </ResponsiveContainer>
</div>
```

### Acceptance Criteria

- Every visible financial figure has an `aria-label` or is wrapped in a labeled region
- Decorative icons (`TrendingUp`, `TrendingDown`) have `aria-hidden="true"`
- Chart containers use `role="img"` with descriptive `aria-label`
- Loading skeletons have `aria-hidden="true"`

---

## 5. Trend Indicator Formatting

### Calculation

```ts
// Percentage change: compare last period vs previous period
const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}
```

### Display Rules

| Scenario | Display | Color | Icon |
|----------|---------|-------|------|
| Positive trend | `+12%` | `text-emerald-500` | `TrendingUp` |
| Negative trend | `-5%` | `text-red-500` | `TrendingDown` |
| No change | `0%` | `text-muted-foreground` | `Minus` |
| Previous was 0 | `0%` | `text-muted-foreground` | `Minus` |

### Acceptance Criteria

- Always show `+` prefix for positive values
- Show `−` (minus sign) for negative values (automatic with `-`)
- Show `0%` (not `0.0%`) for zero changes
- Always include "vs prev. period" or similar context label

---

## 6. Date Formatting for Financial Periods

### Rule: Use abbreviated month + year

```ts
// ✅ CORRECT
function formatMonthYearLabel(yearMonthKey: string): string {
  const [yearText, monthText] = yearMonthKey.split('-')
  const year = Number(yearText)
  const month = Number(monthText) - 1
  return new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}
// Output: "Jan 2024", "Feb 2024", etc.
```

### Acceptance Criteria

- Format: `MMM YYYY` (e.g., `Jan 2024`)
- Locale: `en-US` (consistent across dashboard)
- Never show day for monthly aggregation
- X-axis labels in charts follow this format

---

## 7. File Naming Conventions

All financial utility functions live in:

```
frontend/src/lib/
├── financial-types.ts      # TypeScript interfaces
├── financial-utils.ts      # Computation + formatting functions
├── financial-utils.test.ts # Unit tests for utils
└── mock-data.ts            # Test fixtures
```

### Naming Rules

| Item | Convention | Example |
|------|------------|---------|
| Types | PascalCase, `Financial` prefix | `FinancialMovement`, `KPIMetrics` |
| Format functions | `format` + data type | `formatCurrency`, `formatPercent` |
| Compute functions | `compute` + output name | `computeKPIs`, `computeMonthlyData` |
| Test files | Same name + `.test.ts` | `financial-utils.test.ts` |

---

## 8. Quick Reference Checklist

Before merging any change that touches financial data display:

- [ ] Uses `Intl.NumberFormat` for currency (not string interpolation)
- [ ] Percentages show one decimal place
- [ ] Null/undefined renders as `—`
- [ ] ARIA labels present on all visible financial figures
- [ ] Trend indicators show `+`/`-` prefix and context label
- [ ] Date labels use `MMM YYYY` format
- [ ] Utility functions are in `financial-utils.ts`
- [ ] Types are in `financial-types.ts`
- [ ] Tests cover edge cases (zero, negative, null)
