# Desglose de Componentes por Funcionalidad

Este documento describe la arquitectura de componentes React para las tres funcionalidades del dashboard financiero, incluyendo sus props, comportamiento y estados especiales.

> **Tipos referenciados:** `api-types.ts` y `param-types.ts` en `frontend/specs/`.

---

## Funcionalidad 1 — Filtro de rango de fechas

**Especificación de referencia:** `spec-dashboard-date-range-filter.md`

### Componentes

#### `DateRangeFilter`

Componente contenedor que gestiona el estado del filtro de fechas y coordina la validación, el consumo de facetas y la propagación de los parámetros seleccionados al resto del dashboard.

**Ubicación sugerida:** Cabecera del dashboard principal, visible en todas las vistas que dependan de datos temporales.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `onFilterChange` | `(filter: DateRangeFilter) => void` | Sí | Callback que se invoca cada vez que el usuario confirma un rango válido. El objeto `DateRangeFilter` (de `param-types.ts`) contiene `start_date?` y `end_date?` como strings `YYYY-MM-DD`. Cuando ambos son `undefined`, se interpreta como histórico completo (CA.2). |

#### `DateRangeFilterContent` (componente interno)

Presentacional. Renderiza los dos selectores de fecha, la etiqueta del rango disponible y los mensajes de error.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `minDate` | `string` | Sí | Fecha más antigua del dataset (campo `min_date` de `FacetsResponse`). Formato `YYYY-MM-DD`. Se usa como límite inferior del calendario. |
| `maxDate` | `string` | Sí | Fecha más reciente del dataset (campo `max_date` de `FacetsResponse`). Formato `YYYY-MM-DD`. Se usa como límite superior del calendario. |
| `startDate` | `string \| null` | Sí | Valor actual del input de fecha de inicio. |
| `endDate` | `string \| null` | Sí | Valor actual del input de fecha de fin. |
| `onStartDateChange` | `(date: string \| null) => void` | Sí | Handler de cambio del input de inicio. |
| `onEndDateChange` | `(date: string \| null) => void` | Sí | Handler de cambio del input de fin. |
| `onApply` | `() => void` | Sí | Handler del botón "Aplicar". Se deshabilita cuando la validación falla. |
| `error` | `string \| null` | Sí | Mensaje de error inline a mostrar cuando la validación falla. `null` cuando no hay error. |

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Fecha Inicio: [date picker]   Fecha Fin: [date picker]     │
│                            [Aplicar]                         │
│  Rango disponible: 2025-01-01 al 2026-07-28                 │
└──────────────────────────────────────────────────────────────┘
```

- Los dos selectores de fecha se disponen en línea horizontal en pantallas de escritorio.
- Debajo de los selectores, alineado a la derecha o centro, se ubica el botón "Aplicar".
- Debajo del botón, en texto secundario smaller, se muestra la pista del rango disponible.

### Comportamiento cuando solo uno de los dos inputs está relleno (CA.3)

Cuando **solo** `start_date` está completado (y `endDate` es `null`):
- La petición a la API se construye únicamente con `?start_date=YYYY-MM-DD`, sin incluir `end_date`.
- El backend devuelve todos los datos desde esa fecha hasta el final del dataset.

Cuando **solo** `end_date` está completado (y `startDate` es `null`):
- La petición a la API se construye únicamente con `?end_date=YYYY-MM-DD`, sin incluir `start_date`.
- El backend devuelve todos los datos desde el inicio del dataset hasta esa fecha.

Cuando **ambos están vacíos** (estado inicial):
- No se envía ningún parámetro temporal a la API.
- El backend responde con el histórico completo.

### Pista del rango de fechas disponible (CA.1)

Al cargar el componente se realiza un `GET /api/metrics/facets`. La respuesta (`FacetsResponse`) se consume para:

1. **Mostrar textualmente** al lado de los inputs:
   ```
   Rango disponible: {min_date} al {max_date}
   ```
2. **Configurar los límites** de los date pickers:
   - El date picker de inicio no permite seleccionar fechas anteriores a `min_date`.
   - El date picker de fin no permite seleccionar fechas posteriores a `max_date`.
3. **Bloquear rangos inválidos (CA.4):** El date picker de fin deshabilita dinámicamente las fechas cronológicamente anteriores a la fecha de inicio seleccionada. Si el usuario fuerza manualmente una Fecha de Inicio posterior a la Fecha de Fin, se muestra el error inline: *"La fecha de inicio no puede ser posterior a la fecha de fin"* y el botón "Aplicar" se deshabilita.

---

## Funcionalidad 2 — Tabla de alertas de anomalías

**Especificación de referencia:** `spec-dashboard-anomaly-alerts-table.md`

### Componentes

#### `AnomalyAlertsTable`

Componente principal que encapsula el input de umbral, la tabla de resultados y el estado vacío. Se sitúa bajo la sección de gráficos del dashboard principal.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `dateRange` | `DateRangeFilter` | Sí | Filtro de rango de fechas activo heredado de la Funcionalidad 1. Contiene `start_date?` y `end_date?`. Cuando ambos campos son `undefined`, se consulta el histórico completo. |
| `onThresholdChange` | `(threshold: number) => void` | No | Callback opcional que notifica al componente padre cuando el umbral cambia. |

#### `ThresholdInput` (componente interno)

Presentacional. Input numérico de precisión decimal para el umbral de sensibilidad.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `value` | `number` | Sí | Valor actual del umbral. Rango válido: `0.01` a `1.0`. Valor por defecto: `0.3`. |
| `onChange` | `(value: number) => void` | Sí | Callback que se invoca al confirmar el nuevo valor (onBlur o Enter). |
| `min` | `number` | No | Límite inferior. Default: `0.01`. |
| `max` | `number` | No | Límite superior. Default: `1.0`. |
| `step` | `number` | No | Incremento por paso. Default: `0.01`. |

#### `AlertRow` (componente interno)

Presentacional. Renderiza una fila de la tabla con los datos de una alerta individual.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `alert` | `AlertEntry` | Sí | Objeto individual de la respuesta `AlertsResponse`. |

#### `EmptyAlertsState` (componente interno)

Presentacional. Se renderiza cuando la API devuelve un arreglo vacío `[]`.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `threshold` | `number` | Sí | Umbral actual configurado, para mostrar en el mensaje. |
| `dateRange` | `DateRangeFilter` | Sí | Rango de fechas activo, para contextualizar el mensaje. |

### Columnas de la tabla (CA.1)

La tabla renderiza **exactamente** 4 columnas. Cada columna corresponde a un campo de `AlertEntry`:

| # | Cabecera | Campo de `AlertEntry` | Tipo de dato | Formato de visualización |
|---|----------|----------------------|--------------|--------------------------|
| 1 | Período | `period` | `string` | Texto literal (ej. `"2026-Q2"`, `"2026-05"`) |
| 2 | Outcome Registrado | `outcome_total` | `number` | Moneda local con separadores de miles (ej. `$1,234,567`) |
| 3 | Media Móvil | `baseline_average` | `number` | Moneda local con separadores de miles (ej. `$987,654`) |
| 4 | Incremento Porcentual | `increase_ratio` | `number` | Se multiplica ×100 y se formatea como `"+XX.X%"` (ej. `+45.2%`) |

### Estado vacío (CA.3)

Cuando `AlertsResponse` es un arreglo vacío `[]`:

- La tabla **no se oculta ni colapsa**. Se mantiene visible con sus cabeceras.
- El `<tbody>` se reemplaza por un contenedor centrado que contiene:
  1. Un **icono neutro** (ej. icono de información o check).
  2. El texto explícito:
     > *"No se han detectado anomalías de gasto para el umbral del {threshold} en el período seleccionado"*
  - Donde `{threshold}` se sustituye por el valor numérico actual del input (ej. `0.3`).

### Comportamiento del input de umbral fuera de rango

Cuando el usuario ingresa un valor fuera del intervalo `[0.01, 1.0]`:

1. **Se muestra un mensaje de error** inline debajo del input: *"El umbral debe estar entre 0.01 y 1.0"*.
2. **No se ejecuta la petición HTTP** a `GET /api/metrics/alerts`. La tabla mantiene los datos previos.
3. El input conserva el valor inválido hasta que el usuario lo corrija.

### Comportamiento de sensibilidad dinámica (CA.2)

Al cambiar el valor del umbral y confirmar (perder foco o presionar Enter):

1. Se valida que el valor esté en `[0.01, 1.0]`.
2. Si es válido, se construye la petición combinando el umbral con el filtro de fechas activo:
   ```
   GET /api/metrics/alerts?threshold={value}[&start_date={start_date}&end_date={end_date}]
   ```
3. La tabla se actualiza con la respuesta.

---

## Funcionalidad 3 — Vista comparativa B2B vs B2C

**Especificación de referencia:** `spec-dashboard-b2b-b2c-comparison-view.md`

### Componentes

#### `B2BvsB2CView`

Componente raíz de la página independiente de comparativa. Gestiona el filtro de fechas propio, las llamadas concurrentes a los endpoints de categorías y la orquestación del gráfico inferior.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| *(sin props externas)* | — | — | Página autónoma que gestiona su propio estado interno. Consume `FacetsResponse` al montar para inicializar su filtro de fechas. |

#### `B2BvsB2CHeader` (componente interno)

Cabecera de la página que contiene el filtro de fechas propio y el título de la sección.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `minDate` | `string` | Sí | Límite inferior del dataset (`min_date` de `FacetsResponse`). Formato `YYYY-MM-DD`. |
| `maxDate` | `string` | Sí | Límite superior del dataset (`max_date` de `FacetsResponse`). Formato `YYYY-MM-DD`. |
| `startDate` | `string \| null` | Sí | Fecha de inicio seleccionada por el usuario. |
| `endDate` | `string \| null` | Sí | Fecha de fin seleccionada por el usuario. |
| `onFilterChange` | `(filter: DateRangeFilter) => void` | Sí | Callback que propaga el filtro seleccionado a los componentes hijos. |

#### `SegmentPanel` (componente reutilizable)

Panel genérico que renderiza el título del segmento y su tabla Top-5. Se instancia dos veces: una para B2B (izquierda) y otra para B2C (derecha).

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `businessType` | `"B2B" \| "B2C"` | Sí | Identificador del tipo de negocio. Determina el título del panel y el parámetro `business_type` en la llamada a la API. |
| `categories` | `CategoryEntry[]` | Sí | Arreglo de categorías devuelto por `TopCategoriesResponse`. Puede estar vacío. |
| `isLoading` | `boolean` | Sí | Indica si los datos están en curso de carga. Muestra skeleton mientras es `true`. |
| `error` | `string \| null` | Sí | Mensaje de error si la petición falla. `null` cuando no hay error. |

#### `TopCategoriesTable` (componente interno)

Tabla que renderiza las 3 columnas obligatorias de cada tipo de negocio.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `categories` | `CategoryEntry[]` | Sí | Arreglo de categorías a renderizar (máximo 5 elementos). |
| `businessType` | `"B2B" \| "B2C"` | Sí | Tipo de negocio al que pertenecen los datos. |

#### `ComparisonChart` (componente interno)

Gráfico de barras yuxtapuestas que compara el volumen acumulado de ingresos de ambos segmentos a lo largo del tiempo.

| Prop | Tipo | Obligatoria | Descripción |
|------|------|:-----------:|-------------|
| `b2bData` | `Array<{ period: string; total: number }>` | Sí | Serie temporal de ingresos acumulados del segmento B2B. Cada punto representa un período y su monto total. |
| `b2cData` | `Array<{ period: string; total: number }>` | Sí | Serie temporal de ingresos acumulados del segmento B2C. Cada punto representa un período y su monto total. |
| `isLoading` | `boolean` | Sí | Indica si los datos están en curso de carga. Muestra skeleton mientras es `true`. |

### Layout de la vista

```
┌──────────────────────────────────────────────────────────────┐
│  [Comparativa B2B vs B2C]                                    │
│  Fecha Inicio: [date picker]  Fecha Fin: [date picker]      │
│  Rango disponible: 2025-01-01 al 2026-07-28                 │
├──────────────────────────┬───────────────────────────────────┤
│       B2B                │              B2C                   │
│ ┌──────────────────────┐ │ ┌───────────────────────────────┐ │
│ │ Categoría │Ingr. │ % │ │ │ Categoría │ Ingr. │    %     │ │
│ ├──────────────────────┤ │ ├───────────────────────────────┤ │
│ │ ...       │ ...  │...│ │ │ ...       │ ...   │   ...     │ │
│ │ ...       │ ...  │...│ │ │ ...       │ ...   │   ...     │ │
│ │ ...       │ ...  │...│ │ │ ...       │ ...   │   ...     │ │
│ │ ...       │ ...  │...│ │ │ ...       │ ...   │   ...     │ │
│ │ ...       │ ...  │...│ │ │ ...       │ ...   │   ...     │ │
│ └──────────────────────┘ │ └───────────────────────────────┘ │
├──────────────────────────┴───────────────────────────────────┤
│                   Gráfico Comparativo                         │
│        (Barras yuxtapuestas: B2B vs B2C por período)          │
│   Eje X: Período   │   Eje Y: Monto en divisa local          │
└──────────────────────────────────────────────────────────────┘
```

En pantallas de escritorio, los dos paneles (`SegmentPanel`) se disponen **horizontalmente** de forma simétrica: B2B a la izquierda, B2C a la derecha. En pantallas móviles, se apilan verticalmente.

### Columnas de la tabla Top-5 (CA.1)

Cada `TopCategoriesTable` renderiza exactamente 3 columnas:

| # | Cabecera | Campo de `CategoryEntry` | Tipo de dato | Formato de visualización |
|---|----------|-------------------------|--------------|--------------------------|
| 1 | Nombre de Categoría | `category` | `string` | Texto literal (ej. `"sales"`, `"suppliers"`) |
| 2 | Total de Ingresos | `total_amount` | `number` | Moneda local con separadores de miles (ej. `$2,450,000`) |
| 3 | Porcentaje del Grupo | *(calculado en frontend)* | `string` | Se calcula como `total_amount / Σtotal_amount × 100`, formateado como `"XX.X%"` |

> **Regla de negocio:** El porcentaje se calcula sobre el ingreso total **del propio segmento** (B2B o B2C), no sobre el total global de la compañía.

### Estado vacío del panel

Cuando `categories` es un arreglo vacío `[]` (la API no devolvió categorías para ese segmento):

- El panel **no se oculta**. Se mantiene visible con su título (ej. "B2B" o "B2C").
- La tabla se reemplaza por un contenedor centrado con:
  1. Un **icono neutro** (ej. icono de carpeta vacía o sin datos).
  2. Un texto descriptivo: *"No hay datos de categorías de ingresos disponibles para {businessType} en el período seleccionado"*.

### Gráfico comparativo (CA.3)

El `ComparisonChart` renderiza un gráfico de **barras yuxtapuestas** (o líneas) que compara visualmente ambos segmentos:

| Elemento | Representación |
|----------|---------------|
| **Eje X** | Período temporal (trimestral o mensual), agrupado según el filtro activo. Cada marca representa un período (ej. `"2026-Q1"`, `"2026-Q2"`). |
| **Eje Y** | Monto acumulado de ingresos en la divisa local de la empresa. Escala automática según los datos. |
| **Serie B2B** | Barras con color corporativo B2B (ej. azul). Cada barra representa el volumen total de ingresos B2B en ese período. |
| **Serie B2C** | Barras con color corporativo B2C (ej. naranja), yuxtapuestas a las de B2B. Cada barra representa el volumen total de ingresos B2C en ese período. |
| **Leyenda** | Muestra las etiquetas "B2B" y "B2C" con sus colores correspondientes. |

Cuando `isLoading` es `true`, el gráfico se reemplaza por un skeleton que mantiene la proporción del gráfico.

---

## Dependencias cruzadas entre funcionalidades

| Componente | Dependencia | Descripción |
|-----------|-------------|-------------|
| `AnomalyAlertsTable` | `DateRangeFilter` (Func. 1) | El filtro de fechas del dashboard principal se propaga como prop. Los parámetros de fecha se combinan con el umbral en la petición a la API. |
| `B2BvsB2CView` | `DateRangeFilter` (Func. 1) | Reutiliza el patrón de `DateRangeFilter` pero con su propio header independiente. No depende del filtro del dashboard principal. |
| `B2BvsB2CView` | `FacetsResponse` (compartido) | Consumo independiente de `GET /api/metrics/facets` para inicializar sus propios límites de fecha. |
| `SegmentPanel` | `TopCategoriesParams` (Func. 3) | Recibe los parámetros construidos por el componente padre para cada llamada concurrente a `GET /api/metrics/categories/top`. |
