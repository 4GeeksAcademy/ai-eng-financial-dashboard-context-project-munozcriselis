# Regla: Eliminar duplicación en lógica de filtrado por business_type

## Nombre
`backend-dry-filters`

## Alcance
- `backend/app/routes.py` — endpoints `get_b2b_metrics`, `get_b2c_metrics`, `get_metrics_summary`, `get_top_categories`, `get_metrics_comparison`, `get_metrics_alerts`

## Estado
🟡 **Prioridad media** — Violación DRY

## Problema actual
Múltiples endpoints repiten el mismo patrón de filtrado por `business_type`:

```python
# Patrón repetido en 5+ endpoints:
movements = generate_mock_movements(seed=42)
if business_type is not None:
    movements = [item for item in movements if item.business_type == business_type]
filtered = filter_movements(movements, start_date, end_date, ...)
```

Además, `get_b2b_metrics` y `get_b2c_metrics` son casi idénticas, solo cambia el valor del filtro (`"B2B"` vs `"B2C"`).

## Regla
**Unificar la lógica de filtrado en una función compartida que acepte `business_type` como parámetro opcional.**

### Implementación esperada

```python
def get_filtered_movements(
    business_type: BusinessType | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    category: Category | None = None,
    operation_type: OperationType | None = None,
) -> list[FinancialMovement]:
    movements = get_movements()  # Usa cache (ver regla backend-data-caching)
    if business_type is not None:
        movements = [m for m in movements if m.business_type == business_type]
    return filter_movements(movements, start_date, end_date, category, operation_type)
```

Los endpoints B2B y B2C pueden unificarse en un solo endpoint con parámetro:
```python
@router.get("/api/metrics/segment", response_model=list[FinancialMovement])
def get_segment_metrics(
    business_type: BusinessType,
    start_date: date | None = Query(default=None),
    ...
```

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| No hay `if business_type is not None` repetido en 4+ endpoints | Buscar el patrón en `routes.py` | ✅ grep con `wc -l` |
| `filter_movements()` acepta `business_type` como parámetro | Buscar `def filter_movements` y verificar firma | ✅ grep |
| Los endpoints `/api/metrics/b2b` y `/api/metrics/b2c` se mantienen o se depreca con redirect | Decisión arquitectónica | ❌ Revisión manual |
| Test: el nuevo endpoint unificado funciona igual que los 2 separados | Test parametrizado | ✅ Test unitario |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-4
- **Regla relacionada**: `backend-data-caching.md` — ambas mejoran mantenibilidad del backend
- **Regla relacionada**: `cleanup-dead-code.md` — eliminar duplicación es pariente de eliminar código muerto

## Nota de gobernanza
Este patrón de filtrado duplicado es el ejemplo clásico de violación DRY. La solución no es solo extraer función, sino decidir si los endpoints `/b2b` y `/b2c` deben existir como atajos (conveniencia) o si deben deprecarse en favor de `/api/metrics?business_type=B2B`.
- `business_type` debe manejarse como parámetro, no como lógica duplicada por cada tipo
