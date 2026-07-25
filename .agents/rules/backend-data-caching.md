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
```

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| Ningún endpoint llama `generate_mock_movements()` directamente | Buscar `generate_mock_movements(seed=42)` fuera de la función cache | ✅ grep en CI |
| Existe una función `get_movements()` o similar que cachea | Buscar definición de variable global o `@lru_cache` | ✅ grep |
| La cache se construye lazy (al primer request) | No debe haber llamada en import time | ❌ Revisión manual |
| Test: 2 requests seguidos retornan el mismo objeto (misma referencia) | `movements1 is movements2` en test | ✅ Test unitario |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-3
- **Memory bank**: `current-status.md` Fase 1 (Seguridad y rendimiento)
- **Memory bank**: `tech-stack.md` sección 1.1 (dependencias backend sin version pin)
- **Regla relacionada**: `backend-dry-filters.md` — ambas mejoran rendimiento y mantenibilidad del backend

## Nota de gobernanza
La regeneración en cada request es el problema de rendimiento #1 del proyecto. Con ~360 objetos × 9 endpoints = 3,240 objetos por página, un simple cache module-level reduce esto a 360 objetos total. No requiere Redis ni infraestructura externa.
