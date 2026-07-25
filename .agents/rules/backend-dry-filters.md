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
) -> list[FinancialMovement]:
    return ensure_chronological_order(
        get_filtered_movements(business_type=business_type, ...)
    )
```

## Razón
El principio DRY (Don't Repeat Yourself) reduce errores de mantenimiento. Si cambia la lógica de filtrado, se debe cambiar en un solo lugar. Con duplicación, es fácil olvidar actualizar una copia.

## Cómo verificar que se cumple
- No debe haber más de una función que implemente la lógica de filtrado por `business_type`
- Los endpoints B2B y B2C deben reutilizar la misma función base
- `business_type` debe manejarse como parámetro, no como lógica duplicada por cada tipo
