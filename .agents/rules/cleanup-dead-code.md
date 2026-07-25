# Regla: Eliminar código muerto del proyecto

## Nombre
`cleanup-dead-code`

## Alcance
- `frontend/src/lib/mock-data.ts` — archivo sin importar
- Cualquier archivo o función que no sea referenciado en el proyecto

## Estado
🟢 **Prioridad baja** — Mantenibilidad

## Problema actual
```typescript
// frontend/src/lib/mock-data.ts
export const mockMovements: FinancialMovement[] = [
  // 60+ registros hardcodeados de datos mock
  { create_date: '2024-01-05', amount: 48200, ... },
  ...
]
```

Este archivo exporta `mockMovements` pero **nunca es importado** en ningún componente, utilidad o test del proyecto. Es código muerto que agrega confusión al revisar la base de datos.

## Regla
**No mantener código muerto en el repositorio.** Si un archivo, función o export no es referenciado por ningún otro archivo, debe eliminarse o documentarse explícitamente por qué existe.

### Criterios para considerar código muerto

| Criterio | Ejemplo |
|----------|---------|
| Archivo no importado | `mock-data.ts` |
| Función no llamada | Función exportada sin call-sites |
| Variable no usada | Constante declarada pero no leída |
| Componente no renderizado | Componente definido pero no en JSX |

### Implementación esperada

1. **Eliminar** `frontend/src/lib/mock-data.ts` completamente, O
2. **Documentar** su propósito si se requiere para desarrollo futuro:
```typescript
// mock-data.ts — Datos de ejemplo para desarrollo offline.
// No se usa en producción. Solo importar para pruebas manuales.
```

## Razón
El código muerto:
- Confunde a desarrolladores que revisan el proyecto
- Aumenta el tamaño innecesariamente
- Puede contener bugs que nadie detecta porque nadie lo ejecuta

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| `mock-data.ts` no existe o está documentado | `ls frontend/src/lib/mock-data.ts` | ✅ Script CI |
| Si existe, debe tener comentario explícito de propósito | Buscar comentario `// mock-data.ts` o similar | ❌ Revisión manual |
| No hay otros archivos sin imports | `grep -r "export"` cruzado con imports | ✅ knip/unused-exports |
| El build no produce warnings de exports no usados | Revisar output de `tsc -b` | ✅ En CI build step |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-5
- **Memory bank**: `current-status.md` fase 2 (Mantenibilidad)
- **Regla relacionada**: `backend-dry-filters.md` — ambas buscan reducir ruido/deuda técnica

## Nota de gobernanza
`mock-data.ts` tiene 60+ registros con nombres de empresas ficticias y montos hardcodeados. Si alguien lo usara, crearía una fuente duplicada de verdad. La regla no fuerza eliminarlo si hay un propósito documentado (ej: "datos de referencia para development offline").
- Genera falsos positivos en análisis de cobertura

## Cómo verificar que se cumple
- `grep -r "mock-data" frontend/src/` no debe retornar resultados (excepto si se documenta)
- `grep -r "mockMovements" frontend/src/` no debe retornar resultados
- Todos los archivos `.ts` y `.tsx` deben ser importados por al menos un archivo
