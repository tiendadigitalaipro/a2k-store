// update_electronics_prices.cjs
// FASE 2.11b: Completar precios parciales de electronica en PRODUCT_CREATION_PLAN.json
// NO crea productos, NO ejecuta INSERT.

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

const priceUpdates = {
  // ELE-001 se mantiene pendiente
  'ELE-002': 19.64,
  'ELE-003': 11.36,
  'ELE-004': 10.45,
  'ELE-005': 10.00
};

let updatedCount = 0;
for (const product of plan.products) {
  if (priceUpdates[product.sku] !== undefined) {
    product.price = priceUpdates[product.sku];
    updatedCount++;
  }
}

plan.updated_at = new Date().toISOString();
plan.note = `${plan.note || ''} Precios de electronica actualizados parcialmente: ELE-002 (19.64), ELE-003 (11.36), ELE-004 (10.45), ELE-005 (10.00). ELE-001 permanece pendiente. Stock pendiente para todos.`;

// Actualizar precheck
const pendingPrices = plan.products.filter(p => p.price === null).length;
const pendingStock = plan.products.filter(p => p.stock === null).length;
precheck.price_pending = pendingPrices;
precheck.stock_pending = pendingStock;
precheck.updated_at = new Date().toISOString();

saveJSON(PLAN, plan);
saveJSON(PRECHECK, precheck);

console.log('Precios actualizados:', updatedCount);
console.log('Precios pendientes:', pendingPrices);
console.log('Stock pendiente:', pendingStock);
console.log('\nResumen electronica:');
console.table(plan.products
  .filter(p => p.sku.startsWith('ELE'))
  .map(p => ({
    SKU: p.sku,
    Producto: p.name,
    Precio: p.price === null ? 'PENDIENTE_DEFINIR' : p.price,
    Stock: p.stock === null ? 'PENDIENTE_DEFINIR' : p.stock,
    Currency: p.currency,
    Status: p.status
  }))
);
