# Stack Tecnológico — Gobernanza y Dependencias

> **Ubicación**: `.agents/memory-bank/tech-stack.md`
> **Propósito**: Documentar el stack tecnológico con énfasis en riesgos de gobernanza, versionado, estabilidad y decisiones de mantenibilidad.

---

## 1. Frontend

### 1.1 Dependencias de Producción

| Paquete | Versión | Propósito | Riesgo de gobernanza |
|---------|---------|-----------|----------------------|
| `react` | ^19.2.4 | Librería UI | ✅ Versión estable reciente. Sin breaking changes conocidos hacia atrás |
| `react-dom` | ^19.2.4 | Renderizado DOM | ✅ Misma versión que React |
| `recharts` | ^3.8.1 | Gráficas (líneas) | ⚠️ Dependencia externa de terceros. v3 tiene API estable pero podría quedarse sin mantenimiento |
| `lucide-react` | ^1.8.0 | Iconos SVG | ✅ Proyecto activo, versión mayor baja (1.x), cambios menores frecuentes |
| `class-variance-authority` | ^0.7.1 | Variantes de componentes Tailwind | ⚠️ v0.x — sin version 1.0, riesgo de cambios en API |
| `clsx` | ^2.1.1 | Construcción condicional de clases | ✅ Maduro, estable, cambio raro |
| `tailwind-merge` | ^3.5.0 | Merge inteligente de clases Tailwind | ✅ v3 estable, en mantenimiento activo |

**Regla inferida**: Toda dependencia de terceros debe tener su versión fijada (no usar `^` o `~`) en ramas de producción. Para este proyecto educativo, `^` es aceptable pero debe documentarse el propósito de cada dependencia.

### 1.2 Dependencias de Desarrollo

| Paquete | Versión | Propósito | Riesgo |
|---------|---------|-----------|--------|
| `typescript` | ~6.0.2 | Compilador TS | 🔴 **TypeScript 6.0 es bleeding edge** (lanzado 2026). `erasableSyntaxOnly` puede romper imports que usen `import = require()` o namespaces |
| `vite` | ^8.0.4 | Bundler / dev server | ✅ v8 estable |
| `@vitejs/plugin-react` | ^6.0.1 | React Fast Refresh + SWC | ✅ Compatible con Vite 8 |
| `tailwindcss` | ^4.2.2 | Framework CSS | ⚠️ v4 cambió el modelo de plugins (PostCSS → JS nativo). Compatible con Vite 8 via `@tailwindcss/vite` |
| `@tailwindcss/vite` | ^4.2.2 | Plugin Tailwind para Vite | ✅ Plugin oficial |
| `eslint` | ^9.39.4 | Linter | ✅ v9 con flat config |
| `typescript-eslint` | ^8.58.0 | Reglas TS para ESLint | ✅ v8 estable |
| `eslint-plugin-react-hooks` | ^7.0.1 | Reglas de hooks | ✅ v7 para React 19 |
| `vitest` | ^4.1.4 | Test runner | ✅ v4 estable |
| `@vitest/coverage-v8` | ^4.1.4 | Cobertura de código | ✅ v4 estable |

### 1.3 Configuración TypeScript Relevante para Gobernanza

| Opción | Valor | Implicación |
|--------|-------|-------------|
| `target` | `es2023` | ✅ Soporte amplio en Node 20+ y navegadores modernos |
| `module` | `esnext` | ⚠️ Puede generar imports que Vite entienda, pero no transpila a CommonJS |
| `moduleResolution` | `bundler` | ✅ Requerido para Vite. No compatible con `node` clásico |
| `verbatimModuleSyntax` | `true` | ✅ Fuerza `import type` / `export type` explícitos — buena practica |
| `noUnusedLocals` | `true` | ✅ Error en compilación si hay variables sin usar |
| `noUnusedParameters` | `true` | ✅ Error si hay parámetros sin usar |
| `erasableSyntaxOnly` | `true` | ⚠️ TypeScript 6. Prohíbe `enum`, `namespace`, `import = require()` |
| `jsx` | `react-jsx` | ✅ Transform automático de JSX (no requiere `import React`) |

---

## 2. Backend

### 2.1 Dependencias

| Paquete | Versión (pin) | Propósito | Riesgo |
|---------|--------------|-----------|--------|
| `fastapi` | **sin pin** | Framework web | 🔴 **Sin versión fijada** — `pip install` puede romper si FastAPI cambia APIs |
| `uvicorn[standard]` | **sin pin** | Servidor ASGI | 🔴 **Sin versión fijada** — lo mismo |
| `debugpy` | **sin pin** | Debugger remoto | 🔴 Siempre activo en el CMD del Dockerfile |
| `pytest` | **sin pin** | Testing | ✅ Para entorno de desarrollo |
| `pytest-cov` | **sin pin** | Cobertura | ✅ Para entorno de desarrollo |
| `httpx` | **sin pin** | HTTP client para tests | ✅ Usado solo por TestClient |

**Regla inferida**: `requirements.txt` debe fijar versiones (`fastapi==0.115.0`) o al menos rangos mayor-menor para evitar roturas silenciosas. Como proyecto educativo, es aceptable no fijarlas, pero debe documentarse qué versiones se probaron.

### 2.2 Dockerfile (Riesgos)

```dockerfile
FROM python:3.13-slim
# ...
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Riesgos identificados**:
1. 🔴 **debugpy siempre activo** — Puerto 5678 abierto, permite ejecución remota de código
2. 🔴 **`--reload` en producción** — Consume más recursos, reinicia el servidor si cambian archivos
3. 🟡 **Sin multi-stage build** — `python:3.13-slim` incluye compiladores que no se necesitan en runtime
4. 🟡 **COPY . .** — Copia todo el directorio incluyendo `__pycache__` y archivos .pyc

---

## 3. Infraestructura

| Componente | Detalle | Riesgo |
|-----------|---------|--------|
| **Orquestación** | Docker Compose (v2) | ✅ Estandar industria |
| **Base images** | `python:3.13-slim` + `node:24-alpine` | ✅ Alpine para FE (liviano), Slim para BE |
| **Volúmenes** | Hot-reload montados en ambos servicios | ✅ Desarrollo ágil |
| **Red interna** | Docker DNS: `backend:8000` | ✅ Aislado |
| **Proxy dev** | Vite proxy `/api` → backend | ✅ Sin CORS en desarrollo |
| **Puertos expuestos** | 5173, 8000, 5678 | 🔴 5678 no debería exponerse fuera de la red interna |

**Regla inferida**: El puerto 5678 debería exponerse solo si `DEBUG=true`, y nunca por defecto.

---

## 4. Dependencias Entre Servicios

```
frontend (package.json) ◄── vite.config.ts ──► backend (port 8000)
                            proxy /api
```

- No hay contrato formal de API entre frontend y backend
- El frontend asume la estructura de `FinancialMovement[]` sin validación runtime
- El backend puede cambiar el schema sin que el frontend detecte el cambio hasta que falla en producción

**Implicación de gobernanza**: Sin un contrato compartido (OpenAPI, Zod schema compartido, type package), el acoplamiento es frágil. El proyecto tiene `/docs` (OpenAPI generado por FastAPI), pero el frontend no lo consume.

---

## 5. Stack de Testing

| Capa | Herramienta | Cobertura actual | Brecha |
|------|------------|-----------------|--------|
| Backend integración | pytest + httpx | 14 tests | Faltan tests para `/comparison` y `/alerts` |
| Frontend unitario | Vitest | 4 tests (utils) | Sin tests de componentes |
| Frontend cobertura | @vitest/coverage-v8 | Configurado pero sin métrica | Sin umbral mínimo definido |
| E2E | Ninguno | ❌ | No hay tests de integración real frontend → backend |

---

## 6. Stack de Linting y Calidad

| Herramienta | Configuración | Brecha |
|------------|--------------|--------|
| ESLint (flat config) | `recommended` + TS + React Hooks + React Refresh | No hay reglas de import orden, no hay naming conventions |
| TypeScript strict | Parcial (no usa `strict: true` explícito) | `strictNullChecks`, `noImplicitAny` habilitados por defecto en TS 6, pero no hay `exactOptionalPropertyTypes` ni `noUncheckedIndexedAccess` |
| Sin Prettier | ❌ No hay formateador | Riesgo de ruido en diffs por estilo inconsistente |