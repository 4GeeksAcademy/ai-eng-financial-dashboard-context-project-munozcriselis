# Product Overview — Financial Metrics Dashboard

> **File**: `.agents/rules/product-overview.md`
> **Purpose**: Evidence-based product description derived from the repository codebase.

---

## 1. What Is This Product?

**Financial Metrics Dashboard** is a web application that displays key financial performance indicators (KPIs) from a simulated dataset. It is an **educational reference project** built by [4Geeks Academy](https://4geeksacademy.com) for students to practice AI engineering workflows: documenting, auditing, and refining code quality rules in a full-stack project.

**Repository**: `4GeeksAcademy/ai-eng-financial-dashboard-context-project`

---

## 2. Verifiable Features (from source code)

### 2.1 Backend — Financial Data API
| # | Feature | Evidence |
|---|---------|----------|
| 1 | **360 mock financial records** generated deterministically (seed=42) | `routes.py:76` — `generate_mock_movements(seed=42)` produces 12 months × 30 movements per month |
| 2 | **Health check endpoint** | `routes.py:178` — `GET /health` returns `{"status": "ok"}` |
| 3 | **Full metrics list** with date/category/operation-type filters | `routes.py:183` — `GET /api/metrics` |
| 4 | **B2B-only metrics** with date/category/operation-type filters | `routes.py:356` — `GET /api/metrics/b2b` |
| 5 | **B2C-only metrics** with date/category/operation-type filters | `routes.py:372` — `GET /api/metrics/b2c` |
| 6 | **Metrics summary** grouped by day/week/month | `routes.py:215` — `GET /api/metrics/summary` |
| 7 | **Top spending categories** per operation type | `routes.py:238` — `GET /api/metrics/categories/top` |
| 8 | **Period-over-period comparison** with absolute and percentage delta | `routes.py:310` — `GET /api/metrics/comparison` |
| 9 | **Outcome alerts** when monthly expenditure exceeds configurable threshold | `routes.py:336` — `GET /api/metrics/alerts` |
| 10 | **Facets/available filter values** | `routes.py:207` — `GET /api/metrics/facets` |

### 2.2 Frontend — Dashboard UI
| # | Feature | Evidence |
|---|---------|----------|
| 1 | **4 KPI cards** (Total Income, Total Outcome, Profit, Profit Margin) | `kpi-row.tsx` renders 4 `<KPICard>` components |
| 2 | **Income vs Outcome line chart** over time | `income-outcome-chart.tsx` using Recharts `LineChart` with two lines |
| 3 | **Profit percentage line chart** over time | `profit-percent-chart.tsx` using Recharts `LineChart` with zero reference line |
| 4 | **Loading skeleton states** while fetching | `kpi-card.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx` — all render `<Skeleton>` when `loading=true` |
| 5 | **Error banner** on API failure | `App.tsx:49-51` — renders a red error `<div>` when fetch fails |
| 6 | **Responsive grid layout** (1 col → 2 col → 4 col) | `App.tsx` — `grid-cols-1 xl:grid-cols-2` for charts; `kpi-row.tsx` — `sm:grid-cols-2 xl:grid-cols-4` |
| 7 | **Dark theme** with custom CSS variables | `index.css` — `dark` variant via `@custom-variant dark (&:is(.dark *))` with OKLCH color tokens |
| 8 | **Custom tooltip** for chart interaction | `income-outcome-chart.tsx:31-47` and `profit-percent-chart.tsx:30-49` — `<CustomTooltip>` components |

### 2.3 Testing
| # | Feature | Evidence |
|---|---------|----------|
| 1 | **Backend integration tests** (14 test functions) | `test_routes.py` — covers health, filters, B2B/B2C, facets, summary, top categories |
| 2 | **Frontend unit tests** for KPI calculations | `financial-utils.test.ts` — covers `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent` |
| 3 | **Backend test coverage** configured (pytest-cov) | `requirements.txt` includes `pytest-cov` |

### 2.4 Infrastructure
| # | Feature | Evidence |
|---|---------|----------|
| 1 | **Docker Compose orchestration** (2 services) | `docker-compose.yml` — frontend (port 5173) + backend (ports 8000, 5678) |
| 2 | **Hot-reload development** via volume mounts | `docker-compose.yml` — volume mounts for both services |
| 3 | **Vite proxy** for `/api` requests | `vite.config.ts:10-14` — proxies `/api` → `http://backend:8000` |
| 4 | **TypeScript strict mode** | `tsconfig.app.json` — `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` enabled |

---

## 3. Purpose & Target Audience

| Aspect | Detail |
|--------|--------|
| **Primary purpose** | Educational project for AI engineering students to practice code analysis and rule creation |
| **Target users** | 4Geeks Academy students learning to use AI coding agents for codebase auditing |
| **Business domain** | Financial metrics / executive dashboard simulation |
| **Value proposition** | Provides a realistic-but-safe full-stack project where students can identify patterns, propose rules, and validate them against real code |

---

## 4. Data Flow

```
┌──────────────┐     GET /api/metrics     ┌──────────────────┐
│   Frontend    │ ←─────────────────────  │    Backend API    │
│  (React 19)   │                         │   (FastAPI)       │
│  :5173        │                         │   :8000           │
│              │ ──────────────────────→ │                  │
└──────────────┘    JSON response         └──────────────────┘
       │                                        │
       │ Vite Proxy (/api → backend:8000)       │ generate_mock_movements(seed=42)
       │                                        │
       ▼                                        ▼
  ┌──────────────┐                    ┌──────────────────┐
  │  computeKPIs  │                    │  Deterministic    │
  │  → KPIMetrics │                    │  Mock Generator   │
  │  → Charts     │                    │  (360 records)    │
  └──────────────┘                    └──────────────────┘
```

**Key data properties:**
- Data is **deterministic**: same `seed=42` always produces identical records
- Data is **generated on every request** (no persistence/database)
- 12 months of daily records, 30 movements per month, sorted chronologically
- 5 categories: `sales`, `suppliers`, `operational`, `administrative`, `others`
- 2 business types: `B2B` (55% probability) and `B2C` (45%)
- Income has a 90% chance of being `sales` category

---

## 5. Visual Design

- **Dark-first theme** using CSS custom properties with OKLCH color space
- Primary color: blue (`oklch(0.55 0.2 255)`)
- Income/outcome/profit color coding:
  - Income: green (`var(--income-badge)`)
  - Outcome: red (`var(--outcome-badge)`)
  - Profit: blue (`var(--profit-badge)`)
- Responsive design via Tailwind CSS breakpoints
- Font: system default (no external fonts)
- Icons: Lucide React icon library