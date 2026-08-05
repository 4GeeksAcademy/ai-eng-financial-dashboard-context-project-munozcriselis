# financial-data-formatting — detailed examples

## Locale Considerations

### Why `en-US`?

This dashboard serves a single-tenant executive audience. Using `en-US` ensures:
- Consistent comma-as-thousands-separator (`$1,234,567`)
- Period-as-decimal (`$1,234.56`)
- English month abbreviations (`Jan`, `Feb`, etc.)

If the dashboard ever needs multi-locale support, parameterize the formatter:

```ts
export function formatCurrency(value: number, locale = 'en-US', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
```

### Common Locale Pitfalls

| Locale | Thousands | Decimal | Example |
|--------|-----------|---------|---------|
| `en-US` | `,` | `.` | `$1,234.56` |
| `de-DE` | `.` | `,` | `1.234,56 $` |
| `fr-FR` | ` ` | `,` | `1 234,56 $` |
| `ja-JP` | `,` | `.` | `$1,234.56` |

---

## Edge Cases

### Very Large Numbers

`Intl.NumberFormat` handles large numbers automatically:
- `$1,234,567` (millions)
- `$12,345,678` (tens of millions)
- `$123,456,789` (hundreds of millions)

No special handling needed.

### Negative Revenue

If income is negative (refunds exceed sales):
- Display: `- $500`
- ARIA: "Negative income of 500 dollars"
- Color: Use `text-red-500` (same as outcome)

### Profit Margin Extremes

| Scenario | Value | Display |
|----------|-------|---------|
| 100% profit (no costs) | `100.0` | `100.0%` |
| 0% profit (break-even) | `0.0` | `0.0%` |
| Negative margin (loss) | `-25.5` | `-25.5%` |
| Division by zero | `0` | `0.0%` |

---

## ARIA Patterns for Financial Data

### Screen Reader Announcements

When data loads, screen readers should announce:
1. The KPI label ("Total Income")
2. The formatted value ("$123,456")
3. The trend ("up 12% vs previous period")

```tsx
// Full ARIA pattern for a KPI card
<Card aria-busy={loading} aria-label={loading ? `Loading ${label}` : undefined}>
  <CardContent>
    <span className="sr-only">{label}</span>
    <p aria-label={`${label}: ${formattedValue}`}>{formattedValue}</p>
    {trend && (
      <span aria-label={`Trend: ${trendDirection} ${Math.abs(trend.value)}% vs previous period`}>
        {trendIcon} {trend.value > 0 ? '+' : ''}{trend.value}%
      </span>
    )}
  </CardContent>
</Card>
```

### Chart Accessibility

Charts are visual-only. Wrap them with:
```tsx
<div role="img" aria-label="Descriptive text about what the chart shows">
  <ResponsiveContainer>...</ResponsiveContainer>
</div>
```

---

## Testing Financial Formatters

### Unit Test Pattern

```ts
describe('formatCurrency', () => {
  it('formats positive values', () => {
    expect(formatCurrency(1234567)).toBe('$1,234,567')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500')
  })

  it('rounds to whole dollars', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
  })
})

describe('formatPercent', () => {
  it('shows one decimal place', () => {
    expect(formatPercent(15)).toBe('15.0%')
  })

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('handles negative', () => {
    expect(formatPercent(-25.5)).toBe('-25.5%')
  })
})
```

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-08-05 | Initial skill creation |
