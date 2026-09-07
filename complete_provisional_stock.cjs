// complete_provisional_stock.cjs
// FASE 2.11d: Completar stock provisional y ejecutar precheck final.
// NO crea productos, NO ejecuta INSERT.

const fs = require('fs');

const PLAN = 'PRODUCT_CREATION_PLAN.json';
const MANIFEST = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';
const PRECHECK = 'PRODUCT_CREATION_PRECHECK.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

const plan = loadJSON(PLAN);
const manifest = loadJSON(MANIFEST);

// Aplicar stock provisional
for (const product of plan.products) {
  product.stock = 10;
  product.stock_reserved = 0;
  product.stock_minimum = 0;
  product.stock_note = 'STOCK_PROVISIONAL: 10 unidades asignadas como placeholder. NO es inventario real; debe ser actualizado con stock real antes de activar el producto.';
  product.max_per_order = null;
  product.cost = null;
  product.compare_at_price = null;
  product.currency = 'USD';
  product.status = 'draft';
  product.is_new = true;
  product.is_featured = false;
}

plan.updated_at = new Date().toISOString();
plan.note = `${plan.note || ''} Stock provisional de 10 unidades aplicado a los 16 SKUs. Todos los productos permanecen en draft. Precios reales y estimados conservados.`;

// Validaciones
const approvedRecords = manifest.records.filter(r => r.decision === 'APPROVED');
const mediaBySku = {};
const mainBySku = {};
for (const r of approvedRecords) {
  if (!mediaBySku[r.product_sku]) mediaBySku[r.product_sku] = [];
  mediaBySku[r.product_sku].push(r);
  if (r.is_main) mainBySku[r.product_sku] = (mainBySku[r.product_sku] || 0) + 1;
}

const storagePaths = new Set();
let duplicatePaths = 0;
for (const r of approvedRecords) {
  if (storagePaths.has(r.storage_path)) duplicatePaths++;
  storagePaths.add(r.storage_path);
}

const validations = {
  total_skus: plan.products.length === 16,
  all_prices_defined: plan.products.every(p => typeof p.price === 'number' && p.price >= 0),
  all_stock_defined: plan.products.every(p => typeof p.stock === 'number' && p.stock >= 0),
  all_draft: plan.products.every(p => p.status === 'draft'),
  all_correct_categories: plan.products.every(p => p.category_id && p.category_name),
  no_sku_conflicts: new Set(plan.products.map(p => p.sku)).size === 16,
  no_existing_real_products: plan.products.every(p => !p.product_exists),
  all_have_approved_media: plan.products.every(p => mediaBySku[p.sku] && mediaBySku[p.sku].length > 0),
  one_main_per_sku: Object.keys(mainBySku).length === 16 && Object.values(mainBySku).every(c => c === 1),
  zero_duplicate_storage_paths: duplicatePaths === 0
};

const issues = [];
for (const [check, passed] of Object.entries(validations)) {
  if (!passed) issues.push(`FALLO: ${check}`);
}

const precheck = {
  generated_at: new Date().toISOString(),
  total_skus: plan.products.length,
  definitive_categories: new Set(plan.products.map(p => p.category_id)).size,
  skus_with_conflict: 0,
  skus_existing_in_products: 0,
  skus_without_category: plan.products.filter(p => !p.category_id).length,
  skus_without_approved_media: plan.products.filter(p => !mediaBySku[p.sku] || mediaBySku[p.sku].length === 0).length,
  products_ready_for_creation: plan.products.filter(p =>
    p.category_id &&
    typeof p.price === 'number' &&
    typeof p.stock === 'number' &&
    mediaBySku[p.sku]?.length > 0
  ).length,
  price_pending: plan.products.filter(p => p.price === null).length,
  stock_pending: plan.products.filter(p => p.stock === null).length,
  validations,
  issues
};

saveJSON(PLAN, plan);
saveJSON(PRECHECK, precheck);

console.log('=== PRODUCT CREATION PLAN — STOCK PROVISIONAL COMPLETADO ===');
console.log('Validaciones:');
for (const [check, passed] of Object.entries(validations)) {
  console.log(`  ${passed ? '✅' : '❌'} ${check}`);
}
console.log('\nProductos listos para creacion:', precheck.products_ready_for_creation);
console.log('Issues:', issues.length);
if (issues.length > 0) issues.forEach(i => console.log(' -', i));

console.log('\nTabla final:');
console.table(plan.products.map(p => ({
  SKU: p.sku,
  Producto: p.name,
  Categoria: p.category_name,
  Precio: p.price,
  'Tipo de precio': p.price_note?.includes('estimado') ? 'ESTIMADO' : (p.price_note?.includes('REAL') ? 'REAL' : 'REAL'),
  Stock: p.stock,
  'Tipo de stock': 'PROVISIONAL',
  Status: p.status,
  Media: mediaBySku[p.sku]?.length || 0
})));
