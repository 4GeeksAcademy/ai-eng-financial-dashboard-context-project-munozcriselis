# Estado Actual — Features, Brechas y Prioridades de Gobernanza

> **Ubicación**: `.agents/memory-bank/current-status.md`
> **Propósito**: Inventario verificable de funcionalidad implementada, brechas conocidas y hoja de ruta priorizada para mantenibilidad.

---

## 1. Features Implementadas

### 1.1 Backend (9/9 endpoints funcionales)

| Endpoint | Tests | ¿Consumido? | Estabilidad |
|----------|-------|-------------|-------------|
| `GET /health` | ✅ | ❌ Frontend | ✅ Constante |
| `GET /api/metrics` | ✅ | ✅ Sí | ✅ seed=42 determinista |
| `GET /api/metrics/facets` | ✅ | ❌ No | ✅ |
| `GET /api/metrics/summary` | ✅ | ❌ No | ✅ |
| `GET /api/metrics/categories/top` | ✅ | ❌ No | ✅ |
| `GET /api/metrics/comparison` | ❌ | ❌ No | ⚠️ Sin tests |
| `GET /api/metrics/alerts` | ❌ | ❌ No | ⚠️ Sin tests |
| `GET /api/metrics/b2b` | ✅ | ❌ No | ✅ |
| `GET /api/metrics/b2c` | ✅ | ❌ No | ✅ |

### 1.2 Frontend (7/7 componentes funcionales)

| Componente | Load state | Error state | Tests | Accesibilidad (aria) |
|-----------|-----------|-------------|-------|---------------------|
| `DashboardHeader` | N/A | N/A | ❌ | ⚠️ Sin aria-label |
| `KPIRow` | ✅ Skeleton | ✅ Propaga null | ❌ | ✅ `aria-label="Key performance indicators"` |
| `KPICard` | ✅ Skeleton | ❌ No maneja error propio | ❌ | ❌ Sin roles |
| `IncomeOutcomeChart` | ✅ Skeleton | ❌ | ❌ | ❌ Sin roles |
| `ProfitPercentChart` | ✅ Skeleton | ❌ | ❌ | ❌ Sin roles |
| `App` (raíz) | ✅ Sí | ✅ Error banner | ❌ | ❌ Sin ErrorBoundary |

### 1.3 Testing (18 tests total)

| Suite | Tests | Pasan | Cobertura |
|-------|-------|-------|----------|
| Backend (`test_routes.py`) | 14 | ✅ Todos | Desconocida (sin reporte) |
| Frontend (`financial-utils.test.ts`) | 4 | ✅ Todos | Configurada pero sin umbral |

---

## 2. Brechas y Riesgos — Categorizados por Gobernanza

### 🔴 Bloqueantes (deben resolverse antes de cualquier feature nuevo)

| # | Brecha | Evidencia | Impacto | Regla asociada |
|---|--------|-----------|---------|----------------|
| B-1 | **CORS `allow_origins=["*"]`** | `main.py:9` | Cualquier sitio web puede leer datos del API | `security-cors.md` |
| B-2 | **debugpy siempre activo** | `Dockerfile` CMD | Puerto 5678 expuesto, permite ejecución remota de código | `security-debug-mode.md` |
| B-3 | **Mock data regenerado 9 veces por página** | `routes.py:183-205` y otros 8 endpoints | 3,240 objetos creados en cada carga del dashboard | `backend-data-caching.md` |

### 🟡 Estructurales (deben planificarse en el próximo ciclo)

| # | Brecha | Evidencia | Impacto | Regla asociada |
|---|--------|-----------|---------|----------------|
| B-4 | **Filtrado B2B/B2C duplicado en 4 endpoints** | `routes.py:226,249,318,347` | Si la lógica cambia, hay 4 lugares que modificar | `backend-dry-filters.md` |
| B-5 | **Código muerto: `mock-data.ts`** | Archivo nunca importado | Ruido, confunde a nuevos desarrolladores | `cleanup-dead-code.md` |
| B-6 | **Sin Error Boundaries en React** | `App.tsx` sin wrapper | Un crash en un chart infantil derriba todo el dashboard | `frontend-error-boundaries.md` |
| B-7 | **Manejo genérico de errores HTTP** | `App.tsx:44-48` catch genérico | 401, 500, timeout y JSON malformed todos muestran el mismo mensaje | `frontend-error-handling.md` |
| B-8 | **Sin validación runtime de API response** | `App.tsx:42` `response.json()` sin schema | Un cambio de backend no detectable hasta runtime | `frontend-runtime-validation.md` |
| B-9 | **Periodo "2024 — Full Year" hardcodeado** | `App.tsx:47` | El dashboard siempre muestra 2024 aunque los datos cambien | `frontend-dynamic-data.md` |
| B-10 | **Test con valor exacto 360** | `test_routes.py:10` `assert len(movements) == 360` | Si cambia la generación mock, el test falla aunque la lógica sea correcta | `testing-structure-assertions.md` |

### 🟢 De calidad (mejora continua)

| # | Brecha | Evidencia | Impacto | Regla asociada |
|---|--------|-----------|---------|----------------|
| B-11 | **Sin tests de componentes** | No hay archivos `*.test.tsx` | Los componentes pueden romperse sin detección | `testing-component-rendering.md` |
| B-12 | **`<title>frontend</title>`** | `index.html:6` | Pobre identificación en pestañas/bookmarks | Sin regla |
| B-13 | **Sin contrato formal API-Frontend** | FE no consume OpenAPI de FastAPI | Los cambios de schema son silenciosos | Sin regla |
| B-14 | **Sin formateador de código** | No hay `.prettierrc` ni configuración | Diffs con ruido por estilo inconsistente | Sin regla |

---

## 3. Mapa de Reglas Existentes vs Brechas

```
Reglas en .agents/rules/ (11 archivos)

Seguridad:
├── security-cors.md          ← cubre B-1
├── security-debug-mode.md     ← cubre B-2

Backend:
├── backend-data-caching.md    ← cubre B-3
├── backend-dry-filters.md     ← cubre B-4
├── cleanup-dead-code.md       ← cubre B-5

Frontend:
├── frontend-error-boundaries.md   ← cubre B-6
├── frontend-error-handling.md     ← cubre B-7
├── frontend-runtime-validation.md ← cubre B-8
├── frontend-dynamic-data.md       ← cubre B-9

Testing:
├── testing-structure-assertions.md  ← cubre B-10
├── testing-component-rendering.md   ← cubre B-11
```

**Brechas sin regla**: B-12 (title), B-13 (contrato API), B-14 (formateador). Se podrían agregar reglas opcionales si se considera necesario.

---

## 4. Prioridades — Hoja de Ruta

### Fase 1: Seguridad (inmediata)
```
□ Restringir CORS via ALLOWED_ORIGINS env var       → security-cors.md
□ Hacer debugpy condicional con DEBUG env var        → security-debug-mode.md
□ Cachear mock data (lazy loading al primer request) → backend-data-caching.md
```

### Fase 2: Mantenibilidad (corto plazo)
```
□ Unificar B2B/B2C en filter_movements()             → backend-dry-filters.md
□ Eliminar mock-data.ts                              → cleanup-dead-code.md
□ Cambiar assert len == 360 por assert estructural   → testing-structure-assertions.md
```

### Fase 3: Resiliencia Frontend (mediano plazo)
```
□ Agregar Error Boundaries                           → frontend-error-boundaries.md
□ Diferenciar errores network/HTTP/JSON              → frontend-error-handling.md
□ Validar estructura de API response                 → frontend-runtime-validation.md
□ Obtener periodo desde /api/metrics/facets          → frontend-dynamic-data.md
```

### Fase 4: Cobertura de pruebas (largo plazo)
```
□ Agregar tests de renderizado para KPICard, charts  → testing-component-rendering.md
□ Actualizar <title> a "Financial Dashboard"
□ Evaluar formateador (Prettier / dprint)
```

---

## 5. Métricas de Salud del Proyecto

| Indicador | Valor Actual | Objetivo |
|-----------|-------------|----------|
| Endpoints con tests | 7/9 (78%) | 9/9 (100%) |
| Componentes con tests | 0/6 (0%) | 4/6 (67%) |
| Brechas de seguridad críticas | 2 | 0 |
| Dependencias sin version pin | 6 (backend) | 0 |
| Código muerto (archivos) | 1 (`mock-data.ts`) | 0 |
| Hardcode values | 1 (periodo en App.tsx) | 0 |