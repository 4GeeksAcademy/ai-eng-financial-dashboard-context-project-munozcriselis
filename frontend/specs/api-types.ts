/**
 * Tipos de respuesta de la API para el Dashboard Financiero
 *
 * Estas interfaces definen la forma de los datos devueltos por los endpoints
 * del backend utilizados en las tres funcionalidades principales:
 * - Filtro de rango de fechas (Especificación 1)
 * - Tabla de alertas de anomalías (Especificación 2)
 * - Vista comparativa B2B vs B2C (Especificación 3)
 */

// =============================================================================
// Compartido / Facetas
// =============================================================================

/**
 * Respuesta del endpoint `GET /api/metrics/facets`
 *
 * Proporciona los límites temporales absolutos del dataset para que la UI pueda:
 *  - Mostrar el rango de referencia ("Rango disponible: YYYY-MM-DD al YYYY-MM-DD")
 *  - Restringir las selecciones del selector de fechas a límites válidos
 *
 * Utilizada por:
 *  - Especificación 1 – Filtro de rango de fechas (CA.1)
 *  - Especificación 3 – Vista comparativa B2B vs B2C (CA.4)
 */
export interface FacetsResponse {
  /** Fecha más antigua disponible en el dataset (ISO 8601: YYYY-MM-DD) */
  min_date: string;
  /** Fecha más reciente disponible en el dataset (ISO 8601: YYYY-MM-DD) */
  max_date: string;
  /** Tipos de operación disponibles en el dataset. Valores: "income" | "outcome" */
  operation_types: string[];
  /** Tipos de negocio disponibles en el dataset. Valores: "B2B" | "B2C" */
  business_types: string[];
  /** Categorías disponibles en el dataset */
  categories: string[];
}

// =============================================================================
// Alertas de anomalías (Especificación 2)
// =============================================================================

/**
 * Una entrada individual de alerta de anomalía devuelta por `GET /api/metrics/alerts`
 *
 * Representa un pico de gasto detectado donde el outcome registrado superó
 * la media móvil por el ratio de umbral configurado.
 */
export interface AlertEntry {
  /**
   * Identificador temporal del pico.
   * Ejemplos: "2026-Q2" (trimestral) o "2026-05" (mensual)
   */
  period: string;

  /**
   * Valor financiero absoluto del gasto registrado en este período.
   * La unidad corresponde a la moneda local de la empresa.
   */
  outcome_total: number;

  /**
   * Promedio aritmético de los 3 períodos inmediatamente anteriores.
   * Se utiliza como línea base para detectar la anomalía.
   */
  baseline_average: number;

  /**
   * Ratio de incremento de la anomalía como decimal.
   * Ejemplo: 0.452 representa un incremento del 45.2%.
   * El frontend debe multiplicar por 100 para mostrar como porcentaje.
   */
  increase_ratio: number;
}

/**
 * Respuesta de `GET /api/metrics/alerts?threshold=<ratio>[&start_date=...&end_date=...]`
 *
 * Un arreglo de entradas de alerta. Un arreglo vacío indica que no se
 * detectaron anomalías por encima del umbral configurado para el período seleccionado.
 */
export type AlertsResponse = AlertEntry[];

// =============================================================================
// Top Categorías – B2B vs B2C (Especificación 3)
// =============================================================================

/**
 * Una entrada individual de categoría de ingresos devuelta por
 * `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B|B2C`
 *
 * Representa una de las 5 categorías de ingresos principales de un segmento de negocio dado.
 */
export interface CategoryEntry {
  /**
   * Identificador de la categoría de ingresos.
   * Valores posibles: "sales", "suppliers", "operational", "administrative", "others"
   */
  category: string;

  /**
   * Tipo de operación financiera de la categoría.
   * Valores: "income" | "outcome"
   */
  operation_type: string;

  /**
   * Total acumulado de la categoría dentro del período filtrado.
   * Denominado en la moneda local de la empresa.
   */
  total_amount: number;
}

/**
 * Respuesta de `GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=<SEGMENT>`
 *
 * Un arreglo de entradas de categoría (máximo 5) ordenadas por ingresos de mayor a menor.
 * El porcentaje por categoría no viene en la respuesta y debe calcularse en el frontend.
 */
export type TopCategoriesResponse = CategoryEntry[];
