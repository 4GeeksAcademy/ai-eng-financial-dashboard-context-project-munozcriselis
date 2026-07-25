# Regla: Tests deben validar estructura, no valores exactos de datos mock

## Nombre
`testing-structure-assertions`

## Alcance
- `backend/tests/test_routes.py` — assertions que validan cantidad exacta de registros
- `frontend/src/lib/financial-utils.test.ts` — assertions de valores hardcodeados

## Estado
🟡 **Prioridad media** — Mantenibilidad de tests

## Problema actual
```python
# test_routes.py línea 10
def test_generate_mock_movements_returns_full_year_sorted_data():
    movements = generate_mock_movements(seed=42)
    assert len(movements) == 360  # ← Asumpción del dato exacto
    assert movements == sorted(movements, key=lambda item: item.create_date)
```

Si la función `generate_mock_movements` cambia (ej: genera 12 meses × 25 registros = 300), el test falla aunque la lógica siga siendo correcta.

## Regla
**Los tests deben validar comportamiento y estructura, no valores exactos de datos de prueba.** Las aserciones deben ser tolerantes a cambios en los datos mock.

### Implementación esperada

**Mal ejemplo** (valida valor exacto):
```python
assert len(movements) == 360
```

**Buen ejemplo** (valida comportamiento):
```python
# Validar estructura, no cantidad exacta
assert len(movements) > 0
assert all(hasattr(m, 'create_date') for m in movements)
assert all(hasattr(m, 'amount') for m in movements)
assert movements == sorted(movements, key=lambda item: item.create_date)

# Validar razonabilidad de datos
assert all(m.amount > 0 for m in movements)
assert all(m.operation_type in ('income', 'outcome') for m in movements)
```

### Regla específica para este proyecto
```python
# OK: Validar que hay datos suficientes para un año
assert len(movements) >= 12  # Al menos 1 por mes

# OK: Validar orden cronológico
assert movements == sorted(movements, key=lambda item: item.create_date)

# OK: Validar tipos de datos
assert all(isinstance(m.amount, float) for m in movements)

# NO OK: Validar cantidad exacta
assert len(movements) == 360
```

## Razón
Tests que dependen de valores exactos de datos mock son frágiles. Cuando se cambia la generación de datos (ej: ajustar distribución, agregar meses), los tests fallan sin que haya un bug real. Esto genera "test fatigue" yreduce la confianza en la suite de testing.

## Cómo verificar que se cumple
- No debe haber `assert len(x) == N` donde N es un número hardcodeado de registros mock
- Las aserciones deben usar `>=`, `>`, `<=` o validar propiedades estructurales
- Si se necesita validar cantidad, debe ser un mínimo razonable, no un valor exacto
