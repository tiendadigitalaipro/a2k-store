// create_real_products_js.cjs
// Crear los 16 productos reales en Supabase usando el cliente JS.
// NO crea productos si ya existen. Verifica post-creacion.

const fs = require('fs');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const PLAN = 'PRODUCT_CREATION_PLAN.json';
const REPORT = 'PRODUCT_CREATION_REPORT.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

function getSupabaseCredentials() {
  const projectsOutput = execSync('npx supabase projects list --output json', { encoding: 'utf8' });
  const projects = JSON.parse(projectsOutput);
  const project = projects.find(p => p.linked === true);
  if (!project) throw new Error('No se encontro proyecto linked');

  const url = `https://${project.ref}.supabase.co`;
  const keysOutput = execSync(`npx supabase projects api-keys --project-ref ${project.ref} --output json`, { encoding: 'utf8' });
  const keys = JSON.parse(keysOutput);
  const serviceKey = keys.find(k => k.name === 'service_role')?.api_key;
  if (!serviceKey) throw new Error('No se encontro service_role key');

  return { url, serviceKey };
}

const plan = loadJSON(PLAN);
const skus = plan.products.map(p => p.sku);

const { url, serviceKey } = getSupabaseCredentials();
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // 1. Verificar que los SKU no existen
  const { data: existing, error: checkError } = await supabase
    .from('products')
    .select('sku')
    .in('sku', skus);

  if (checkError) {
    console.error('ERROR al verificar SKU existentes:', checkError);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.error('ERROR: Los siguientes SKU ya existen:', existing.map(p => p.sku).join(', '));
    process.exit(1);
  }

  console.log('✅ Verificacion previa: ninguno de los 16 SKU existe.');

  // 2. Insertar productos
  const insertData = plan.products.map(p => ({
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category_id: p.category_id,
    status: 'inactive',
    price: p.price,
    currency: 'USD',
    stock: 10,
    stock_reserved: 0,
    stock_minimum: 0,
    max_per_order: null,
    cost: null,
    compare_at_price: null,
    is_featured: false,
    is_new: true,
    description: null,
    short_description: null,
    brand_id: null,
    subcategory_id: null,
    tags: null,
    seo_title: null,
    seo_description: null,
    weight: null
  }));

  const { data: created, error: insertError } = await supabase
    .from('products')
    .insert(insertData)
    .select('id, sku, name, slug, category_id, status, price, currency, stock, stock_reserved, is_featured, is_new, cost, compare_at_price');

  if (insertError) {
    console.error('ERROR durante INSERT:', insertError);
    process.exit(1);
  }

  console.log(`✅ Productos creados: ${created.length}/16`);

  // 3. Verificacion post-creacion
  const { data: verified, error: verifyError } = await supabase
    .from('products')
    .select('id, sku, name, slug, category_id, status, price, currency, stock, stock_reserved, is_featured, is_new, cost, compare_at_price')
    .in('sku', skus)
    .order('sku', { ascending: true });

  if (verifyError) {
    console.error('ERROR en verificacion post-creacion:', verifyError);
    process.exit(1);
  }

  const createdSkus = new Set(verified.map(p => p.sku));
  const missingSkus = skus.filter(s => !createdSkus.has(s));
  const duplicateSkus = verified.length !== createdSkus.size;
  const wrongStatus = verified.filter(p => p.status !== 'inactive');
  const wrongStock = verified.filter(p => p.stock !== 10 || p.stock_reserved !== 0);
  const wrongPrice = [];
  for (const p of verified) {
    const planned = plan.products.find(pp => pp.sku === p.sku);
    if (planned && parseFloat(p.price) !== planned.price) wrongPrice.push(p.sku);
  }

  const { data: imagesData, error: imagesError } = await supabase
    .from('product_images')
    .select('id, product_id', { count: 'exact', head: true })
    .in('product_id', verified.map(p => p.id));

  if (imagesError) {
    console.error('ERROR al verificar product_images:', imagesError);
    process.exit(1);
  }

  const imagesCount = imagesData ? imagesData.length : 0;

  const report = {
    created_at: new Date().toISOString(),
    total_created: verified.length,
    expected: 16,
    missing_skus: missingSkus,
    duplicate_skus_detected: duplicateSkus,
    wrong_status_count: wrongStatus.length,
    wrong_stock_count: wrongStock.length,
    wrong_price_count: wrongPrice.length,
    product_images_created: imagesCount,
    validations: {
      all_16_created: verified.length === 16,
      unique_skus: !duplicateSkus,
      no_missing: missingSkus.length === 0,
      correct_categories: verified.every(p => p.category_id === plan.products.find(pp => pp.sku === p.sku)?.category_id),
      correct_prices: wrongPrice.length === 0,
      correct_stock: wrongStock.length === 0,
      all_inactive: wrongStatus.length === 0,
      no_product_images: imagesCount === 0
    },
    products: verified
  };

  saveJSON(REPORT, report);

  console.log('\n=== VERIFICACION POST-CREACION ===');
  console.log('Creados:', verified.length, '/ 16');
  console.log('Faltantes:', missingSkus.length);
  console.log('Duplicados:', duplicateSkus ? 'SI' : 'NO');
  console.log('Status incorrecto:', wrongStatus.length);
  console.log('Stock incorrecto:', wrongStock.length);
  console.log('Precio incorrecto:', wrongPrice.length);
  console.log('product_images creadas:', imagesCount);

  console.log('\nTabla final:');
  console.table(verified.map(p => ({
    SKU: p.sku,
    product_id: p.id,
    Producto: p.name,
    Categoria: p.category_id,
    Precio: p.price,
    Currency: p.currency,
    Stock: p.stock,
    Stock_reserved: p.stock_reserved,
    Status: p.status,
    is_new: p.is_new,
    is_featured: p.is_featured,
    Cost: p.cost,
    Compare_at_price: p.compare_at_price
  })));

  console.log(`\nReporte guardado en ${REPORT}`);
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
