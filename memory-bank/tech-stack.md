# Tech Stack — Financial Metrics Dashboard

> **File**: `.agents/rules/tech-stack.md`
> **Purpose**: Document all technologies, frameworks, and tools used in this project, with specific versions and evidence from the repository.

---

## 1. Frontend Stack

### 1.1 Core Libraries

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Next.js** | ^15.3.3 (App Router) | Framework, dev server and build | `frontend/package.json` → `dependencies`; `frontend/app/` (`layout.tsx`, `page.tsx`, `dashboard-client.tsx`) |
| **React** | ^19.2.4 | UI component library | `frontend/package.json` → `dependencies` |
| **TypeScript** | ~6.0.2 | Static typing for JavaScript | `frontend/package.json` → `devDependencies` |
| **React DOM** | ^19.2.4 | React rendering for the web | `frontend/package.json` → `dependencies` |

> The frontend was migrated from Vite to Next.js during the agent-skills work. Vite files (`vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`) were removed; the page entry is `frontend/app/dashboard-client.tsx`.

### 1.2 UI & Styling

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Tailwind CSS** | ^4.2.2 | Utility-first CSS framework | `frontend/package.json` → `devDependencies`; `frontend/app/globals.css` → `@import "tailwindcss"` |
| **@tailwindcss/postcss** | ^4.3.5 | Tailwind processing in Next.js | `frontend/postcss.config.mjs` |
| **class-variance-authority** | ^0.7.1 | Component variant management for Tailwind | `frontend/package.json` → `dependencies` |
| **clsx** | ^2.1.1 | Conditional className construction | `frontend/package.json` → `dependencies`; imported in `frontend/src/lib/utils.ts` |
| **tailwind-merge** | ^3.5.0 | Intelligent Tailwind class merging | `frontend/package.json` → `dependencies`; used in `frontend/src/lib/utils.ts` `cn()` function |

### 1.3 Charts & Icons

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Recharts** | ^3.8.1 | Charting library for React | `frontend/package.json` → `dependencies`; used in `income-outcome-chart.tsx` and `profit-percent-chart.tsx` |
| **Lucide React** | ^1.8.0 | SVG icon library | `frontend/package.json` → `dependencies`; used in `dashboard-header.tsx` (`LayoutDashboard`), `kpi-row.tsx` (`TrendingUp`, `TrendingDown`, `DollarSign`, `BarChart2`) |

### 1.4 Development & Linting

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **ESLint** | ^9.39.4 | Code linting | `frontend/package.json` → `devDependencies`; `frontend/eslint.config.mjs` |
| **eslint-config-next** | ^15.3.3 | Next.js rules (`next/core-web-vitals`, `next/typescript`) | `frontend/eslint.config.mjs` |
| **eslint-plugin-react-hooks** | ^5.2.0 | React Hooks rules required by `eslint-config-next` | `frontend/package.json` → `devDependencies` |
| **@types/react** | ^19.2.14 | TypeScript types for React | `frontend/package.json` → `devDependencies` |
| **@types/react-dom** | ^19.2.3 | TypeScript types for React DOM | `frontend/package.json` → `devDependencies` |
| **@types/node** | ^24.12.2 | TypeScript types for Node.js APIs | `frontend/package.json` → `devDependencies` |

### 1.5 Testing

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Vitest** | ^3.2.7 | Unit test runner | `frontend/package.json` → `devDependencies`; script `"test": "vitest run"`; `frontend/src/lib/financial-utils.test.ts` (5 tests) |

### 1.6 TypeScript Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Target | ES2017 | `tsconfig.json` → `target` |
| JSX | preserve (compiled by Next.js) | `tsconfig.json` → `jsx` |
| Module resolution | bundler | `tsconfig.json` → `moduleResolution` |
| Strict mode | `strict: true` | `tsconfig.json` |
| Path alias | `@/` → `./src/*` | `tsconfig.json` → `paths` |

---

## 2. Backend Stack

### 2.1 Core Libraries

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Python** | 3.13 | Runtime language | `backend/Dockerfile` → `FROM python:3.13-slim` |
| **FastAPI** | latest | Web framework for REST API | `backend/requirements.txt` → `fastapi`; `backend/app/main.py` |
| **Uvicorn** | latest (with standard extras) | ASGI server | `backend/requirements.txt` → `uvicorn[standard]`; `backend/Dockerfile` → CMD |
| **Pydantic** | (FastAPI dependency) | Data validation with BaseModel + Literal types | Used throughout `routes.py` — `FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison`, `MetricsAlert` |

### 2.2 Debugging

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **debugpy** | latest | Remote debugger for Python | `backend/requirements.txt` → `debugpy`; `backend/Dockerfile` → CMD runs debugpy on port 5678 |

### 2.3 Testing

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **pytest** | latest | Test framework | `backend/requirements.txt` → `pytest`; `backend/tests/conftest.py` |
| **pytest-cov** | latest | Test coverage reporting | `backend/requirements.txt` → `pytest-cov` |
| **httpx** | latest | HTTP client for FastAPI TestClient | `backend/requirements.txt` → `httpx`; `backend/tests/test_routes.py` → `from fastapi.testclient import TestClient` |

### 2.4 Backend Structure

```
backend/
├── app/
│   ├── __init__.py       # Empty package marker
│   ├── main.py           # FastAPI app + CORS middleware + router inclusion
│   └── routes.py         # All 9 API endpoints + business logic (~390 lines)
├── tests/
│   ├── conftest.py       # Adds root dir to sys.path
│   └── test_routes.py    # 14 integration tests
├── requirements.txt      # Python dependencies
└── Dockerfile            # Container definition
```

### 2.5 API Surface (9 Endpoints)

| Endpoint | Method | Response Model | Lines |
|----------|--------|---------------|-------|
| `/health` | GET | `dict[str, str]` | `routes.py:178` |
| `/api/metrics` | GET | `list[FinancialMovement]` | `routes.py:183` |
| `/api/metrics/facets` | GET | `MetricsFacets` | `routes.py:207` |
| `/api/metrics/summary` | GET | `list[MetricsSummaryItem]` | `routes.py:215` |
| `/api/metrics/categories/top` | GET | `list[TopCategoryItem]` | `routes.py:238` |
| `/api/metrics/comparison` | GET | `MetricsComparison` | `routes.py:310` |
| `/api/metrics/alerts` | GET | `list[MetricsAlert]` | `routes.py:336` |
| `/api/metrics/b2b` | GET | `list[FinancialMovement]` | `routes.py:356` |
| `/api/metrics/b2c` | GET | `list[FinancialMovement]` | `routes.py:372` |

---

## 3. Infrastructure & Tooling

### 3.1 Containerization

| Technology | Purpose | Evidence |
|-----------|---------|----------|
| **Docker** | Container runtime | `Dockerfile` files for frontend and backend |
| **Docker Compose** | Multi-service orchestration | `docker-compose.yml` defines 2 services |

### 3.2 Service Configuration

| Service | Base Image | Ports | Volumes |
|---------|-----------|-------|---------|
| **frontend** | `node:24-alpine` | `5173:5173` | `./frontend:/app`, `/app/node_modules` (anonymous) |
| **backend** | `python:3.13-slim` | `8000:8000`, `5678:5678` | `./backend:/app` |

### 3.3 Networking

| Component | Detail | Evidence |
|-----------|--------|----------|
| Internal DNS | Docker Compose service names (`backend`, `frontend`) | `next.config.ts` → default proxy target `http://backend:8000` |
| Frontend proxy | Next.js rewrite `/api/*` → `API_PROXY_TARGET` (default `http://backend:8000`; outside Docker use `http://localhost:8000`). Rewrites are resolved at build time for `next build` | `frontend/next.config.ts`, `frontend/.env.example` |
| CORS | Backend allows all origins (`allow_origins=["*"]`) | `app/main.py:9` |
| Container dependency | Frontend `depends_on: backend` | `docker-compose.yml:11` |

### 3.4 Key Scripts

| Context | Script | Command | Evidence |
|---------|--------|---------|----------|
| **Root** | Start all services | `docker compose up --build` | `README.md` |
| **Frontend** | Dev server (port 5173) | `npm run dev` → `next dev -p 5173` | `frontend/package.json` |
| **Frontend** | Production build (type check + lint) | `npm run build` → `next build` | `frontend/package.json` → `build` |
| **Frontend** | Production server (port 5173) | `npm run start` → `next start -p 5173` | `frontend/package.json` → `start` |
| **Frontend** | Lint | `npm run lint` → `next lint` | `frontend/package.json` → `lint` |
| **Frontend** | Run tests | `npm test` → `vitest run` | `frontend/package.json` → `test` |
| **Backend** | Run tests | `pytest` | Expected via `backend/requirements.txt` (no script in Dockerfile) |
| **Backend** | Start server | `python -m debugpy --listen 0.0.0.0:5678 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` | `backend/Dockerfile` → CMD |

---

## 4. Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                   Docker Compose                      │
├──────────────────────┬──────────────────────────────┤
│    Frontend (:5173)   │        Backend (:8000)       │
│                       │                              │
│  Next.js 15 + React 19│  FastAPI                     │
│  TypeScript 6         │  Python 3.13                 │
│  Tailwind CSS 4       │  Uvicorn                     │
│  Recharts 3           │  Pydantic                    │
│  Lucide React 1       │  debugpy                     │
│  Vitest 3             │  pytest + httpx              │
│                       │                              │
└──────────────────────┴──────────────────────────────┘
         │                         │
         └──── Next.js rewrite ────┘
              /api → backend:8000
```

---

## 5. Runtime Versions Summary

| Component | Version (base image/runtime) |
|-----------|------------------------------|
| Node.js | 24 (Alpine Linux) |
| npm | (bundled with Node 24) |
| Python | 3.13 (Debian Slim) |
| Operating System (frontend) | Alpine Linux |
| Operating System (backend) | Debian (Slim variant) |