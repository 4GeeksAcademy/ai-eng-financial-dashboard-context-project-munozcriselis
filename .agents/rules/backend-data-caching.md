# Regla: Cachear datos mock en memoria del servidor

## Nombre
`backend-data-caching`

## Alcance
- `backend/app/routes.py` — función `generate_mock_movements()` y todos los endpoints

## Estado
🟡 **Prioridad media** — Ineficiencia arquitectónica

## Problema actual
Cada endpoint llama `generate_mock_movements(seed=42)` al inicio de cada petición HTTP:

```python
# routes.py — cada endpoint repite esto:
@router.get("/api/metrics")
def get_metrics(...) -> list[FinancialMovement]:
    movements = generate_mock_movements(seed=42)  # ← 360 objetos creados por request
    ...
```

Con `seed=42`, la función genera ~360 objetos `FinancialMovement` en cada request. Aunque los datos son idénticos, se re-crean y re-filtran en memoria en cada petición.

## Regla
**Los datos que no cambian entre requests deben generarse una vez y cachearse en memoria del servidor.**

### Implementación esperada

Usar una variable de módulo o `functools.lru_cache`:

```python
# Opción 1: Variable de módulo
_MOVEMENTS_CACHE: list[FinancialMovement] | None = None

def get_movements() -> list[FinancialMovement]:
    global _MOVEMENTS_CACHE
    if _MOVEMENTS_CACHE is None:
        _MOVEMENTS_CACHE = generate_mock_movements(seed=42)
    return _MOVEMENTS_CACHE

# Opción 2: @lru_cache (requiere hashability, más complejo aquí)
```

Luego en cada endpoint:
```python
@router.get("/api/metrics")
def get_metrics(...) -> list[FinancialMovement]:
    movements = get_movements()  # ← Reutiliza cache
    filtered = filter_movements(movements, ...)
    return ensure_chronological_order(filtered)
```

## Razón
Aunque con datos mock el impacto es bajo, este patrón establece una base correcta para cuando se conecte a una fuente de datos real (base de datos, API externa). Regenerar datos en cada request es un anti-patrón que escala mal.

## Cómo verificar que se cumple
- `generate_mock_movements()` solo debe llamarse una vez al iniciar la app
- Los endpoints deben llamar a una función que lea del cache, no regenerar datos
- No debe haber llamadas a `generate_mock_movements(seed=42)` dentro de funciones de endpoint
