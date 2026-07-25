# Contexto del Proyecto - Financial Metrics Dashboard

## ¿Qué es este proyecto?

Es un **Dashboard Financiero** (*Financial Metrics Dashboard*) que visualiza métricas clave de una empresa a través de gráficas interactivas y KPIs (Key Performance Indicators). Fue creado por **4Geeks Academy** como proyecto educativo de ingeniería de software con IA.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌─────────────────────┐      ┌───────────────────────┐ │
│  │     Frontend        │      │    Backend            │ │
│  │   React + TypeScript│─────▶│  FastAPI (Python)     │ │
│  │   Puerto: 5173      │ API  │  Puerto: 8000          │ │
│  │                     │      │                        │ │
│  │  • Vite (bundler)   │      │  • Datos mock          │ │
│  │  • Recharts (charts)│      │  • Pydantic models     │ │
│  │  • Tailwind CSS     │      │  • CORS habilitado     │ │
│  │  • Lucide (icons)   │      │  • Debugpy (debug)     │ │
│  └─────────────────────┘      └───────────────────────┘ │
│                                                          │
│              Puerto 5678: Debugpy                        │
└─────────────────────────────────────────────────────────┘
```

---

## Backend (FastAPI)

**Ubicación:** `backend/app/`

### Archivos principales:

| Archivo | Función |
|---------|---------|
| `main.py` | Configuración de FastAPI con CORS |
| `routes.py` | Toda la lógica de negocio y endpoints |

### ¿Qué hace el backend?

1. **Genera datos financieros mock** (simulados) para 12 meses:
   - ~360 movimientos financieros (30 por mes)
   - Cada movimiento tiene: fecha, monto, tipo (ingreso/egreso), categoría y tipo de negocio

2. **Modelo de datos** (`FinancialMovement`):

   ```python
   {
     "create_date": "2024-03-15",      # Fecha del movimiento
     "amount": 5432.10,                # Monto en USD
     "operation_type": "income",       # "income" | "outcome"
     "category": "sales",              # "sales" | "suppliers" | "operational" | "administrative" | "others"
     "business_type": "B2B"            # "B2B" | "B2C"
   }
   ```

3. **Endpoints disponibles:**

| Endpoint | Descripción |
|----------|-------------|
| `GET /health` | Health check del servidor |
| `GET /api/metrics` | Todos los movimientos financieros |
| `GET /api/metrics/facets` | Filtros disponibles (tipos, categorías, fechas) |
| `GET /api/metrics/summary` | Resumen mensual (ingresos, egresos, neto) |
| `GET /api/metrics/categories/top` | Top categorías por monto |
| `GET /api/metrics/comparison` | Comparación entre períodos |
| `GET /api/metrics/alerts` | Alertas de gastos inusuales |
| `GET /api/metrics/b2b` | Métricas segmentadas B2B |
| `GET /api/metrics/b2c` | Métricas segmentadas B2C |

### Dependencias del Backend:

- `fastapi` - Framework web
- `uvicorn` - Servidor ASGI
- `debugpy` - Debugger remoto
- `pytest` / `pytest-cov` - Testing
- `httpx` - Cliente HTTP para tests

---

## Frontend (React + TypeScript)

**Ubicación:** `frontend/src/`

### Estructura de componentes:

```
src/
├── App.tsx                          # Componente principal
├── main.tsx                         # Punto de entrada
├── index.css                        # Estilos globales (Tailwind)
├── lib/
│   ├── financial-types.ts           # Tipos TypeScript
│   ├── financial-utils.ts           # Funciones de cálculo
│   ├── financial-utils.test.ts      # Tests unitarios
│   ├── mock-data.ts                 # Datos estáticos de respaldo
│   └── utils.ts                     # Utilidades generales
└── components/
    ├── dashboard/
    │   ├── dashboard-header.tsx     # Encabezado del dashboard
    │   ├── kpi-row.tsx              # Fila de 4 tarjetas KPI
    │   ├── kpi-card.tsx             # Tarjeta individual de KPI
    │   ├── income-outcome-chart.tsx # Gráfica de línea: Ingresos vs Egresos
    │   └── profit-percent-chart.tsx # Gráfica de línea: % de Ganancia
    └── ui/
        ├── card.tsx                 # Componente Card reutilizable
        └── skeleton.tsx             # Componente de carga (loading)
```

### ¿Qué muestra el dashboard?

#### 1. KPI Cards (4 tarjetas superiores):

| KPI | Descripción | Icono |
|-----|-------------|-------|
| **Total Income** | Suma de todos los ingresos | TrendingUp |
| **Total Outcome** | Suma de todos los egresos | TrendingDown |
| **Profit** | Ingresos - Egresos | DollarSign |
| **Profit Margin** | Porcentaje de ganancia neta | BarChart2 |

#### 2. Gráficas:

- **Income vs Outcome** - Gráfica de línea comparativa mensual
- **Profit Margin %** - Evolución del porcentaje de ganancia mensual

### Funciones de cálculo (`financial-utils.ts`):

- `computeKPIs()` - Calcula totales generales
- `computeMonthlyData()` - Agrupa datos por mes
- `formatCurrency()` - Formatea números como USD ($1,234)
- `formatPercent()` - Formatea porcentajes (45.2%)

### Dependencias principales del Frontend:

- `react` ^19.2.4 - Framework UI
- `recharts` ^3.8.1 - Librería de gráficas
- `tailwindcss` ^4.2.2 - CSS utility-first
- `lucide-react` - Iconos
- `vitest` - Testing

---

##  Tests

### Frontend (`financial-utils.test.ts`):

- Tests de `computeKPIs()` - Verifica cálculos de totales
- Tests de `computeMonthlyData()` - Verifica agrupación mensual
- Tests de `formatCurrency()` y `formatPercent()`

### Backend (`test_routes.py`):

- Tests de endpoints API
- Verificación de respuestas HTTP

---

## Flujo de Datos

```
1. Usuario abre http://localhost:5173
              ↓
2. React ejecuta useEffect()
              ↓
3. fetch('/api/metrics') llama al Backend
              ↓
4. FastAPI genera datos mock y retorna JSON
              ↓
5. computeKPIs() calcula métricas generales
              ↓
6. computeMonthlyData() agrupa por mes
              ↓
7. KPIRow muestra 4 tarjetas con totales
              ↓
8. IncomeOutcomeChart renderiza gráfica de líneas
              ↓
9. ProfitPercentChart renderiza gráfica de margen
```

---

## Diseño Visual

- **Modo oscuro** (dark theme) por defecto
- **Colores semánticos** para cada tipo de métrica:
  - Verde para ingresos
  - Rojo para egresos
  - Azul para ganancias
- **Skeleton loading** mientras carga
- **Responsive** - Se adapta a diferentes tamaños de pantalla
- **Tooltips interactivos** en las gráficas

---

##  Docker

```yaml
# docker-compose.yml
services:
  frontend:
    ports: 5173
    depends_on: backend

  backend:
    ports: 8000, 5678 (debugger)
```

---

##  En Resumen

Este proyecto es un **dashboard financiero completo** que:

1. ✅ Genera datos financieros simulados realistas
2. ✅ Los expone a través de una API REST documentada
3. ✅ Los visualiza en un dashboard interactivo con gráficas
4. ✅ Calcula métricas clave (KPIs) en tiempo real
5. ✅ Está containerizado con Docker
6. ✅ Incluye tests unitarios
7. ✅ Usa tecnologías modernas (React 19, FastAPI, Recharts, Tailwind)

---

##  Cómo Ejecutar

```bash
# Levantar todos los servicios
docker compose up --build

# Acceder a los servicios:
# - Frontend:      http://localhost:5173
# - Backend:       http://localhost:8000
# - API Docs:      http://localhost:8000/docs
# - Debugger:      localhost:5678
```
