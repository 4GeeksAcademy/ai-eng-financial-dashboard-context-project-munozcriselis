# Referencia de la API — Frontend Specs

Este documento documenta los endpoints del backend consumidos por las tres funcionalidades del dashboard financiero, los tipos TypeScript asociados, las restricciones de cada parámetro y los casos edge que la UI debe manejar.

> **Fuente de verdad del backend:** `backend/app/routes.py` (FastAPI).
> **Tipos TypeScript del frontend:** `specs/api-types.ts` y `specs/param-types.ts`.

---

## Tabla resumen de endpoints

| Funcionalidad | Método | Endpoint | Tipos de request | Tipos de respuesta |
|---------------|--------|----------|------------------|--------------------|
| 1 — Filtro de fechas | `GET` | `/api/metrics/facets` | *(ninguno)* | `FacetsResponse` |
| 2 — Alertas de anomalías | `GET` | `/api/metrics/alerts` | `AlertsParams` | `AlertsResponse` |
| 3 — B2B vs B2C | `GET` | `/api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesResponse` |
| 3 — B2B vs B2C | `GET` | `/api/metrics/comparison` | *(requerido: start_date, end_date)* | `MetricsComparison` |

---

## Funcionalidad 1 — Filtro de rango de fechas

**Especificación:** `spec-dashboard-date-range-filter.md`

### Endpoints consumidos

#### `GET /api/metrics/facets`

Endpoint sin parámetros. Devuelve los límites absolutos del dataset y las facetas disponibles.

**Parámetros de query:** *Ninguno.*

**Respuesta — tipo TypeScript `FacetsResponse`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `min_date` | `string` (ISO 8601: `YYYY-MM-DD`) | Fecha más antigua del dataset |
| `max_date` | `string` (ISO 8601: `YYYY-MM-DD`) | Fecha más reciente del dataset |
| `operation_types` | `string[]` | Tipos de operación disponibles (`"income"`, `"outcome"`) |
| `business_types` | `string[]` | Tipos de negocio disponibles (`"B2B"`, `"B2C"`) |
| `categories` | `string[]` | Categorías disponibles |

**Restricciones:**
- `min_date` siempre será ≤ `max_date`.
- Las fechas del dataset se regeneran con `seed=42`, por lo que los valores son deterministas en desarrollo.

### Parámetros compartidos — tipo `DateRangeFilter`

| Campo | Tipo | Obligatorio | Valores válidos | Formato | Default |
|-------|------|:-----------:|-----------------|---------|---------|
| `start_date` | `string` | No | Fecha dentro del rango `[min_date, max_date]` | `YYYY-MM-DD` | `undefined` (histórico completo) |
| `end_date` | `string` | No | Fecha dentro del rango `[min_date, max_date]` | `YYYY-MM-DD` | `undefined` (histórico completo) |

**Restricciones adicionales:**
- `end_date` no puede ser cronológicamente anterior a `start_date`.
- Si ambos campos están vacíos, no se envía ningún parámetro temporal a la API.

### Casos edge

#### Edge 1 — Ambos inputs vacíos (estado inicial)

**Situación:** El usuario carga la página sin haber interactuado con los date pickers.

**Comportamiento esperado:**
- `start_date` y `end_date` son ambos `undefined`.
- No se envían parámetros de fecha a ningún endpoint.
- La API responde con el histórico completo.
- La UI muestra el acumulado total de todas las métricas.

#### Edge 2 — Fecha de inicio posterior a la fecha de fin

**Situación:** El usuario selecciona `start_date = "2026-06-01"` y luego `end_date = "2026-03-01"`.

**Comportamiento esperado:**
- El botón "Aplicar" se deshabilita.
- Se muestra un mensaje de error inline: *"La fecha de inicio no puede ser posterior a la fecha de fin"*.
- No se realiza ninguna petición HTTP.

#### Edge 3 — Solo uno de los dos campos está completo

**Situación:** El usuario completa solo `start_date = "2026-04-01"` y deja `end_date` vacío.

**Comportamiento esperado:**
- La petición se construye con `?start_date=2026-04-01` (sin `end_date`).
- El backend devuelve todos los datos desde `2026-04-01` hasta el final del dataset.
- La UI renderiza ese subconjunto.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

**Especificación:** `spec-dashboard-anomaly-alerts-table.md`

### Endpoint consumido

#### `GET /api/metrics/alerts`

**Parámetros de query:**

| Parámetro | Tipo TypeScript | Obligatorio | Valores válidos | Default | Descripción |
|-----------|----------------|:-----------:|-----------------|---------|-------------|
| `threshold` | `number` | No | `≥ 0` (float) | `0.3` | Umbral de sensibilidad para la detección de anomalías |
| `start_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | `undefined` | Límite inferior del filtro temporal |
| `end_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | `undefined` | Límite superior del filtro temporal |
| `group_by` | `string` | No | `"day"` \| `"week"` \| `"month"` | `"month"` | Agrupación temporal de los datos |

**Tipo de respuesta — tipo TypeScript `AlertsResponse` (alias de `AlertEntry[]`):**

Cada elemento del array tiene la siguiente estructura:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `period` | `string` | Identificador temporal (ej. `"2026-05"`, `"2026-Q2"`) |
| `outcome_total` | `number` | Valor absoluto del gasto en el período |
| `baseline_average` | `number` | Promedio de los 3 períodos anteriores |
| `increase_ratio` | `number` | Ratio decimal de incremento (ej. `0.452` = 45.2%). El frontend debe multiplicar por 100 y formatear como `"+XX.X%"` |

**Restricciones:**
- El endpoint filtra por `business_type` si se proporciona, pero la spec de la Funcionalidad 2 no lo utiliza.
- La detección de anomalías requiere al menos 2 períodos de datos para calcular una media móvil.

### Parámetros — tipo `AlertsParams`

```typescript
interface AlertsParams extends DateRangeFilter {
  threshold: number;  // ≥ 0
}
```

| Campo | Tipo | Valores válidos | Restricción UI |
|-------|------|-----------------|----------------|
| `threshold` | `number` | `≥ 0` (paso `0.01`) | Validar en el frontend según la spec |
| `start_date` | `string \| undefined` | `YYYY-MM-DD` | Opcional. Heredado de `DateRangeFilter` |
| `end_date` | `string \| undefined` | `YYYY-MM-DD` | Opcional. Heredado de `DateRangeFilter` |

### Casos edge

#### Edge 1 — Arreglo vacío de alertas (umbral alto)

**Situación:** El usuario configura `threshold = 0.9` y la API devuelve `[]` porque ninguna anomalía supera ese umbral.

**Comportamiento esperado:**
- La tabla **no se oculta ni colapsa**.
- El `<tbody>` se reemplaza por un contenedor centrado con icono neutro y el texto:
  > *"No se han detectado anomalías de gasto para el umbral del 0.9 en el período seleccionado"*
- Las cabeceras de las 4 columnas permanecen visibles.

#### Edge 2 — Umbral fuera de rango

**Situación:** El usuario ingresa `threshold = 1.5` (fuera del rango `[0.01, 1.0]`).

**Comportamiento esperado:**
- Se muestra un mensaje de error inline: *"El umbral debe estar entre 0.01 y 1.0"*.
- No se ejecuta la petición HTTP a `GET /api/metrics/alerts`.
- La tabla mantiene los datos previos (si los hubiera).

#### Edge 3 — Umbral en el límite inferior

**Situación:** El usuario configura `threshold = 0.01`, el valor más sensible posible.

**Comportamiento esperado:**
- Se envía `?threshold=0.01` a la API.
- Se esperan más alertas (cualquier incremento del 1% sobre la media móvil se detecta).
- La tabla renderiza todas las entradas devueltas.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

**Especificación:** `spec-dashboard-b2b-b2c-comparison-view.md`

### Endpoints consumidos

#### `GET /api/metrics/categories/top`

**Parámetros de query:**

| Parámetro | Tipo TypeScript | Obligatorio | Valores válidos | Default | Descripción |
|-----------|----------------|:-----------:|-----------------|---------|-------------|
| `operation_type` | `string` | No | `"income"` \| `"outcome"` | `"outcome"` | Tipo de operación financiera |
| `limit` | `number` | No | `1` a `20` (entero) | `5` | Máximo de categorías a devolver |
| `business_type` | `string` | No | `"B2B"` \| `"B2C"` | `undefined` | Segmento de negocio |
| `start_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | `undefined` | Límite inferior del filtro temporal |
| `end_date` | `string` | No | Fecha ISO `YYYY-MM-DD` | `undefined` | Límite superior del filtro temporal |

**Tipo de respuesta — tipo TypeScript `TopCategoriesResponse` (alias de `CategoryEntry[]`):**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `category` | `string` | Identificador de la categoría (ej. `"sales"`, `"suppliers"`) |
| `operation_type` | `string` | Tipo de operación (`"income"` o `"outcome"`) |
| `total_amount` | `number` | Total acumulado de la categoría en el período filtrado |

> **Nota:** El porcentaje por categoría no viene en la respuesta. El frontend debe calcularlo dividiendo `total_amount` de cada categoría entre la suma de `total_amount` de todas las categorías del mismo segmento, y formatearlo como `"XX.X%"`.

**Llamadas concurrentes (CA.2):**

Para cada segmento se realiza una petición independiente:

```
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C
```

Cuando hay filtro de fechas activo:

```
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=2026-01-01&end_date=2026-03-31
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&start_date=2026-01-01&end_date=2026-03-31
```

#### `GET /api/metrics/comparison`

**Parámetros de query:**

| Parámetro | Tipo | Obligatorio | Valores válidos | Descripción |
|-----------|------|:-----------:|-----------------|-------------|
| `start_date` | `date` | **Sí** | Fecha ISO `YYYY-MM-DD` | Inicio del período a comparar |
| `end_date` | `date` | **Sí** | Fecha ISO `YYYY-MM-DD` | Fin del período a comparar |
| `business_type` | `string` | No | `"B2B"` \| `"B2C"` | Filtrar por segmento específico |

> **Nota:** Este endpoint **requiere** ambos parámetros de fecha (`start_date` y `end_date` son obligatorios en el backend). No funciona sin filtro temporal.

**Tipo de respuesta `MetricsComparison`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `current_period` | `number` | Valor neto (ingresos − gastos) del período actual |
| `previous_period` | `number` | Valor neto del período equivalente inmediatamente anterior |
| `delta_abs` | `number` | Diferencia absoluta entre ambos períodos |
| `delta_pct` | `number \| null` | Diferencia porcentual. `null` si el período anterior fue 0 |

**Llamadas para el gráfico comparativo:**

```
GET /api/metrics/comparison?start_date=2026-01-01&end_date=2026-03-31&business_type=B2B
GET /api/metrics/comparison?start_date=2026-01-01&end_date=2026-03-31&business_type=B2C
```

### Parámetros — tipo `TopCategoriesParams`

```typescript
interface TopCategoriesParams extends DateRangeFilter {
  operation_type: "income" | "outcome";  // "income" para B2B vs B2C
  limit: number;                         // 5 (Top 5 por spec)
  business_type: "B2B" | "B2C";
}
```

| Campo | Tipo | Valores válidos | Default backend |
|-------|------|-----------------|-----------------|
| `operation_type` | `"income" \| "outcome"` | Solo estos dos valores | `"outcome"` |
| `limit` | `number` | `1` a `20` | `5` |
| `business_type` | `"B2B" \| "B2C"` | Solo estos dos valores | `undefined` (todos) |
| `start_date` | `string \| undefined` | `YYYY-MM-DD` | `undefined` |
| `end_date` | `string \| undefined` | `YYYY-MM-DD` | `undefined` |

### Casos edge

#### Edge 1 — Segmento sin datos de categorías

**Situación:** El backend no devuelve categorías para uno de los segmentos (ej. B2C tiene `[]`).

**Comportamiento esperado:**
- El panel del segmento afectado **no se oculta**.
- La tabla se reemplaza por un contenedor centrado con icono de carpeta vacía y el texto:
  > *"No hay datos de categorías de ingresos disponibles para el segmento B2C en el período seleccionado"*
- El otro panel (B2B) renderiza normalmente si tiene datos.

#### Edge 2 — Filtro de fechas sin datos para ambos segmentos

**Situación:** El usuario selecciona un rango de fechas muy estrecho (ej. un solo día) donde no existen movimientos para ningún segmento.

**Comportamiento esperado:**
- Ambos paneles muestran el estado vacío descrito arriba.
- El gráfico comparativo no renderiza barras (eje X vacío o mensaje de sin datos).
- El filtro de fechas conserva las fechas seleccionadas.

#### Edge 3 — Porcentaje calculado con un solo segmento activo

**Situación:** Solo B2B tiene datos en el período seleccionado; B2C devuelve `[]`.

**Comportamiento esperado:**
- La tabla B2B muestra sus 5 categorías con porcentajes que suman ~100%.
- La columna de porcentaje se calcula solo con las categorías de B2B (no global).
- La tabla B2C muestra el estado vacío.
- El gráfico muestra solo la serie B2B (una barra por período, sin la serie B2C).
