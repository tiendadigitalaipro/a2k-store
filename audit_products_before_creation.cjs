// audit_products_before_creation.cjs
// FASE 2.9: Auditoría de productos antes de crearlos. Solo lectura.

const fs = require('fs');

const MANIFEST = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';
const CATEGORIES_SNAPSHOT = 'categories_snapshot.json';
const PRODUCTS_SNAPSHOT = 'products_snapshot.json';
const REPORT = 'PRODUCT_CREATION_AUDIT_REPORT.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const manifest = loadJSON(MANIFEST);
const categories = loadJSON(CATEGORIES_SNAPSHOT);
const products = loadJSON(PRODUCTS_SNAPSHOT);

const definitiveCategorySlugs = new Set([
  'calzados',
  'cocina',
  'hogar',
  'repuestos-y-accesorios',
  'ropa-para-ninos',
  'ropa-deportiva-caballeros',
  'electronica'
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

// 7 categorías definitivas
const definitiveCategories = categories.filter(c => definitiveCategorySlugs.has(c.slug));
const missingDefinitiveCategories = [...definitiveCategorySlugs].filter(slug => !categories.some(c => c.slug === slug));

// Mapeo slug -> category_id
const categoryBySlug = {};
for (const c of categories) {
  categoryBySlug[c.slug] = c;
}

// Productos existentes por SKU y slug
const existingBySku = {};
const existingBySlug = {};
for (const p of products) {
  existingBySku[p.sku] = p;
  existingBySlug[p.slug] = p;
}

// SKU propuestos
const proposedSkus = Object.keys(skuToCategorySlug);

// Agrupar manifiesto por SKU
const manifestBySku = {};
for (const r of manifest.records) {
  if (r.decision !== 'APPROVED') continue;
  if (!manifestBySku[r.product_sku]) {
    manifestBySku[r.product_sku] = {
      product_name: r.product_name,
      product_slug: r.product_slug,
      main: null,
      gallery_count: 0
    };
  }
  if (r.is_main) manifestBySku[r.product_sku].main = r.filename;
  else manifestBySku[r.product_sku].gallery_count++;
}

const skuReport = proposedSkus.map(sku => {
  const info = manifestBySku[sku] || { product_name: null, product_slug: null, main: null, gallery_count: 0 };
  const categorySlug = skuToCategorySlug[sku];
  const category = categoryBySlug[categorySlug];
  const existingBySkuMatch = existingBySku[sku];
  const existingBySlugMatch = existingBySlug[info.product_slug];

  const conflicts = [];
  if (existingBySkuMatch) {
    conflicts.push(`SKU ${sku} ya existe (product_id: ${existingBySkuMatch.id}, name: ${existingBySkuMatch.name}).`);
  }
  if (existingBySlugMatch && existingBySlugMatch.sku !== sku) {
    conflicts.push(`Slug ${info.product_slug} ya está usado por SKU ${existingBySlugMatch.sku}.`);
  }

  return {
    sku,
    product_name_proposed: info.product_name,
    slug_proposed: info.product_slug,
    category_name: category ? category.name : null,
    category_slug: categorySlug,
    category_id: category ? category.id : null,
    product_exists: !!existingBySkuMatch,
    product_id: existingBySkuMatch ? existingBySkuMatch.id : null,
    needs_creation: !existingBySkuMatch,
    conflicts,
    media_main: info.main,
    media_gallery_count: info.gallery_count
  };
});

// Productos demo que podrían confundirse
const demoProductsInDefinitiveCategories = products.filter(p => {
  const cat = categories.find(c => c.id === p.category_id);
  return cat && definitiveCategorySlugs.has(cat.slug);
});

// Conflictos globales
const globalConflicts = [];
for (const row of skuReport) {
  for (const c of row.conflicts) globalConflicts.push(c);
}

// Slugs y SKUs ya usados
const usedSlugs = products.map(p => p.slug);
const usedSkus = products.map(p => p.sku);

// Campos mínimos requeridos (basado en information_schema)
const requiredFields = [
  { field: 'name', has_value: true, note: 'Provisto en el manifiesto.' },
  { field: 'slug', has_value: true, note: 'Provisto en el manifiesto.' },
  { field: 'sku', has_value: true, note: 'Provisto en el manifiesto.' },
  { field: 'category_id', has_value: true, note: 'Asignable desde categorías definitivas.' },
  { field: 'status', has_value: false, note: 'Requerido (enum). Valor sugerido: active. No inventado.' },
  { field: 'price', has_value: false, note: 'Requerido (numeric). FALTA: no inventar precio.' },
  { field: 'currency', has_value: false, note: 'Requerido (text). Valor probable: USD. Confirmar.' },
  { field: 'stock', has_value: false, note: 'Requerido (integer). FALTA: no inventar stock.' },
  { field: 'stock_reserved', has_value: false, note: 'Requerido (integer). Valor inicial sugerido: 0.' },
  { field: 'stock_minimum', has_value: false, note: 'Requerido (integer). Valor inicial sugerido: 0.' },
  { field: 'is_featured', has_value: false, note: 'Requerido (boolean). Valor inicial sugerido: false.' },
  { field: 'is_new', has_value: false, note: 'Requerido (boolean). Valor inicial sugerido: true.' }
];

const report = {
  generated_at: new Date().toISOString(),
  definitive_categories: {
    count: definitiveCategories.length,
    expected: 7,
    missing: missingDefinitiveCategories,
    categories: definitiveCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug, sort_order: c.sort_order }))
  },
  existing_products_count: products.length,
  existing_products_demo: products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_name: categories.find(c => c.id === p.category_id)?.name || null
  })),
  sku_report: skuReport,
  global_conflicts: globalConflicts,
  demo_products_in_definitive_categories: demoProductsInDefinitiveCategories,
  required_fields_for_creation: requiredFields,
  summary: {
    proposed_skus: proposedSkus.length,
    existing_skus_matching: proposedSkus.filter(sku => !!existingBySku[sku]).length,
    new_skus_needed: proposedSkus.filter(sku => !existingBySku[sku]).length,
    slugs_already_used: proposedSkus.filter(sku => {
      const info = manifestBySku[sku];
      return info && !!existingBySlug[info.product_slug];
    }).length,
    definitive_categories_present: definitiveCategories.length,
    demo_categories_present: categories.length - definitiveCategories.length
  }
};

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf8');

console.log('=== AUDITORÍA DE PRODUCTOS ANTES DE CREACIÓN ===');
console.log('Categorías definitivas presentes:', report.definitive_categories.count, '/ 7');
console.log('Productos existentes:', report.existing_products_count);
console.log('SKUs propuestos:', report.summary.proposed_skus);
console.log('SKUs ya existentes:', report.summary.existing_skus_matching);
console.log('SKUs nuevos requeridos:', report.summary.new_skus_needed);
console.log('Conflictos globales:', globalConflicts.length);
if (globalConflicts.length > 0) {
  globalConflicts.forEach(c => console.log(' -', c));
}
console.log('\nReporte guardado en', REPORT);
