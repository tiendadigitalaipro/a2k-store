// complete_market_prices.cjs
// FASE 2.11c: Completar precios estimados de mercado para SKUs faltantes.
// NO crea productos, NO ejecuta INSERT. Los precios son editables posteriormente.

const fs = require('fs');

const PLAN = 'PRODUCT_CREATION_PLAN.json';
const PRECHECK = 'PRODUCT_CREATION_PRECHECK.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

const plan = loadJSON(PLAN);
const precheck = loadJSON(PRECHECK);

// Precios estimados de mercado para productos genéricos importados/catálogo (USD)
// Estos valores son aproximaciones conservadoras y deben revisarse/ajustarse manualmente.
const estimatedPrices = {
  'CAL-001': 25.00,
  'CAL-002': 28.00,
  'CAL-003': 26.00,
  'ELE-001': 35.00,
  'HOG-001': 32.00,
  'HOG-002': 12.00,
  'HOG-003': 8.00,
  'RDC-001': 9.50,
  'RDC-002': 14.00,
  'REP-001': 15.00,
  'RPN-001': 11.00,
  'RPN-002': 11.00
};

let updatedCount = 0;
for (const product of plan.products) {
  if (product.price === null && estimatedPrices[product.sku] !== undefined) {
    product.price = estimatedPrices[product.sku];
    product.price_note = 'Precio estimado de mercado inicial. Editable manualmente despues de la creacion.';
    updatedCount++;
  }
}

plan.updated_at = new Date().toISOString();
plan.note = `${plan.note || ''} Precios estimados de mercado completados para ${updatedCount} SKUs faltantes. ELE-002/003/004/005 mantienen precios reales proporcionados. Cost = NULL. Stock pendiente.`;

const pendingPrices = plan.products.filter(p => p.price === null).length;
const pendingStock = plan.products.filter(p => p.stock === null).length;
precheck.price_pending = pendingPrices;
precheck.stock_pending = pendingStock;
precheck.updated_at = new Date().toISOString();

saveJSON(PLAN, plan);
saveJSON(PRECHECK, precheck);

console.log('Precios estimados aplicados:', updatedCount);
console.log('Precios pendientes:', pendingPrices);
console.log('Stock pendiente:', pendingStock);
console.log('\nResumen completo de precios:');
console.table(plan.products.map(p => ({
  SKU: p.sku,
  Producto: p.name,
  'Precio USD': p.price === null ? 'PENDIENTE' : p.price,
  'Tipo precio': p.price_note?.includes('estimado') ? 'ESTIMADO' : (p.price === null ? 'PENDIENTE' : 'REAL'),
  Stock: p.stock === null ? 'PENDIENTE' : p.stock,
  Status: p.status
})));
