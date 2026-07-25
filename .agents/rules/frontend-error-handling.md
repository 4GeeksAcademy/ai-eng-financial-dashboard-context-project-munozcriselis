# Regla: Manejar errores de fetch con información específica

## Nombre
`frontend-error-handling`

## Alcance
- `frontend/src/App.tsx` — función `fetchFinancialData()` y su manejo en `useEffect`

## Estado
🟡 **Prioridad media** — Experiencia de usuario y debugging

## Problema actual
```tsx
// App.tsx líneas 22-33
fetchFinancialData()
  .then((movements) => {
    setMetrics(computeKPIs(movements));
    setMonthlyData(computeMonthlyData(movements));
  })
  .catch(() => {  // ← Captura genérica, pierde información del error
    setError(
      "No se pudo cargar la informacion financiera. Revisa la API de backend.",
    );
  })
```

El `catch` genérico:
1. No distingue entre error de red, timeout, HTTP, o JSON malformado
2. No registra el error original para debugging
3. Muestra el mismo mensaje para todos los tipos de error

## Regla
**Capturar y clasificar errores de fetch de forma específica.** Cada tipo de error debe tener un mensaje diferenciado que ayude al usuario y al desarrollador.

### Implementación esperada

```typescript
async function fetchFinancialData(): Promise<FinancialMovement[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/metrics`);
  } catch (err) {
    // Error de red (sin conexión, DNS fallido, CORS bloqueado)
    throw new Error(
      'No se pudo conectar al servidor. Verifica que el backend esté corriendo.'
    );
  }

  if (!response.ok) {
    // Error HTTP (404, 500, etc.)
    throw new Error(
      `Error del servidor: ${response.status} ${response.statusText}`
    );
  }

  try {
    return await response.json();
  } catch {
    // Error de parsing JSON
    throw new Error(
      'La respuesta del servidor no tiene formato válido.'
    );
  }
}
```

## Razón
Mensajes de error específicos:
- Ayudan al usuario a entender qué falló y qué hacer
- Facilitan el debugging (saber si es red, servidor, o parsing)
- Permiten mostrar diferentes acciones según el tipo de error

## Cómo verificar que se cumple
- Debe haber al menos 2 `catch` o `try/catch` diferenciando red vs HTTP
- El mensaje de error debe incluir información accionable
- Los errores de red deben tener un mensaje distinto a los errores HTTP

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| `fetchFinancialData()` distingue error de red vs HTTP vs JSON | Buscar `try/catch` anidado o `catch` con lógica condicional | ❌ Revisión manual |
| No hay `.catch(() => ` sin parámetro de error | Buscar `.catch(() =>` en `App.tsx` | ✅ grep |
| El mensaje de error se muestra al usuario en la UI | El `<div>` condicional en App.tsx se activa con el mensaje específico | ❌ Revisión manual |
| Los errores se registran en consola para debugging | Buscar `console.error` junto al catch | ✅ grep |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-7
- **Regla relacionada**: `frontend-error-boundaries.md` — ambas forman la capa de resiliencia del FE
- **Regla relacionada**: `frontend-runtime-validation.md` — validación + errores granulares

## Nota de gobernanza
El manejo genérico de errores oculta problemas reales. Un error 401 requiere acción diferente a un 500 o un timeout de red. Diferenciarlos permite al usuario tomar la acción correcta y al desarrollador debuggear más rápido. En una aplicación real, estas diferencias también permiten implementar retry lógico (timeout → reintentar, 401 → redirigir a login).
