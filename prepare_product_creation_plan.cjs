// prepare_product_creation_plan.cjs
// FASE 2.11: Preparar plan de creacion de 16 productos reales SIN INSERTAR.

const fs = require('fs');

const MANIFEST = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';
const CATEGORIES = 'categories_snapshot.json';
const PRODUCTS = 'products_snapshot.json';
const COMMERCIAL = 'COMMERCIAL_DATA_TEMPLATE.json';
const PLAN = 'PRODUCT_CREATION_PLAN.json';
const PRECHECK = 'PRODUCT_CREATION_PRECHECK.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const manifest = loadJSON(MANIFEST);
const categories = loadJSON(CATEGORIES);
const products = loadJSON(PRODUCTS);
const commercial = loadJSON(COMMERCIAL);

const definitiveCategorySlugs = new Set([
  'calzados', 'cocina', 'hogar', 'repuestos-y-accesorios',
  'ropa-para-ninos', 'ropa-deportiva-caballeros', 'electronica'
]);

const skuToCategorySlug = {
  'CAL-001': 'calzados',
  'CAL-002': 'calzados',
  'CAL-003': 'calzados',
  'ELE-001': 'electronica',
  'ELE-002': 'electronica',
  'ELE-003': 'electronica',
  'ELE-004': 'electronica',
  'ELE-005': 'electronica',
  'HOG-001': 'hogar',
  'HOG-002': 'hogar',
  'HOG-003': 'hogar',
  'RDC-001': 'ropa-deportiva-caballeros',
  'RDC-002': 'ropa-deportiva-caballeros',
  'REP-001': 'repuestos-y-accesorios',
  'RPN-001': 'ropa-para-ninos',
  'RPN-002': 'ropa-para-ninos'
};

const categoryBySlug = {};
for (const c of categories) categoryBySlug[c.slug] = c;

const existingBySku = {};
const existingBySlug = {};
for (const p of products) {
  existingBySku[p.sku] = p;
  existingBySlug[p.slug] = p;
}

const commercialBySku = {};
for (const r of commercial.rows) commercialBySku[r.sku] = r;

const mediaBySku = {};
for (const r of manifest.records) {
  if (r.decision !== 'APPROVED') continue;
  if (!mediaBySku[r.product_sku]) mediaBySku[r.product_sku] = [];
  mediaBySku[r.product_sku].push(r);
}

const skus = Object.keys(skuToCategorySlug).sort();

const planRows = [];
const issues = [];

for (const sku of skus) {
  const categorySlug = skuToCategorySlug[sku];
  const category = categoryBySlug[categorySlug];
  const comm = commercialBySku[sku];
  const media = mediaBySku[sku] || [];

  if (!category) {
    issues.push(`SKU ${sku}: categoria ${categorySlug} no encontrada.`);
  }
  if (existingBySku[sku]) {
    issues.push(`SKU ${sku}: ya existe en products.`);
  }
  if (existingBySlug[comm?.slug]) {
    issues.push(`SKU ${sku}: slug ${comm?.slug} ya existe.`);
  }
  if (media.length === 0) {
    issues.push(`SKU ${sku}: no tiene media aprobada.`);
  }
  if (!definitiveCategorySlugs.has(categorySlug)) {
    issues.push(`SKU ${sku}: categoria ${categorySlug} no es definitiva.`);
  }

  planRows.push({
    sku,
    name: comm?.product || null,
    slug: comm?.slug || null,
    category_id: category ? category.id : null,
    category_name: category ? category.name : null,
    description: null,
    short_description: null,
    price: null,
    stock: null,
    currency: 'USD',
    status: 'draft',
    stock_reserved: 0,
    stock_minimum: 0,
    max_per_order: null,
    cost: null,
    compare_at_price: null,
    is_new: true,
    is_featured: false,
    tags: null,
    seo_title: null,
    seo_description: null,
    media_count: media.length,
    media_main: media.find(r => r.is_main)?.storage_path || null
  });
}

const precheck = {
  generated_at: new Date().toISOString(),
  total_skus: skus.length,
  definitive_categories: [...definitiveCategorySlugs].length,
  skus_with_conflict: issues.filter(i => i.includes('ya existe')).length,
  skus_existing_in_products: skus.filter(sku => !!existingBySku[sku]).length,
  skus_without_category: skus.filter(sku => !categoryBySlug[skuToCategorySlug[sku]]).length,
  skus_without_approved_media: skus.filter(sku => !mediaBySku[sku] || mediaBySku[sku].length === 0).length,
  products_ready_for_creation: skus.filter(sku =>
    !existingBySku[sku] &&
    !existingBySlug[commercialBySku[sku]?.slug] &&
    categoryBySlug[skuToCategorySlug[sku]] &&
    mediaBySku[sku]?.length > 0
  ).length,
  price_pending: skus.length,
  stock_pending: skus.length,
  issues
};

const plan = {
  generated_at: new Date().toISOString(),
  note: 'Plan de creacion de 16 productos reales. NO ejecutar INSERT todavia. Precio y stock estan pendientes de definir por el usuario.',
  products: planRows
};

fs.writeFileSync(PLAN, JSON.stringify(plan, null, 2), 'utf8');
fs.writeFileSync(PRECHECK, JSON.stringify(precheck, null, 2), 'utf8');

console.log('=== PRODUCT CREATION PLAN ===');
console.log('Total SKUs:', skus.length);
console.log('Listos para creacion:', precheck.products_ready_for_creation);
console.log('Conflictos:', issues.length);
if (issues.length > 0) issues.forEach(i => console.log(' -', i));
console.log('\nTabla resumen:');
console.table(planRows.map(r => ({
  SKU: r.sku,
  Producto: r.name,
  Categoria: r.category_name,
  Precio: 'PENDIENTE_DEFINIR',
  Stock: 'PENDIENTE_DEFINIR',
  'Media aprobada': r.media_count,
  'Listo para INSERT': r.media_count > 0 && !existingBySku[r.sku] && !existingBySlug[r.slug] ? 'SI' : 'NO'
})));
console.log(`\nArchivos generados: ${PLAN}, ${PRECHECK}`);
