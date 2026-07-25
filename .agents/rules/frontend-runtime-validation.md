# Regla: Validar estructura de respuesta del backend en el frontend

## Nombre
`frontend-runtime-validation`

## Alcance
- `frontend/src/App.tsx` — función `fetchFinancialData()`
- `frontend/src/lib/financial-types.ts` — tipos TypeScript

## Estado
🟡 **Prioridad media** — Integridad de datos

## Problema actual
```tsx
// App.tsx línea 28
async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json(); // ← Retorna any, sin validación de estructura
}
```

`response.json()` retorna `any` en TypeScript. Si el backend cambia la estructura de la respuesta (ej: renombra `create_date` a `date`), el frontend no falla en compilación pero muestra datos vacíos o errores en runtime.

## Regla
**Validar la estructura de la respuesta del backend antes de usarla en el frontend.** Usar type guards o validación manual para al menos los campos críticos.

### Implementación esperada

**Opción A — Type guard simple** (sin dependencias extra):
```typescript
function isValidMovement(data: unknown): data is FinancialMovement {
  return (
    typeof data === 'object' && data !== null &&
    'create_date' in data && typeof (data as any).create_date === 'string' &&
    'amount' in data && typeof (data as any).amount === 'number' &&
    'operation_type' in data && ['income', 'outcome'].includes((data as any).operation_type) &&
    'category' in data && ['sales', 'suppliers', 'operational', 'administrative', 'others'].includes((data as any).category) &&
    'business_type' in data && ['B2B', 'B2C'].includes((data as any).business_type)
  );
}

function isValidMovementsArray(data: unknown): data is FinancialMovement[] {
  return Array.isArray(data) && data.every(isValidMovement);
}
```

**Opción B — Con Zod** (requiere instalar `zod`):
```typescript
import { z } from 'zod';

const MovementSchema = z.object({
  create_date: z.string(),
  amount: z.number(),
  operation_type: z.enum(['income', 'outcome']),
  category: z.enum(['sales', 'suppliers', 'operational', 'administrative', 'others']),
  business_type: z.enum(['B2B', 'B2C']),
});
```

## Razón
La validación en runtime protege contra:
- Cambios inesperados en la API
- Respuestas malformadas por error de red
- Versiones desincronizadas entre frontend y backend
- Datos corruptos que causan errores silenciosos en la UI

## Cómo verificar que se cumple
- `response.json()` no debe retornarse directamente sin pasar por una validación
- Debe existir al menos una función type guard para `FinancialMovement`
- Si la respuesta no cumple el contrato, debe lanzarse un error claro
