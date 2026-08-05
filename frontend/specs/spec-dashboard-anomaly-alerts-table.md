## Especificación 2: Tabla de alertas de anomalías en el dashboard principal

### 1. Contexto
La detección temprana de desviaciones presupuestarias es crítica para la salud financiera de la organización. Actualmente, el equipo de finanzas debe auditar manualmente los gráficos lineales de gasto en busca de picos imprevistos, un proceso propenso a errores humanos y retrasos operativos. Para mitigar esto, el backend expone algoritmos de detección de anomalías basados en variaciones de gasto respecto a medias móviles. Se requiere una interfaz centralizada y parametrizable dentro del propio dashboard principal que visibilice estas alertas de manera proactiva sin requerir análisis manuales exhaustivos.

### 2. Objetivo
Desarrollar un componente de tipo tabla bajo la sección de gráficos del dashboard principal que exponga de forma clara las anomalías de gasto detectadas por el sistema, permitiendo al usuario calibrar la sensibilidad de la detección a través de un control numérico de umbral y reaccionando dinámicamente al contexto temporal activo.

### 3. Alcance
*   **Componentes de UI:** Una tabla estructurada de 4 columnas, un input de entrada numérica de precisión decimal para el umbral, y un contenedor específico para el estado vacío (*empty state*).
*   **Integración de Endpoints:** Consumo del servicio especializado `GET /api/metrics/alerts` pasándole el parámetro de sensibilidad e integrando los parámetros de fecha de la *Especificación 1*.
*   *Fuera de alcance:* Mecanismos para exportar las anomalías a formatos CSV/PDF directos desde la tabla (se evaluará en fases posteriores) y sistemas de notificaciones push o alertas por correo electrónico basadas en estos eventos.

### 4. Restricciones
*   **Acotación del Umbral:** El input del umbral (*ratio*) acepta únicamente valores numéricos de punto flotante comprendidos en el intervalo cerrado de `0.01` a `1.0`. Valores fuera de este rango deben ser rechazados en la interfaz antes de realizar la petición HTTP.
*   **Valor Inicial:** El sistema cargará por defecto el ratio de `0.3` al inicializar la vista si no hay interacción previa del usuario.
*   **Intersección de Filtros:** La tabla está subordinada al estado de la *Especificación 1*. Si existe un filtro de rango de fechas activo en el dashboard, la petición de alertas debe incluir obligatoriamente dichos parámetros.

### 5. Criterios de Aceptación
*   **CA.1 - Estructura Rigurosa de Columnas:** La tabla debe renderizar exactamente cuatro columnas con la siguiente información proveniente del payload:
    1.  *Período:* Identificador temporal del pico (ej. "2026-Q2" o "2026-05").
    2.  *Outcome Registrado:* Valor financiero absoluto del gasto en ese periodo.
    3.  *Media Móvil:* Promedio aritmético registrado de los 3 períodos inmediatamente anteriores.
    4.  *Incremento Porcentual:* Ratio de la anomalía formateado explícitamente como porcentaje (ej. `+45.2%`).
*   **CA.2 - Control de Sensibilidad Dinámico:** El usuario podrá cambiar el valor del umbral mediante un input numérico (pasos de `0.01`). Al cambiar el valor y perder el foco o presionar Enter, se ejecutará una llamada a: `GET /api/metrics/alerts?threshold=<ratio>`.
*   **CA.3 - Gestión Estricta del Estado Vacío:** Si la API devuelve un arreglo vacío `[]` debido a que ninguna anomalía supera el umbral configurado, la tabla no debe ocultarse ni colapsar. En su lugar, el cuerpo de la tabla se sustituirá por un contenedor centrado con un icono neutro y el texto explícito: *"No se han detectado anomalías de gasto para el umbral del <ratio> en el período seleccionado"*.
*   **CA.4 - Sincronización Temporal:** Cuando el filtro de fechas superior (Especificación 1) esté activo, la URL de consulta se transformará combinando los parámetros: `GET /api/metrics/alerts?threshold=0.3&start_date=2026-01-01&end_date=2026-06-30`.

---
