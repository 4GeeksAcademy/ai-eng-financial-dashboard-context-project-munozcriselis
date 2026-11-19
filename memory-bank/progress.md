# Progress Log

## Date: 2026-08-05

---

## Skills Applied This Session

### 1. Accessibility (pre-installed)

**Source:** `addyosmani/web-quality-skills@accessibility`

**Changes Made:**
- Added `aria-hidden="true"` to all Skeleton loading components
- Added `aria-busy="true"` and `aria-label` to loading states
- Added `focus-visible` CSS styles for keyboard navigation
- Added `.visually-hidden` utility class
- Fixed light theme `--muted-foreground` contrast (3.72:1 → 4.95:1)

**Files Modified:**
- `frontend/src/index.css`
- `frontend/app/globals.css`
- `frontend/src/components/dashboard/kpi-card.tsx`
- `frontend/src/components/dashboard/income-outcome-chart.tsx`
- `frontend/src/components/dashboard/profit-percent-chart.tsx`
- `frontend/check-contrast.js` (updated with correct values)

---

### 2. Vercel React Best Practices (pre-installed)

**Source:** `vercel-labs/agent-skills@vercel-react-best-practices`

**Status:** Applied (follow-up session, see "Session 2026-11-19" below). The first review found no issues; a second audit of `frontend/app/dashboard-client.tsx` found two rule violations:
- `rerender-derived-state-no-effect`: KPIs, monthly data and trends were copied into state inside the fetch effect. Now only the fetched movements are state; the rest is derived with `useMemo`.
- `js-cache-function-results`: `computeMonthlyData` ran twice per load. Now it is computed once and reused by charts and trends.

Already compliant from the Next.js migration: `next/font` (`Inter` in `app/layout.tsx`), page metadata (`app/layout.tsx`, `app/page.tsx`) and Recharts loaded with `next/dynamic` + `ssr: false` to avoid hydration errors.

---

### 3. KPI Dashboard Design (installed this session)

**Source:** `wshobson/agents@kpi-dashboard-design`

**Changes Made:**
- Added trend indicators to KPI cards (↑/↓ with percentage change)
- Added `trends` prop to `KPIRow` component
- Added trend calculations (last month vs previous month comparison)
- Added Methodology section explaining how each metric is calculated
- Followed "5-7 KPIs" best practice (project has 4 KPIs)

**Files Modified:**
- `frontend/src/components/dashboard/kpi-card.tsx` — trend UI
- `frontend/src/components/dashboard/kpi-row.tsx` — trend props
- `frontend/app/dashboard-client.tsx` — trend calculations + methodology section (`frontend/src/App.tsx` was the Vite version, removed in the follow-up session)

---

### 4. Financial Data Formatting (custom skill — created this session)

**Source:** Local skill authored for this project

**Why Created:**
No existing skill covered:
- Currency formatting rules (`Intl.NumberFormat` patterns)
- Percentage display conventions (1 decimal, `%` suffix)
- Null/zero/NaN handling for financial figures
- ARIA patterns specific to financial data
- Trend indicator formatting rules
- File naming conventions for financial utilities

**Skill Location:**
```
.skills/financial-data-formatting/   (moved from .agents/skills/ on 2026-11-19)
├── SKILL.md                          (goal, inputs, expected output, acceptance criteria)
└── references/
    └── details.md
```

**Acceptance Criteria Defined:**
- Currency uses `Intl.NumberFormat` with explicit `USD`
- Percentages show one decimal place (`15.0%`)
- Null renders as `—` (em dash)
- All figures have ARIA labels
- Trends show `+`/`-` prefix with context label
- Dates use `MMM YYYY` format

---

## Summary of All Changes

| Category | Files Changed | Status |
|----------|--------------|--------|
| Accessibility | 6 files | ✅ Complete |
| KPI Design | 4 files | ✅ Complete |
| Custom Skill | 2 files created | ✅ Complete |
| Memory Bank | 3 files | ✅ Complete |

---

## Skills Inventory

| Skill | Source | Type | Status |
|-------|--------|------|--------|
| accessibility | addyosmani/web-quality-skills | External | ✅ Installed |
| vercel-react-best-practices | vercel-labs/agent-skills | External | ✅ Applied |
| kpi-dashboard-design | wshobson/agents | External | ✅ Applied |
| financial-data-formatting | Local (`.skills/`) | Custom | ✅ Created and applied |

---

## Session 2026-11-19 — Fixes after the Next.js migration

Verified with `npm run build`, `npm run lint`, `npm test` (5/5) and the running app (`next start` + backend on :8000).

| Change | Why | Commit topic |
|--------|-----|--------------|
| Stop tracking `frontend/.next/` | Build artifacts were committed | `chore` |
| Remove Vite leftovers, add `/api` rewrite, port 5173, `vitest`, `eslint-plugin-react-hooks` | `next build` failed (type error in `vite.config.ts`); the app had no `/api` proxy and listened on 3000 instead of 5173 | `fix(frontend)` |
| Derived state with `useMemo` | Skill `vercel-react-best-practices` (see section 2) | `refactor(dashboard)` |
| Round the Profit Margin trend | Skill `financial-data-formatting` §5: it rendered `+56.982554561065086%` | `fix(dashboard)` |
| Move the internal skill to `.skills/` and add Inputs / Expected output | Project brief requires `.skills/` | `chore(skills)` |
| Add `@tailwindcss/postcss` + `postcss.config.mjs` | Tailwind was not processed by Next.js; the dashboard rendered unstyled | `fix(frontend)` |
| Chart `title`/`desc` instead of a `role="img"` wrapper | Skill `accessibility`: the focusable chart SVGs (`role="application"`) had no accessible name | `fix(a11y)` |
| Update file references in `current-status.md` / `product-overview.md`; document `npx skills find` in `skill-justification.md` | Memory bank still pointed to removed Vite files | `docs(memory-bank)` |

### Accessibility check (running app, 2026-11-19)
- Keyboard: `Tab` reaches both charts with a visible `:focus-visible` outline; arrow keys move between months (Recharts accessibility layer).
- ARIA: all 13 SVGs are either `aria-hidden` (decorative icons) or named charts; landmarks, `lang="en"` and a single `h1`.
- `alt`: the page renders no `<img>`; icons are decorative SVGs with `aria-hidden`.
- Contrast: `node frontend/check-contrast.js` passes WCAG AA in light and dark themes.

---

## Next Steps

- [ ] Consider adding `data-visualization` skill for chart improvements
- [x] Update `current-status.md` and `product-overview.md` file references (`App.tsx` → `app/dashboard-client.tsx`)
- [ ] Consolidate `context.md` into the memory-bank (reviewer feedback on the context project)
