# Regla: Implementar Error Boundaries en React

## Nombre
`frontend-error-boundaries`

## Alcance
- `frontend/src/App.tsx` — envolver secciones principales del dashboard
- `frontend/src/components/dashboard/` — componentes de gráficas

## Estado
🟡 **Prioridad media** — Resiliencia de la UI

## Problema actual
```tsx
// App.tsx — sin Error Boundary
<main>
  <DashboardHeader period="2024 - Full Year" />
  {error ? <div>...</div> : null}
  <KPIRow metrics={metrics} loading={loading} />
  <IncomeOutcomeChart data={monthlyData} loading={loading} />
  <ProfitPercentChart data={monthlyData} loading={loading} />
</main>
```

Si `IncomeOutcomeChart` lanza una excepción (ej: datos malformados, error en Recharts), toda la aplicación colapsa sin mensaje de error útil. El `catch` en `fetchFinancialData` solo maneja errores de red, no errores de renderizado.

## Regla
**Envolver secciones independientes del dashboard en React Error Boundaries** para que un error en un componente no colapse toda la aplicación.

### Implementación esperada

1. Crear un componente `ErrorBoundary` reutilizable:
```tsx
// components/ui/error-boundary.tsx
import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
          Error loading this section: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}
```

2. Envolver secciones en `App.tsx`:
```tsx
<ErrorBoundary>
  <IncomeOutcomeChart data={monthlyData} loading={loading} />
</ErrorBoundary>
<ErrorBoundary>
  <ProfitPercentChart data={monthlyData} loading={loading} />
</ErrorBoundary>
```

## Razón
Los Error Boundaries implementan el patrón de "fallback graceful". Si una gráfica falla, las demás secciones del dashboard siguen funcionando. El usuario ve un mensaje de error localizado en vez de una pantalla blanca.

## Cómo verificar que se cumple
- Cada gráfica principal debe estar envuelta en un `ErrorBoundary`
- Si un componente lanza excepción, las demás secciones deben seguir visibles
- El `ErrorBoundary` debe mostrar un mensaje de error comprensible
