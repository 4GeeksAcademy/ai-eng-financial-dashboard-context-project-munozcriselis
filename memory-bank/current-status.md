# Current Status — Financial Metrics Dashboard

> **File**: `.agents/rules/current-status.md`
> **Purpose**: Evidence-based assessment of implemented features, known gaps, and prioritized next steps.

---

## 1. Implemented Features

### 1.1 ✅ Fully Functional

| Feature | Status | Verification |
|---------|--------|-------------|
| **9 API endpoints** | ✅ Complete | All endpoints in `routes.py` return correct data; confirmed via `test_routes.py` (14 tests passing) |
| **Deterministic mock data generation** | ✅ Complete | `generate_mock_movements(seed=42)` — seed-based reproducibility verified in tests |
| **Date range filtering** | ✅ Complete | `filter_movements_by_date()` — tested with edge cases in `test_routes.py:22` |
| **Category & operation-type filtering** | ✅ Complete | `filter_movements()` — tested with `category=sales` and `operation_type=income` |
| **B2B/B2C filtering** | ✅ Complete | Two dedicated endpoints (`/api/metrics/b2b`, `/api/metrics/b2c`) with combined filtering |
| **Summary grouped by day/week/month** | ✅ Complete | `summarize_movements()` — tested in `test_routes.py:133` and `test_routes.py:149` |
| **Top categories by spending** | ✅ Complete | `build_top_categories()` — tested with `limit=3` in `test_routes.py:158` |
| **Period-over-period comparison** | ✅ Complete | `GET /api/metrics/comparison` calculates delta between two date ranges |
| **Outcome alerts (threshold-based)** | ✅ Complete | `detect_outcome_alerts()` — configurable threshold, running average baseline |
| **Metrics facets endpoint** | ✅ Complete | Returns available filter values and date range |
| **4 KPI cards on dashboard** | ✅ Complete | `<KPIRow>` renders 4 `<KPICard>` (Income, Outcome, Profit, Profit%) |
| **Two financial charts** | ✅ Complete | `<IncomeOutcomeChart>` + `<ProfitPercentChart>` using Recharts |
| **Loading skeletons** | ✅ Complete | All data-dependent components render `<Skeleton>` while `loading=true` |
| **Error banner** | ✅ Complete | `App.tsx:49-51` displays error on fetch failure |
| **Responsive layout** | ✅ Complete | Tailwind breakpoints handle mobile → desktop |
| **Dark theme** | ✅ Complete | `index.css` with `@custom-variant dark` and CSS variables |
| **Frontend unit tests** | ✅ Complete | `financial-utils.test.ts` covers all utility functions |
| **Backend integration tests** | ✅ Complete | 14 test functions covering all endpoints |
| **Docker Compose orchestration** | ✅ Complete | Two services with hot-reload volume mounts |
| **Vite proxy configuration** | ✅ Complete | `/api` proxy → `http://backend:8000` |
| **TypeScript strict mode** | ✅ Complete | `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` |
| **ESLint with React + TS rules** | ✅ Complete | `eslint.config.js` with 4 plugin configurations |

### 1.2 ⚠️ Partial / Questionable

| Feature | Status | Issue |
|---------|--------|-------|
| **Mock data caching** | ⚠️ Missing | `generate_mock_movements(seed=42)` runs on **every request** (9× per page load) — no caching |
| **Production security** | ⚠️ Missing | CORS `allow_origins=["*"]` + debugpy always enabled in Dockerfile |
| **API period dynamic** | ⚠️ Hardcoded | `DashboardHeader` shows `"2024 - Full Year"` — should derive from API response |
| **Error granularity** | ⚠️ Generic | `App.tsx:46-47` — single catch swallows network/HTTP/JSON errors without differentiation |

---

## 2. Known Gaps & Risks

### 2.1 🔴 High Priority

| # | Gap | Impact | Evidence | Suggested Fix |
|---|-----|--------|----------|---------------|
| 1 | **CORS wildcard (`*`)** | Security: allows any origin to access API | `main.py:9` — `allow_origins=["*"]` | Restrict via `ALLOWED_ORIGINS` env var |
| 2 | **Debugpy in production image** | Security: debugger port exposed | `Dockerfile` CMD always runs `debugpy --listen 0.0.0.0:5678` | Conditional debug mode via env var |
| 3 | **No mock data caching** | Performance: regenerates 360 records per request (9× per page load) | `routes.py:183-205` — calls `generate_mock_movements(seed=42)` at start of every endpoint | Cache in module-level variable, invalidate on demand |
| 4 | **Duplicate B2B/B2C filter logic** | Maintenance: 4 endpoints repeat the same `if business_type is not None` pattern | `routes.py:226, 249, 318, 347` — identical filtering code | Add `business_type` param to `filter_movements()` |
| 5 | **No runtime API response validation** | Reliability: frontend assumes API shape without runtime checks | `App.tsx:38-42` — `response.json()` cast directly to `FinancialMovement[]` | Use Zod or manual structural validation |

### 2.2 🟡 Medium Priority

| # | Gap | Impact | Evidence | Suggested Fix |
|---|-----|--------|----------|---------------|
| 6 | **Hardcoded period** | UX: dashboard always shows "2024 - Full Year" regardless of actual data | `App.tsx:47` — `period="2024 - Full Year"` | Derive from `/api/metrics/facets` |
| 7 | **No Error Boundaries** | UX: a render crash takes down the whole dashboard | `App.tsx` — no `<ErrorBoundary>` wrapper | Wrap with React Error Boundary |
| 8 | **Undifferentiated error handling** | DX: network, HTTP, and JSON errors all show same message | `App.tsx:44-48` — generic catch | Differentiate by error type |
| 9 | **Dead code: `mock-data.ts`** | Maintenance: 60+ hardcoded records, never imported | `mock-data.ts` — no imports found in any file | Remove or document as reference |
| 10 | **Hardcoded expected count in test** | Fragility: `assert len(movements) == 360` breaks if mock parameters change | `test_routes.py:10` | Assert structure/properties, not exact count |

### 2.3 🟢 Low Priority

| # | Gap | Impact | Evidence | Suggested Fix |
|---|-----|--------|----------|---------------|
| 11 | **No component render tests** | Coverage gap: dashboard components untested | No `.test.tsx` files exist for components | Add Vitest + React Testing Library tests for KPICard, charts, error states |
| 12 | **Generic HTML `<title>`** | SEO/UX: `<title>frontend</title>` not descriptive | `index.html:6` | Set to "Financial Metrics Dashboard" |
| 13 | **No `.env.example` for backend** | DX: no documentation of expected config vars | No `.env.example` in `backend/` | Create `.env.example` with `ALLOWED_ORIGINS`, `DEBUG` |
| 14 | **No API versioning** | Evolution: `/api/metrics` could break existing consumers | Routes use `/api/metrics/*` without version prefix | Consider `/api/v1/metrics/*` |
| 15 | **No pagination on `/api/metrics`** | Scale: endpoint returns all 360 records at once | `routes.py:183` — no `skip`/`limit` params | Add pagination for large datasets |

---

## 3. Risk Assessment Summary

| Category | Count | Critical Items |
|----------|-------|----------------|
| 🔴 Security | 2 | CORS wildcard, debugpy in production |
| 🟡 Performance | 1 | No data caching (9× regeneration) |
| 🟡 Maintainability | 4 | Duplicate filter logic, dead code, hardcoded values, no API versioning |
| 🟡 Reliability | 2 | No runtime validation, no Error Boundaries |
| 🟢 Test Coverage | 2 | No component tests, brittle assertions |
| 🟢 UX | 2 | Generic title, hardcoded period label |

---

## 4. Next Priorities

### Phase 1 — Security & Performance (Immediate)
1. **Hardening** — Restrict CORS origins via env var (`.agents/rules/security-cors.md`)
2. **Debug mode** — Make debugpy conditional on `DEBUG` env var (`.agents/rules/security-debug-mode.md`)
3. **Caching** — Cache `generate_mock_movements(seed=42)` in memory (`.agents/rules/backend-data-caching.md`)

### Phase 2 — Maintainability & DRY (Short-term)
4. **Unify B2B/B2C filter logic** — Add `business_type` to `filter_movements()` (`.agents/rules/backend-dry-filters.md`)
5. **Remove dead code** — Delete or archive `mock-data.ts` (`.agents/rules/cleanup-dead-code.md`)
6. **Fix brittle test** — Change `assert len(movements) == 360` to structural assertions (`.agents/rules/testing-structure-assertions.md`)

### Phase 3 — Frontend Resilience (Medium-term)
7. **Error Boundaries** — Wrap dashboard sections (`.agents/rules/frontend-error-boundaries.md`)
8. **Granular error handling** — Differentiate network/HTTP/JSON errors (`.agents/rules/frontend-error-handling.md`)
9. **Runtime validation** — Validate API response shape (`.agents/rules/frontend-runtime-validation.md`)
10. **Dynamic period** — Derive period label from `/api/metrics/facets` (`.agents/rules/frontend-dynamic-data.md`)

### Phase 4 — Testing & Polish (Long-term)
11. **Component tests** — Add render tests for all dashboard components (`.agents/rules/testing-component-rendering.md`)
12. **HTML title update** — Change `<title>` to describe the app
13. **Backend config documentation** — Create `.env.example`
14. **Consider API versioning** — Plan for `/api/v1/metrics` if extended
15. **Consider pagination** — Add if dataset grows beyond 360 records

---

## 5. Feature Completeness by Layer

| Layer | Total Features | ✅ Complete | ⚠️ Partial | ❌ Missing |
|-------|---------------|------------|-------------|-----------|
| API Endpoints | 9 | 9 | 0 | 0 |
| API Business Logic | 8 | 8 | 0 | 0 |
| Dashboard Components | 6 | 6 | 0 | 0 |
| KPI Calculations | 4 | 4 | 0 | 0 |
| Charts | 2 | 2 | 0 | 0 |
| UI/UX (loading, error, responsive, theme) | 4 | 4 | 0 | 0 |
| Backend Tests | 14 | 14 | 0 | 0 |
| Frontend Tests | 4 | 4 | 0 | 0 |
| Security | 2 | 0 | 0 | 2 |
| Performance (caching) | 1 | 0 | 0 | 1 |
| Production Readiness | 2 | 0 | 0 | 2 |
| **Total** | **52** | **47** | **0** | **5** |

---

## 6. Rule Files Already Created

The following 11 rule files in `.agents/rules/` address the gaps identified above:

| Rule File | Priority | Gap Addressed |
|-----------|----------|---------------|
| `security-cors.md` | 🔴 High | CORS wildcard |
| `security-debug-mode.md` | 🔴 High | Debugpy in production |
| `backend-data-caching.md` | 🔴 High | No data caching |
| `backend-dry-filters.md` | 🟡 Medium | Duplicate B2B/B2C filter logic |
| `cleanup-dead-code.md` | 🟡 Medium | Dead code (mock-data.ts) |
| `frontend-error-boundaries.md` | 🟡 Medium | No Error Boundaries |
| `frontend-error-handling.md` | 🟡 Medium | Generic error handling |
| `frontend-runtime-validation.md` | 🟡 Medium | No API response validation |
| `frontend-dynamic-data.md` | 🟡 Medium | Hardcoded period label |
| `testing-structure-assertions.md` | 🟡 Medium | Brittle test assertions |
| `testing-component-rendering.md` | 🟢 Low | No component render tests |