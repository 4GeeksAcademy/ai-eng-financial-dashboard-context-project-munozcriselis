/**
 * Tipos de parámetros de consulta para los endpoints del Dashboard Financiero
 *
 * Estas interfaces definen la forma de los query parameters enviados
 * por cada funcionalidad hacia los endpoints del backend:
 * - Filtro de rango de fechas (Especificación 1)
 * - Tabla de alertas de anomalías (Especificación 2)
 * - Vista comparativa B2B vs B2C (Especificación 3)
 */

// =============================================================================
// Filtro de rango de fechas (Especificación 1)
// =============================================================================

/**
 * Parámetros opcionales de rango de fechas, compartidos entre funcionalidades.
 *
 * Ambos campos son opcionales: cuando están vacíos (null/undefined),
 * la API devuelve el histórico completo sin filtros temporales.
 * Las fechas deben enviarse estrictamente en formato ISO 8601: YYYY-MM-DD.
 */
export interface DateRangeFilter {
  /** Fecha de inicio del rango (YYYY-MM-DD). Opcional. */
  start_date?: string;
  /** Fecha de fin del rango (YYYY-MM-DD). Opcional. */
  end_date?: string;
}

// =============================================================================
// Alertas de anomalías (Especificación 2)
// =============================================================================

/**
 * Parámetros de consulta para `GET /api/metrics/alerts`
 *
 * Combina el umbral de sensibilidad con el filtro de rango de fechas
 * heredado de la Especificación 1.
 *
 * Ejemplo de URL completa:
 * `GET /api/metrics/alerts?threshold=0.3&start_date=2026-01-01&end_date=2026-06-30`
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Umbral de sensibilidad para la detección de anomalías.
   * Acepta valores de punto flotante mayores o iguales a 0.
   * Valor por defecto: 0.3
   */
  threshold: number;
}

// =============================================================================
// Top Categorías – B2B vs B2C (Especificación 3)
// =============================================================================

/**
 * Parámetros de consulta para `GET /api/metrics/categories/top`
 *
 * Parametriza el tipo de operación, el límite de categorías y el tipo de negocio,
 * combinándolos con el filtro de rango de fechas de la Especificación 1.
 *
 * Ejemplo de URL completa:
 * `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=2026-01-01&end_date=2026-03-31`
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Tipo de operación financiera a filtrar.
   * Para la vista B2B vs B2C se utiliza exclusivamente "income".
   * Valores: "income" | "outcome"
   */
  operation_type: "income" | "outcome";

  /**
   * Cantidad máxima de categorías a devolver.
   * Rango válido: 1 a 20. Por especificación, limitado a 5 (Top 5).
   */
  limit: number;

  /**
   * Tipo de negocio al que pertenecen los datos.
   * Valores válidos: "B2B" | "B2C"
   */
  business_type: "B2B" | "B2C";
}
