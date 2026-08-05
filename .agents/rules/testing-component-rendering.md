# Regla: Agregar tests de renderizado para componentes React

## Nombre
`testing-component-rendering`

## Alcance
- `frontend/src/components/dashboard/` — `kpi-card.tsx`, `kpi-row.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx`, `dashboard-header.tsx`
- `frontend/src/App.tsx` — configuración del dashboard

## Estado
🟡 **Prioridad media** — Cobertura de testing incompleta

## Problema actual
Actualmente solo existen tests de utilidades (`financial-utils.test.ts`). No hay tests que verifiquen:
- Que los componentes rendericen correctamente con datos reales
- Que el estado de loading muestre los skeletons
- Que el estado de error muestre el mensaje apropiado
- Que los cálculos se reflejen correctamente en la UI

```bash
# Tests existentes:
$ npx vitest run
# Solo cubren: computeKPIs, computeMonthlyData, formatCurrency, formatPercent
# 0 tests de componentes
```

## Regla
**Todo componente con estados visuales diferenciados (loading, error, datos vacíos, datos normales) debe tener tests de renderizado.**

### Implementación esperada

1. **Crear** `frontend/src/components/dashboard/__tests__/` para tests de componentes

2. **KPIRow** debe testear los 3 estados:
```tsx
// Ejemplo de test con Vitest + testing-library
import { render, screen } from '@testing-library/react';
import { KPIRow } from '../kpi-row';

describe('KPIRow', () => {
  it('muestra skeletons cuando loading es true', () => {
    render(<KPIRow metrics={null} loading={true} />);
    expect(screen.getByText('Total Income')).toBeInTheDocument();
    // No debe mostrar valores numéricos durante carga
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  it('muestra valores formateados cuando hay datos', () => {
    render(<KPIRow metrics={mockMetrics} loading={false} />);
    expect(screen.getByText('$1,235')).toBeInTheDocument();
    expect(screen.getByText('15.6%')).toBeInTheDocument();
  });
});
```

3. **IncomeOutcomeChart** debe testear gráfica vacía:
```tsx
it('muestra mensaje de "No data available" con datos vacíos', () => {
  render(<IncomeOutcomeChart data={[]} loading={false} />);
  expect(screen.getByText('No data available to display')).toBeInTheDocument();
});
```

### Dependencias para testing de componentes
Agregar al `package.json` (devDependencies):
- `@testing-library/react` — renderizar componentes en tests
- `@testing-library/jest-dom` — matchers como `toBeInTheDocument()`
- `jsdom` — entorno DOM simulado para Vitest

## Razón
Los tests de utilidades validan que los cálculos son correctos, pero no validan que la UI refleje esos cálculos. Un cambio en el formato de un componente (ej: cambiar `formatCurrency` por un formateo distinto en el JSX) no sería detectado.

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| Existe al menos 1 archivo `*.test.tsx` en `components/dashboard/` | Buscar `*.test.tsx` en `frontend/src/components/` | ✅ glob |
| Cada componente con loading skeleton tiene test de loading state | Buscar `loading={true}` o `loading` en tests | ✅ grep |
| Cada componente con empty state tiene test de datos vacíos | Buscar `data={[]}` o similar en tests | ✅ grep |
| `npx vitest run` pasa con todos los tests | Ejecutar vitest en CI | ✅ Comando CI |
| Las dependencias de testing (`@testing-library/react`) están en `package.json` | Buscar en `devDependencies` | ✅ jq/grep |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-11
- **Memory bank**: `current-status.md` fase 4 (Testing y polish)
- **Memory bank**: `product-overview.md` sección 4.2 (0/6 componentes con tests)
- **Regla relacionada**: `testing-structure-assertions.md` — testing robusto y no frágil

## Nota de gobernanza
Los tests de componentes son la capa final de verificación: validan que el usuario realmente ve lo que debería ver. Sin ellos, un bug en JSX (ej: usar `income` en vez de `outcome` en un label) pasa desapercibido aunque la lógica de cálculo sea correcta. Para un proyecto educativo, al menos KPICard y los dos charts deberían tener tests básicos.