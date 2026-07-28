## Especificación 3: Vista de comparativa B2B vs B2C

### 1. Contexto
La estrategia comercial de la empresa se divide en dos grandes vectores operativos: el segmento corporativo (B2B) y el de consumo masivo (B2C). Los directores de negocio necesitan evaluar constantemente el rendimiento relativo de ambas verticales, sus fuentes de ingresos prioritarias y la distribución de pesos porcentuales entre ellas. Actualmente no existe una vista unificada; los datos están fragmentados y mezclados dentro de las métricas generales. Se requiere un espacio dedicado para contrastar directamente la tracción de ambos modelos comerciales bajo una misma línea temporal.

### 2. Objetivo
Crear una nueva sección/página independiente en el dashboard financiero que ofrezca una vista analítica e intuitiva de comparativa B2B vs B2C, estructurada mediante análisis tabulares paralelos de categorías de ingresos principales y rematada con una visualización gráfica consolidada de los ingresos totales por segmento.

### 3. Alcance
*   **Navegación:** Inclusión de un nuevo ítem en la barra lateral de navegación principal titulado "Comparativa B2B vs B2C".
*   **Diseño en Paralelo:** Sección superior dividida en dos layouts simétricos (Columna Izquierda: B2B, Columna Derecha: B2C).
*   **Visualización de Tablas:** Dos tablas gemelas que muestren el Top 5 de categorías de ingresos de cada vertical.
*   **Visualización de Gráficos:** Un gráfico de barras o líneas situado en la parte inferior que agregue y compare el volumen monetario de ambos modelos de negocio.
*   **Mecanismo de Filtrado:** Filtro de rango de fechas propio integrado en la cabecera de esta página específica (reutilizando el formato `YYYY-MM-DD`).

### 4. Restricciones
*   **Límitación de Categorías:** Las tablas de desglose están limitadas estrictamente por diseño y especificación técnica a un máximo de 5 filas correspondientes a las categorías de mayores ingresos.
*   **Consumo Eficiente de Endpoints:** La recolección de los datos de categorías se estructurará parametrizando el tipo de operación y el límite mediante los endpoints designados, evitando la post-manipulación de listados masivos en el cliente frontend.
*   **Regla de Negocio sobre Porcentajes:** La columna de porcentaje de cada tabla reflejará la cuota de la categoría en relación con el ingreso total *de su propio grupo empresarial* (B2B o B2C de forma independiente), no sobre el total global de la compañía.

### 5. Criterios de Aceptación
*   **CA.1 - Disposición de la Vista e Interfaz Simétrica:** La pantalla presentará dos bloques claramente identificables y distribuidos horizontalmente en pantallas de escritorio. El bloque izquierdo renderizará los datos del segmento B2B y el derecho los del B2C. Cada tabla constará de tres columnas obligatorias: *Nombre de Categoría*, *Total de Ingresos* (formateado en divisa local) y *Porcentaje sobre el Total del Grupo* (ej. `34.5%`).
*   **CA.2 - Consumo de Datos de Top Categorías:** Los datos de las tablas se poblarán mediante llamadas concurrentes parametrizadas al servicio de ingresos:
    *   Filtro B2B: `GET /api/metrics/categories/top?operation_type=income&limit=5&segment=B2B`
    *   Filtro B2C: `GET /api/metrics/categories/top?operation_type=income&limit=5&segment=B2C`
    *(Nota: El parámetro de segmento se mapea según la especificación del negocio sobre el endpoint).*
*   **CA.3 - Gráfico Consolidado Inferior:** Inmediatamente debajo del layout paralelo se ubicará un gráfico de barras yuxtapuestas. Este gráfico comparará el volumen acumulado de ingresos. El eje X representará el tiempo (agrupado según el filtro) y el eje Y reflejará los montos en la divisa correspondiente, mostrando dos series de datos diferenciadas por colores corporativos contrastantes.
*   **CA.4 - Control de Rango de Fechas e Integración de Facetas:** La cabecera de la página consumirá `GET /api/metrics/facets` para delimitar las fechas elegibles en su propio filtro de fechas. Al aplicar un rango de fechas (ej. `2026-01-01` a `2026-03-31`), las llamadas a los endpoints de categorías y métricas de gráficos mutarán para incluir los modificadores: `&start_date=2026-01-01&end_date=2026-03-31`.