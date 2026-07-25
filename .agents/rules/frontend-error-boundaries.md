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
<ErrorBoundary fallback={<p>Failed to load KPIs</p>}>
  <KPIRow metrics={metrics} loading={loading} />
</ErrorBoundary>
<ErrorBoundary fallback={<p>Failed to load charts</p>}>
  <IncomeOutcomeChart data={monthlyData} loading={loading} />
  <ProfitPercentChart data={monthlyData} loading={loading} />
</ErrorBoundary>
```

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| Existe componente `ErrorBoundary` o similar | Buscar `class ErrorBoundary` o `getDerivedStateFromError` | ✅ grep |
| `App.tsx` envuelve secciones con `<ErrorBoundary>` | Buscar `<ErrorBoundary` en `App.tsx` | ✅ grep |
| Cada sección independiente tiene su propio boundary | Verificar que KPIRow y charts tienen boundaries separados | ❌ Revisión manual |
| Test: forzar error en un child y verificar que el resto del dashboard sigue funcionando | Simular error en un componente | ✅ Test unitario |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-6
- **Memory bank**: `product-overview.md` sección 4.2 (ningún componente tiene tests)
- **Regla relacionada**: `frontend-error-handling.md` — ambas forman la capa de resiliencia del FE

## Nota de gobernanza
Sin Error Boundaries, un error de renderizado en cualquier componente (ej: Recharts recibe datos malformados) colapsa todo el dashboard. Con boundaries, el error se aísla y el resto de la UI sigue funcionando. Es una práctica estándar en React desde v16.

## Razón
Los Error Boundaries implementan el patrón de "fallback graceful". Si una gráfica falla, las demás secciones del dashboard siguen funcionando. El usuario ve un mensaje de error localizado en vez de una pantalla blanca.

## Cómo verificar que se cumple
- Cada gráfica principal debe estar envuelta en un `ErrorBoundary`
- Si un componente lanza excepción, las demás secciones deben seguir visibles
- El `ErrorBoundary` debe mostrar un mensaje de error comprensible
