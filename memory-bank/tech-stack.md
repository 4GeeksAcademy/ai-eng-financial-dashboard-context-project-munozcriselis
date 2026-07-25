# Tech Stack — Financial Metrics Dashboard

> **File**: `.agents/rules/tech-stack.md`
> **Purpose**: Document all technologies, frameworks, and tools used in this project, with specific versions and evidence from the repository.

---

## 1. Frontend Stack

### 1.1 Core Libraries

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **React** | ^19.2.4 | UI component library | `frontend/package.json` → `dependencies` |
| **TypeScript** | ~6.0.2 | Static typing for JavaScript | `frontend/package.json` → `devDependencies` |
| **Vite** | ^8.0.4 | Build tool and dev server | `frontend/package.json` → `devDependencies` |
| **React DOM** | ^19.2.4 | React rendering for the web | `frontend/package.json` → `dependencies` |

### 1.2 UI & Styling

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Tailwind CSS** | ^4.2.2 | Utility-first CSS framework | `frontend/package.json` → `devDependencies`; `frontend/index.css` → `@import "tailwindcss"` |
| **@tailwindcss/vite** | ^4.2.2 | Tailwind Vite plugin for CSS processing | `frontend/package.json` → `devDependencies`; `frontend/vite.config.ts` → `plugins: [react(), tailwindcss()]` |
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
| **ESLint** | ^9.39.4 | Code linting | `frontend/package.json` → `devDependencies`; `frontend/eslint.config.js` |
| **@eslint/js** | ^9.39.4 | ESLint core JS rules | `frontend/package.json` → `devDependencies` |
| **typescript-eslint** | ^8.58.0 | TypeScript linting rules | `frontend/package.json` → `devDependencies` |
| **eslint-plugin-react-hooks** | ^7.0.1 | React Hooks linting rules | `frontend/package.json` → `devDependencies` |
| **eslint-plugin-react-refresh** | ^0.5.2 | React Fast Refresh linting rules | `frontend/package.json` → `devDependencies` |
| **globals** | ^17.4.0 | Global variable definitions for ESLint | `frontend/package.json` → `devDependencies` |
| **@vitejs/plugin-react** | ^6.0.1 | React Fast Refresh for Vite | `frontend/package.json` → `devDependencies`; `frontend/vite.config.ts` |
| **@types/react** | ^19.2.14 | TypeScript types for React | `frontend/package.json` → `devDependencies` |
| **@types/react-dom** | ^19.2.3 | TypeScript types for React DOM | `frontend/package.json` → `devDependencies` |
| **@types/node** | ^24.12.2 | TypeScript types for Node.js APIs | `frontend/package.json` → `devDependencies` |

### 1.5 Testing

| Technology | Version | Purpose | Evidence |
|-----------|---------|---------|----------|
| **Vitest** | ^4.1.4 | Unit test runner (Vite-native) | `frontend/package.json` → `devDependencies`; scripts: `"test": "vitest run"` |
| **@vitest/coverage-v8** | ^4.1.4 | Code coverage via V8 | `frontend/package.json` → `devDependencies`; script: `"test:coverage"` |

### 1.6 TypeScript Configuration

| Setting | Value | Evidence |
|---------|-------|----------|
| Target | ES2023 | `tsconfig.app.json` → `target: "es2023"` |
| JSX | react-jsx | `tsconfig.app.json` → `jsx: "react-jsx"` |
| Module | esnext | `tsconfig.app.json` → `module: "esnext"` |
| Module resolution | bundler | `tsconfig.app.json` → `moduleResolution: "bundler"` |
| Path alias | `@/` → `./src/*` | `tsconfig.app.json` → `paths`; `vite.config.ts` → `resolve.alias` |
| Strict checks | `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `noFallthroughCasesInSwitch` | `tsconfig.app.json` → Linting section |

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
| Internal DNS | Docker Compose service names (`backend`, `frontend`) | `vite.config.ts` → proxy target `http://backend:8000` |
| Frontend proxy | Vite proxies `/api/*` → `http://backend:8000` | `vite.config.ts:10-14` |
| CORS | Backend allows all origins (`allow_origins=["*"]`) | `app/main.py:9` |
| Container dependency | Frontend `depends_on: backend` | `docker-compose.yml:11` |

### 3.4 Key Scripts

| Context | Script | Command | Evidence |
|---------|--------|---------|----------|
| **Root** | Start all services | `docker compose up --build` | `README.md` |
| **Frontend** | Dev server | `npm run dev` | `frontend/package.json` |
| **Frontend** | TypeScript build | `tsc -b && vite build` | `frontend/package.json` → `build` |
| **Frontend** | Lint | `eslint .` | `frontend/package.json` → `lint` |
| **Frontend** | Run tests | `vitest run` | `frontend/package.json` → `test` |
| **Frontend** | Coverage | `vitest run --coverage` | `frontend/package.json` → `test:coverage` |
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
│  React 19             │  FastAPI                     │
│  TypeScript 6         │  Python 3.13                 │
│  Vite 8               │  Uvicorn                     │
│  Tailwind CSS 4       │  Pydantic                    │
│  Recharts 3           │  debugpy                     │
│  Lucide React 1       │                              │
│  Vitest 4             │  pytest + httpx              │
│                       │                              │
└──────────────────────┴──────────────────────────────┘
         │                         │
         └──── Vite Proxy ─────────┘
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