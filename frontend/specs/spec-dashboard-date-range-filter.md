# Especificaciones Técnicas y Funcionales

Este documento contiene las especificaciones de requerimientos para tres nuevas funcionalidades clave del dashboard financiero, diseñadas bajo estándares profesionales para asegurar su correcta implementación, testing y validación.

---

## Especificación 1: Filtro de rango de fechas en el dashboard principal

### 1. Contexto
El dashboard principal del sistema financiero actualmente renderiza la totalidad de los datos históricos agregados en el dataset de la compañía de forma omnímoda. A medida que el volumen de transacciones e información histórica ha escalado, los usuarios —particularmente el equipo de finanzas— experimentan sobrecarga cognitiva y degradación del rendimiento en los tiempos de respuesta visual. Existe la necesidad imperativa de segmentar el análisis en ventanas temporales delimitadas (cierres de mes, trimestres fiscales, años en curso) para realizar auditorías dinámicas y reportes ágiles sin la interferencia de ruido histórico irrelevante.

### 2. Objetivo
Implementar un mecanismo de filtrado temporal bicomponente (Fecha Inicio y Fecha Fin) en la interfaz superior del dashboard principal que permita a los usuarios acotar la visualización de todas las métricas, gráficos y tablas concurrentes a un periodo de tiempo específico, proveyendo al mismo tiempo visibilidad del espectro total de datos disponibles mediante la consulta dinámica de límites temporales.

### 3. Alcance
*   **Componentes de Interfaz de Usuario (UI):** Desarrollo de dos selectores de fecha (*date pickers*) independientes, etiquetas indicativas y un contenedor textual para el rango de referencia del dataset.
*   **Integración de Servicios (Backend API):** Consumo del endpoint de facetas para inicializar los límites de referencia y modificación/extensión de los parámetros de consulta de los endpoints de métricas existentes.
*   **Efecto en Cascada:** El filtro afectará de manera síncrona a todos los widgets del dashboard principal (gráficos de ingresos, tablas de costes, KPIs de conversión y cualquier elemento dependiente del tiempo en la vista).
*   *Fuera de alcance:* Guardado persistente del filtro de fechas en las preferencias del usuario (al recargar la página volverá a su estado por defecto), y la aplicación del filtro en pantallas secundarias de configuración o administración.

### 4. Restricciones
*   **Formatos de Comunicación:** Toda fecha enviada hacia la API o procesada en las peticiones HTTP de métricas debe estructurarse estrictamente bajo el estándar ISO 8601 ampliado: `YYYY-MM-DD`.
*   **Dependencia Temporal Absoluta:** No se permitirá la selección de una Fecha de Fin que sea cronológicamente anterior a la Fecha de Inicio. El sistema debe deshabilitar dinámicamente en el calendario las fechas no válidas.
*   **Idoneidad de Datos:** Las fechas ingresadas por el usuario no pueden exceder los límites absolutos provistos por el dataset (`GET /api/metrics/facets`).
*   **Comportamiento por Defecto:** Si ambos inputs se encuentran vacíos (estado inicial null/empty), la aplicación no enviará parámetros temporales a los endpoints de métricas, interpretándose como una solicitud del histórico completo.

### 5. Criterios de Aceptación
*   **CA.1 - Inicialización del Rango de Referencia:** Al cargar la página del dashboard principal, el sistema debe realizar una llamada al endpoint `GET /api/metrics/facets`. La respuesta proporcionará la fecha más antigua (`min_date`) y la más reciente (`max_date`). Este rango debe imprimirse textualmente al lado de los inputs con el formato: *"Rango disponible: YYYY-MM-DD al YYYY-MM-DD"*.
*   **CA.2 - Comportamiento de Inputs Opcionales:** Si los selectores de fecha quedan vacíos, las peticiones HTTP subsiguientes del dashboard principal no incluirán argumentos de fecha. El backend responderá con el histórico total y la UI pintará el acumulado.
*   **CA.3 - Reactividad del Filtrado:** Al confirmar una fecha válida en cualquiera de los inputs (o ambos), se disparará un evento de recarga de datos. Los endpoints existentes (ej. `GET /api/metrics/summary`) se invocarán anexando los *query parameters*: `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`. Si solo uno está lleno, se enviará únicamente su parámetro correspondiente.
*   **CA.4 - Validación Transversal de Reglas:** Si el usuario intenta forzar manualmente una Fecha de Inicio posterior a la Fecha de Fin, el botón de aplicar se deshabilitará y el input infractor mostrará un mensaje de error inline: *"La fecha de inicio no puede ser posterior a la fecha de fin"*.