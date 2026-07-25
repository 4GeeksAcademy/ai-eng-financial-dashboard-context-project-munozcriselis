# Regla: Obtener datos dinámicos del backend en vez de hardcodear

## Nombre
`frontend-dynamic-data`

## Alcance
- `frontend/src/App.tsx` — prop `period` en `DashboardHeader`

## Estado
🟡 **Prioridad media** — Datos hardcodeados

## Problema actual
```tsx
// App.tsx línea 48
<DashboardHeader period="2024 - Full Year" />
```

El período se muestra como un string hardcodeado `"2024 - Full Year"`, sin relación con los datos reales del backend. Si los datos cubren julio 2025 a junio 2026, el dashboard seguirá mostrando "2024".

## Regla
**Los valores que dependen de datos del backend deben obtenerse dinámicamente desde la API, no hardcodearse en el frontend.**

### Implementación esperada

1. **Backend** — el endpoint `/api/metrics/facets` ya retorna `min_date` y `max_date`:
```python
# routes.py — ya existe
@router.get("/api/metrics/facets", response_model=MetricsFacets)
def get_metrics_facets() -> MetricsFacets:
    movements = generate_mock_movements(seed=42)
    return build_metrics_facets(movements)
# Retorna: { min_date: "2025-07-01", max_date: "2026-06-30", ... }
```

2. **Frontend** — consumir facets y construir el período:
```tsx
// Opción: llamar facets y formatear el periodo
const facets = await fetch(`${API_BASE_URL}/api/metrics/facets`).then(r => r.json());
const period = `${formatDate(facets.min_date)} – ${formatDate(facets.max_date)}`;
<DashboardHeader period={period} />
```

## Razón
El dashboard debe reflejar siempre los datos reales que está mostrando. Un período hardcodeado genera confusión cuando los datos cambian o cuando se conecta a una fuente de datos diferente.

## Cómo verificar que se cumple
- No debe haber strings hardcodeados con fechas o períodos en `App.tsx` o componentes
- El período mostrado debe coincidir con el rango de fechas de los datos de la API
- Si la API retorna datos de 2025-2026, el dashboard debe mostrar ese rango

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| `App.tsx` no contiene `period="..."` hardcodeado | Buscar `period=` en `App.tsx` | ✅ grep |
| Existe llamada a `/api/metrics/facets` | Buscar `/facets` en `App.tsx` | ✅ grep |
| El período se formatea desde `min_date`/`max_date` | Buscar `facets.min_date` o similar | ✅ grep |
| Test: el período mostrado en el DOM coincide con el rango de la API | Test de integración FE+BE | ❌ Requiere E2E |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-9
- **Memory bank**: `product-overview.md` sección 4 (solo 1/9 endpoints consumido por FE)
- **Regla relacionada**: `frontend-runtime-validation.md` — ambas mejoran la integridad de datos FE

## Nota de gobernanza
El periodo hardcodeado es un síntoma de que el frontend se construyó contra datos conocidos (mock 2024). Al hacerlo dinámico, el dashboard funciona contra cualquier fuente de datos que respete el schema. Esto es esencial si el proyecto se reutiliza con datos reales.
