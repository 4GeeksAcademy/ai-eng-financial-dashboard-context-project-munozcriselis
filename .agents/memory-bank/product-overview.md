# Product Overview — Financial Metrics Dashboard

> **Ubicación**: `.agents/memory-bank/product-overview.md`
> **Propósito**: Documento de contexto para gobernanza del proyecto. Describe qué es el producto, su estructura y las implicaciones para la toma de decisiones técnicas.

---

## 1. Identidad del Proyecto

| Atributo | Valor |
|----------|-------|
| **Nombre** | Financial Metrics Dashboard |
| **Tipo** | Proyecto educativo / reference implementation |
| **Propietario** | [4Geeks Academy](https://4geeksacademy.com) — [@marcogonzalo](https://github.com/marcogonzalo) |
| **Repositorio** | `4GeeksAcademy/ai-eng-financial-dashboard-context-project` |
| **Propósito educativo** | Servir como caso de estudio para que estudiantes de AI Engineering practiquen auditoría de código, creación de reglas de gobernanza y documentación de arquitectura usando agentes de IA |

**Implicación de gobierno**: No es un producto en producción. Las decisiones de gobernanza deben priorizar **claridad pedagógica y mantenibilidad del código de ejemplo** sobre rendimiento extremo o escalabilidad. Sin embargo, las reglas deben reflejar prácticas reales de la industria para que sean transferibles.

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose                           │
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────────┐   │
│  │   Frontend (:5173)    │    │    Backend (:8000)       │   │
│  │   React + TypeScript  │◄──►│    FastAPI + Python      │   │
│  │   Vite + Tailwind     │    │    Datos mock (seed=42)  │   │
│  └──────────────────────┘    └──────────────────────────┘   │
│         │                              │                     │
│         └── Vite Proxy (/api) ─────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

**Decisiones arquitectónicas clave** (para gobernanza):

| Decisión | Justificación | Riesgo de gobernanza |
|----------|---------------|----------------------|
| Monorepo sin herramienta de monorepo | Simplicidad educativa | Sin `depends_on` real entre servicios; cada uno se deploya independientemente |
| Mock data generado en cada request | Sin dependencia de DB | **9 generaciones por pagina** — problema de rendimiento evidenciable |
| Sin base de datos | Simplifica el entorno | No entrena patrones de persistencia, migraciones ni manejo de estado |
| Sin autenticación ni autorización | Apropiado para education | Reglas CORS y debug expuesto en Dockerfile heredarian a produccion si alguien forkeara ciegamente |

---

## 3. Stack y sus Implicaciones de Gobernanza

| Capa | Tecnología | Versión | Madurez | Riesgo de gobernanza |
|------|-----------|---------|---------|----------------------|
| UI | React | 19.2.4 | ✅ Stable | Version mayor reciente — APIs nuevas podrian cambiar |
| Lenguaje (FE) | TypeScript | ~6.0.2 | ⚠️ Pionero | TypeScript 6 es muy reciente (Enero 2026); `erasableSyntaxOnly` puede romper imports legacy |
| Bundler | Vite | 8.0.4 | ✅ Stable | Compatible con TS 6 |
| CSS | Tailwind | 4.2.2 | ✅ Stable | v4 cambió el modelo de plugins (JS nativo en vez de PostCSS) |
| Backend | Python | 3.13 | ✅ Stable | Compatible con todas las dependencias |
| Framework API | FastAPI | latest | ✅ Stable | Sin version pinneada en `requirements.txt` — **riesgo de rotura por upgrade no controlado** |
| Debugger | debugpy | latest | ⚠️ Solo dev | Incluido en la imagen Docker por defecto — **riesgo de seguridad en producción** |

---

## 4. Superficie del Sistema para Gobernanza

### 4.1 Endpoints (9 total)

| Endpoint | Verbo | ¿Usado por Frontend? | ¿Cubierto por Tests? |
|----------|-------|---------------------|---------------------|
| `/health` | GET | ❌ No | ✅ Sí |
| `/api/metrics` | GET | ✅ Sí | ✅ Sí |
| `/api/metrics/facets` | GET | ❌ No (podria ser) | ✅ Sí |
| `/api/metrics/summary` | GET | ❌ No | ✅ Sí |
| `/api/metrics/categories/top` | GET | ❌ No | ✅ Sí |
| `/api/metrics/comparison` | GET | ❌ No | ❌ No |
| `/api/metrics/alerts` | GET | ❌ No | ❌ No |
| `/api/metrics/b2b` | GET | ❌ No | ✅ Sí |
| `/api/metrics/b2c` | GET | ❌ No | ✅ Sí |

**Hallazgo de gobernanza**: 7 de 9 endpoints tienen tests, pero solo 1 es consumido por el frontend. Hay **6 endpoints sin consumidor en la UI** — esto es arrastre conceptual (scope creep) o funcionalidad no visible. Una regla de gobierno deberia requerir que cada endpoint nuevo tenga un consumidor documentado.

### 4.2 Componentes Frontend (6)

| Componente | Tipo | ¿Tests? | ¿Skeleton/loading? | ¿Error state? |
|-----------|------|---------|-------------------|---------------|
| `DashboardHeader` | Presentacional | ❌ No | N/A | N/A |
| `KPIRow` | Contenedor | ❌ No | ✅ Sí | N/A |
| `KPICard` | Presentacional | ❌ No | ✅ Sí | ❌ No maneja error propio |
| `IncomeOutcomeChart` | Presentacional | ❌ No | ✅ Sí | N/A |
| `ProfitPercentChart` | Presentacional | ❌ No | ✅ Sí | N/A |
| `App` (raíz) | Aplicación | ❌ No | ✅ Sí | ✅ Sí (Error boundary manual) |

**Hallazgo de gobernanza**: Ningún componente tiene tests. El `App` tiene un manejo de errores parcial (catch genérico), pero no usa Error Boundaries de React para aislar errores de renderizado.

---

## 5. Decisiones de Gobernanza Recomendadas

Basado en este overview, las reglas en `.agents/rules/` deben priorizar:

1. **Seguridad sobre features** — CORS restringido, debug condicional (archivos existentes: `security-cors.md`, `security-debug-mode.md`)
2. **Mantenibilidad sobre cantidad de endpoints** — Refactorizar filtros duplicados, remover codigo muerto (archivos existentes: `backend-dry-filters.md`, `cleanup-dead-code.md`)
3. **Resiliencia en frontend** — Error Boundaries, validacion runtime, manejo granular de errores (archivos existentes: `frontend-error-boundaries.md`, `frontend-error-handling.md`, `frontend-runtime-validation.md`)
4. **Tests con valor real** — Tests estructurales no fragiles, cobertura de componentes (archivos existentes: `testing-structure-assertions.md`, `testing-component-rendering.md`)
5. **Rendimiento basico** — Cacheo de datos mock (archivo existente: `backend-data-caching.md`)
6. **Dinamismo sobre hardcode** — Periodo obtenido de API (archivo existente: `frontend-dynamic-data.md`)