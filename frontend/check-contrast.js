// Verificación manual de contraste de colores para accesibilidad
// Usando fórmula WCAG 2.0

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Conversión de oklch a hex (simplificada)
function oklchToHex(l, c, h) {
  // Conversión aproximada - para uso real se necesitaría una librería completa
  const hue = h * Math.PI / 180;
  const a = c * Math.cos(hue);
  const b = c * Math.sin(hue);
  
  // Conversión a RGB (simplificada)
  const r = Math.round(255 * Math.min(1, Math.max(0, l + 0.134 * a + 0.063 * b)));
  const g = Math.round(255 * Math.min(1, Math.max(0, l - 0.081 * a - 0.213 * b)));
  const bVal = Math.round(255 * Math.min(1, Math.max(0, l - 0.036 * a - 0.308 * b)));
  
  return rgbToHex(r, g, bVal);
}

// Colores del theme dark (actualizados para coincidir con globals.css/index.css)
const colors = {
  background: oklchToHex(0.13, 0.01, 240),
  foreground: oklchToHex(0.94, 0.005, 240),
  muted: oklchToHex(0.24, 0.015, 240),
  mutedForeground: oklchToHex(0.68, 0.01, 240),  // Actualizado de 0.62 a 0.68
  card: oklchToHex(0.18, 0.012, 240),
  cardForeground: oklchToHex(0.94, 0.005, 240),
  primary: oklchToHex(0.6, 0.2, 255),
  primaryForeground: oklchToHex(0.99, 0, 0),
  destructive: oklchToHex(0.40, 0.18, 27),
  destructiveForeground: oklchToHex(0.94, 0.005, 240),
  incomeBadge: oklchToHex(0.25, 0.08, 155),
  incomeBadgeFg: oklchToHex(0.72, 0.16, 155),
  outcomeBadge: oklchToHex(0.25, 0.07, 25),
  outcomeBadgeFg: oklchToHex(0.72, 0.16, 27),
  profitBadge: oklchToHex(0.22, 0.05, 255),
  profitBadgeFg: oklchToHex(0.72, 0.16, 255),
  // Light theme colors (actualizados para coincidir con :root)
  lightBackground: oklchToHex(0.97, 0.005, 240),
  lightForeground: oklchToHex(0.15, 0.01, 240),
  lightMutedForeground: oklchToHex(0.42, 0.01, 240),
  lightIncomeBadge: oklchToHex(0.93, 0.06, 155),
  lightIncomeBadgeFg: oklchToHex(0.35, 0.12, 155),
  lightOutcomeBadge: oklchToHex(0.95, 0.06, 25),
  lightOutcomeBadgeFg: oklchToHex(0.42, 0.15, 27),
  lightProfitBadge: oklchToHex(0.93, 0.04, 255),
  lightProfitBadgeFg: oklchToHex(0.38, 0.15, 255),
};

// Función para calcular luminancia relativa
function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Función para calcular ratio de contraste
function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Verificar contraste
console.log("=== VERIFICACIÓN DE CONTRASTE DE COLORES ===");
console.log("");

// Texto principal vs fondo
const contrast1 = getContrastRatio(colors.foreground, colors.background);
console.log(`Texto principal vs fondo: ${contrast1.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast1 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast1 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Texto secundario vs fondo
const contrast2 = getContrastRatio(colors.mutedForeground, colors.background);
console.log(`Texto secundario vs fondo: ${contrast2.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast2 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast2 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Texto de error vs fondo de error
const contrast3 = getContrastRatio(colors.destructiveForeground, colors.destructive);
console.log(`Texto de error vs fondo de error: ${contrast3.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast3 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast3 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Texto de badge vs fondo de badge
const contrast4 = getContrastRatio(colors.incomeBadgeFg, colors.incomeBadge);
console.log(`Texto badge income vs fondo badge: ${contrast4.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast4 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast4 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

const contrast5 = getContrastRatio(colors.outcomeBadgeFg, colors.outcomeBadge);
console.log(`Texto badge outcome vs fondo badge: ${contrast5.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast5 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast5 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

const contrast6 = getContrastRatio(colors.profitBadgeFg, colors.profitBadge);
console.log(`Texto badge profit vs fondo badge: ${contrast6.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${contrast6 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${contrast6 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Colores de gráficos vs fondo
const chartColors = [
  { name: "chart-income", hex: oklchToHex(0.62, 0.2, 255) },
  { name: "chart-outcome", hex: oklchToHex(0.68, 0.18, 30) },
  { name: "chart-profit", hex: oklchToHex(0.65, 0.16, 160) }
];

chartColors.forEach(chart => {
  const contrast = getContrastRatio(chart.hex, colors.card);
  console.log(`${chart.name} vs fondo de tarjeta: ${contrast.toFixed(2)}:1`);
  console.log(`  WCAG AA (gráficos): ${contrast >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
});

console.log("");
console.log("=== VERIFICACIÓN DE CONTRASTE - THEME LIGHT ===");
console.log("");

// Light theme: texto principal vs fondo
const lightContrast1 = getContrastRatio(colors.lightForeground, colors.lightBackground);
console.log(`Texto principal vs fondo: ${lightContrast1.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${lightContrast1 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${lightContrast1 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Light theme: texto secundario vs fondo
const lightContrast2 = getContrastRatio(colors.lightMutedForeground, colors.lightBackground);
console.log(`Texto secundario vs fondo: ${lightContrast2.toFixed(2)}:1`);
console.log(`  WCAG AA (texto normal): ${lightContrast2 >= 4.5 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log(`  WCAG AA (texto grande): ${lightContrast2 >= 3 ? "✅ CUMPLE" : "❌ NO CUMPLE"}`);
console.log("");

// Light theme: badges
const lightContrast3 = getContrastRatio(colors.lightIncomeBadgeFg, colors.lightIncomeBadge);
console.log(`Badge income (light): ${lightContrast3.toFixed(2)}:1 → ${lightContrast3 >= 4.5 ? "✅ CUMPLE AA" : lightContrast3 >= 3 ? "⚠️ SOLO AA-grande" : "❌ NO CUMPLE"}`);

const lightContrast4 = getContrastRatio(colors.lightOutcomeBadgeFg, colors.lightOutcomeBadge);
console.log(`Badge outcome (light): ${lightContrast4.toFixed(2)}:1 → ${lightContrast4 >= 4.5 ? "✅ CUMPLE AA" : lightContrast4 >= 3 ? "⚠️ SOLO AA-grande" : "❌ NO CUMPLE"}`);

const lightContrast5 = getContrastRatio(colors.lightProfitBadgeFg, colors.lightProfitBadge);
console.log(`Badge profit (light): ${lightContrast5.toFixed(2)}:1 → ${lightContrast5 >= 4.5 ? "✅ CUMPLE AA" : lightContrast5 >= 3 ? "⚠️ SOLO AA-grande" : "❌ NO CUMPLE"}`);

console.log("");
console.log("=== VERIFICACIÓN COMPLETADA ===");
