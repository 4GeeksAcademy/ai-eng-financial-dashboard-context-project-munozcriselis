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
---

# Auditoría de Código — Buenas y Malas Prácticas

## Categorías analizadas

| # | Categoría |
|---|-----------|
| 1 | Seguridad |
| 2 | Arquitectura y Diseño |
| 3 | Calidad del Código |
| 4 | Rendimiento |
| 5 | Testing y Mantenibilidad |

---

## Buenas Prácticas Identificadas

### Categoría 1 — Seguridad

| # | Práctica | Archivo | Descripción |
|---|----------|---------|-------------|
| BP-1 | **CORS Middleware explícito** | `backend/app/main.py` | Se configura CORS con `allow_origins`, `allow_methods` y `allow_headers` de forma explícita usando el middleware de FastAPI. Aunque actualmente es `["*"]`, la estructura está lista para acotar orígenes. |

### Categoría 2 — Arquitectura y Diseño

| # | Práctica | Archivo | Descripción |
|---|----------|---------|-------------|
| BP-2 | **Separación clara de componentes UI** | `frontend/src/components/` | Los componentes están descompuestos en unidades pequeñas y reutilizables: `KPICard`, `KPIRow`, `DashboardHeader`, y cada gráfica es un componente independiente. Esto facilita testing, reutilización y mantenimiento. |
| BP-3 | **Tipado fuerte con TypeScript** | `frontend/src/lib/financial-types.ts` | Todos los modelos de datos están definidos como interfaces TypeScript (`FinancialMovement`, `KPIMetrics`, `MonthlyDataPoint`). Esto previene errores en tiempo de compilación. |
| BP-4 | **Modelos Pydantic con tipos Literal** | `backend/app/routes.py` | Los tipos `OperationType`, `Category`, `BusinessType` y `GroupBy` usan `Literal` para restringir valores válidos. Los modelos Pydantic validan automáticamente las respuestas de la API. |
| BP-5 | **Proxy de Vite para API** | `frontend/vite.config.ts` | El proxy `/api` redirige al backend sin exponer la URL interna al cliente. Permite que `API_BASE_URL` sea vacío en desarrollo local. |

### Categoría 3 — Calidad del Código

| # | Práctica | Archivo | Descripción |
|---|----------|---------|-------------|
| BP-6 | **Funciones puras de cálculo** | `frontend/src/lib/financial-utils.ts` | `computeKPIs()` y `computeMonthlyData()` son funciones puras sin side effects, faciles de testear y reutilizar. |
| BP-7 | **Formateo centralizado** | `frontend/src/lib/financial-utils.ts` | `formatCurrency()` y `formatPercent()` centralizan el formato de visualización en un solo lugar, evitando inconsistencias. |
| BP-8 | **Utilidad `cn()` para clases CSS** | `frontend/src/lib/utils.ts` | Combina `clsx` + `twMerge` para construir clases Tailwind de forma segura, evitando conflictos. |

### Categoría 4 — Rendimiento

| # | Práctica | Archivo | Descripción |
|---|----------|---------|-------------|
| BP-9 | **Skeleton loading states** | `frontend/src/components/` | Cada componente maneja su propio estado de carga con `Skeleton`, mejorando la percepción de rendimiento. |
| BP-10 | **Vite proxy con changeOrigin** | `frontend/vite.config.ts` | `changeOrigin: true` asegura que el host del proxy sea correcto, evitando problemas de CORS en desarrollo. |

### Categoría 5 — Testing

| # | Práctica | Archivo | Descripción |
|---|----------|---------|-------------|
| BP-11 | **Tests unitarios de utilidades** | `frontend/src/lib/financial-utils.test.ts` | Tests bien estructurados para `computeKPIs`, `computeMonthlyData`, `formatCurrency` y `formatPercent` con casos edge (ej: ingreso cero). |
| BP-12 | **Tests de integración de API** | `backend/tests/test_routes.py` | Tests completos que validan: filtros, respuestas HTTP, estructura de datos, ordenamiento, y límites de parámetros. |

---

## Malas Prácticas y Riesgos Identificados

### Categoría 1 — Seguridad

| # | Riesgo | Archivo:Línea | Descripción | Severidad |
|---|--------|---------------|-------------|-----------|
| MP-1 | **CORS abierto a todos los orígenes** | `main.py:8` | `allow_origins=["*"]` permite cualquier dominio a acceder a la API. En producción, esto expone la API a ataques CSRF y acceso no autorizado. | 🔴 Alta |
| MP-2 | **Debugpy activo en producción** | `backend/Dockerfile:12` | El `CMD` inicia debugpy siempre (`python -m debugpy --listen 0.0.0.0:5678`). Esto expone un puerto de debug en producción, permitiendo ejecución remota de código. | 🔴 Alta |
| MP-3 | **Sin variables de entorno sensibles** | `routes.py` | No hay manejo de secrets, tokens de autenticación ni configuración por entorno. | 🟡 Media |

### Categoría 2 — Arquitectura y Diseño

| # | Riesgo | Archivo:Línea | Descripción | Severidad |
|---|--------|---------------|-------------|-----------|
| MP-4 | **Regeneración de datos mock en cada request** | `routes.py` (todos los endpoints) | Cada endpoint llama `generate_mock_movements(seed=42)` al inicio. Aunque el seed es fijo, esto genera 360 objetos en memoria en cada petición HTTP, desperdiciando CPU. | 🟡 Media |
| MP-5 | **Lógica de filtrado duplicada** | `routes.py:267-310` | Los endpoints `get_b2b_metrics` y `get_b2c_metrics` contienen lógica casi idéntica de filtrado. Esto viola DRY. | 🟡 Media |
| MP-6 | **Dato mock hardcodeado en el frontend** | `App.tsx:48` | `DashboardHeader` recibe `period="2024 - Full Year"` como string hardcodeado, sin relación con los datos reales del backend. | 🟡 Media |
| MP-7 | **Archivo `mock-data.ts` sin uso** | `frontend/src/lib/mock-data.ts` | Contiene 60+ registros hardcodeados que nunca se importan en la aplicación. Código muerto. | 🟢 Baja |

### Categoría 3 — Calidad del Código

| # | Riesgo | Archivo:Línea | Descripción | Severidad |
|---|--------|---------------|-------------|-----------|
| MP-8 | **Sin error boundaries en React** | `App.tsx` | No hay React Error Boundaries. Si un componente de gráfica lanza una excepción, toda la app colapsa sin mensaje útil. | 🟡 Media |
| MP-9 | **Manejo de errores incompleto en fetch** | `App.tsx:22-26` | `fetchFinancialData` solo captura errores HTTP (response.ok), pero no distingue errores de red, timeouts, ni JSON malformado. El catch genérico oculta información. | 🟡 Media |
| MP-10 | **Sin validación de tipos en runtime** | `App.tsx:30` | `response.json()` retorna `any`. No hay validación de que la respuesta del backend tenga la estructura esperada antes de usarla. | 🟡 Media |

### Categoría 4 — Rendimiento

| # | Riesgo | Archivo:Línea | Descripción | Severidad |
|---|--------|---------------|-------------|-----------|
| MP-11 | **Sin paginación en endpoints** | `routes.py` | Endpoints como `/api/metrics` retornan todos los registros sin límite. Con datos reales, esto causaría respuestas enormes. | 🟡 Media |
| MP-12 | **Sin cache en el backend** | `routes.py` | Cada request regenera los mismos 360 registros. No hay caching, ETags ni invalidación. | 🟢 Baja |

### Categoría 5 — Testing y Mantenibilidad

| # | Riesgo | Archivo:Línea | Descripción | Severidad |
|---|--------|---------------|-------------|-----------|
| MP-13 | **Tests dependen de datos mock específicos** | `test_routes.py:10` | Los tests validan la cantidad exacta de registros (`assert len(movements) == 360`). Si cambia la generación mock, los tests rompen. | 🟡 Media |
| MP-14 | **Sin tests de componentes React** | `frontend/` | Solo hay tests de utilidades (`financial-utils.test.ts`). No hay tests de renderizado, interacción ni accesibilidad de componentes. | 🟡 Media |
| MP-15 | **Sin health check para frontend** | `docker-compose.yml` | Solo el backend tiene `/health`. El frontend no tiene endpoint de verificación de salud. | 🟢 Baja |

---

## Reglas Propuestas del Proyecto

### Reglas de Seguridad

| # | Regla | Mitiga | Prioridad |
|---|-------|--------|-----------|
| R-1 | **Restringir CORS a orígenes específicos** usando variable de entorno `ALLOWED_ORIGINS` | MP-1 | 🔴 Alta |
| R-2 | **Deshabilitar debugpy en producción** usando multi-stage Dockerfile o variable de entorno `DEBUG` | MP-2 | 🔴 Alta |
| R-3 | **No exponer puertos de debug** en docker-compose para servicios de producción | MP-2 | 🔴 Alta |

### Reglas de Arquitectura

| # | Regla | Mitiga | Prioridad |
|---|-------|--------|-----------|
| R-4 | **Cachear datos mock en memoria** al iniciar la app, no regenerarlos por request | MP-4 | 🟡 Media |
| R-5 | **Extraer lógica de filtrado a una función compartida** que acepte `business_type` como parámetro | MP-5 | 🟡 Media |
| R-6 | **Obtener el periodo dinámicamente** desde el backend (`/api/metrics/facets`) en vez de hardcodearlo | MP-6 | 🟡 Media |
| R-7 | **Eliminar código muerto** (`mock-data.ts`) o documentar su propósito | MP-7 | 🟢 Baja |

### Reglas de Calidad del Código

| # | Regla | Mitiga | Prioridad |
|---|-------|--------|-----------|
| R-8 | **Implementar React Error Boundaries** alrededor de secciones principales del dashboard | MP-8 | 🟡 Media |
| R-9 | **Validar estructura de respuesta del backend** con Zod o type guards antes de usar en el frontend | MP-10 | 🟡 Media |
| R-10 | **Distinguir tipos de error** en fetch: red, timeout, HTTP, JSON parsing | MP-9 | 🟡 Media |

### Reglas de Rendimiento

| # | Regla | Mitiga | Prioridad |
|---|-------|--------|-----------|
| R-11 | **Implementar paginación** con parámetros `offset` y `limit` en endpoints que retornan listas | MP-11 | 🟡 Media |
| R-12 | **Agregar cache HTTP** (ETags o Cache-Control) en respuestas del backend | MP-12 | 🟢 Baja |

### Reglas de Testing

| # | Regla | Mitiga | Prioridad |
|---|-------|--------|-----------|
| R-13 | **Tests deben validar estructura, no valores exactos** de datos mock | MP-13 | 🟡 Media |
| R-14 | **Agregar tests de renderizado** para componentes clave del dashboard | MP-14 | 🟡 Media |
| R-15 | **Agregar health check** al frontend (página estática 200 o endpoint dedicado) | MP-15 | 🟢 Baja |

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Buenas prácticas encontradas | **12** |
| Malas prácticas / Riesgos | **15** |
| Reglas propuestas | **15** |
| Riesgos de severidad alta | **2** (CORS abierto, Debugpy en prod) |
| Riesgos de severidad media | **10** |
| Riesgos de severidad baja | **3** |git

### Prioridades de acción inmediata:

1. 🔴 **MP-1 + MP-2**: Cerrar CORS y deshabilitar debugpy en producción (R-1, R-2, R-3)
2. 🟡 **MP-4**: Cachear datos mock en memoria (R-4)
3. 🟡 **MP-8 + MP-10**: Agregar Error Boundaries y validación de tipos (R-8, R-9)
4. 🟡 **MP-14**: Agregar tests de componentes React (R-14)