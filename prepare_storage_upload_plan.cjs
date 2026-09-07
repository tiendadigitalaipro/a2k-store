// prepare_storage_upload_plan.cjs
// FASE 2.12: Preparar plan de carga de 169 imagenes a Storage + product_images.
// NO sube imagenes, NO inserta registros.

const fs = require('fs');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const MANIFEST = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';
const CREATION_REPORT = 'PRODUCT_CREATION_REPORT.json';
const UPLOAD_PLAN = 'STORAGE_UPLOAD_PLAN.json';

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

const manifest = loadJSON(MANIFEST);
const creationReport = loadJSON(CREATION_REPORT);

const approvedRecords = manifest.records.filter(r => r.decision === 'APPROVED');
const skusInManifest = [...new Set(approvedRecords.map(r => r.product_sku))].sort();

const { url, serviceKey } = getSupabaseCredentials();
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // A) Verificar manifest
  const manifestChecks = {
    total_approved: approvedRecords.length,
    expected_approved: 169,
    total_skus: skusInManifest.length,
    expected_skus: 16,
    one_main_per_sku: true,
    unique_sort_order_per_sku: true,
    no_quarantine: approvedRecords.every(r => r.decision === 'APPROVED'),
    no_videos: approvedRecords.every(r => !r.mime_type.startsWith('video/')),
    no_null_sku: approvedRecords.every(r => !!r.product_sku),
    skus_match_real_products: skusInManifest.every(sku => creationReport.products.some(p => p.sku === sku))
  };

  const mainBySku = {};
  const sortOrdersBySku = {};
  for (const r of approvedRecords) {
    if (!mainBySku[r.product_sku]) mainBySku[r.product_sku] = 0;
    if (!sortOrdersBySku[r.product_sku]) sortOrdersBySku[r.product_sku] = new Set();
    if (r.is_main) mainBySku[r.product_sku]++;
    sortOrdersBySku[r.product_sku].add(r.sort_order);
  }

  for (const sku of skusInManifest) {
    if (mainBySku[sku] !== 1) manifestChecks.one_main_per_sku = false;
    const skuRecords = approvedRecords.filter(r => r.product_sku === sku);
    if (sortOrdersBySku[sku].size !== skuRecords.length) manifestChecks.unique_sort_order_per_sku = false;
  }

  // B) Consultar productos reales
  const realSkus = creationReport.products.map(p => p.sku);
  const { data: dbProducts, error: dbError } = await supabase
    .from('products')
    .select('id, sku, name, status')
    .in('sku', realSkus)
    .order('sku', { ascending: true });

  if (dbError) throw dbError;

  const productChecks = {
    total_in_db: dbProducts.length,
    expected: 16,
    all_inactive: dbProducts.every(p => p.status === 'inactive'),
    unique_skus: new Set(dbProducts.map(p => p.sku)).size === dbProducts.length,
    sku_match_manifest: dbProducts.every(p => skusInManifest.includes(p.sku))
  };

  // Verificar product_images existentes
  const productIds = dbProducts.map(p => p.id);
  const { data: existingImages, error: imagesError, count } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .in('product_id', productIds);

  if (imagesError) throw imagesError;
  const existingImagesCount = count || 0;

  // C) Verificar bucket
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) throw bucketsError;
  const productsBucket = buckets.find(b => b.name === 'products');

  const bucketChecks = {
    exists: !!productsBucket,
    public: productsBucket?.public || false,
    file_size_limit: productsBucket?.file_size_limit || null,
    allowed_mime_types: productsBucket?.allowed_mime_types || []
  };

  // Mapeo SKU -> product_id
  const skuToProductId = {};
  for (const p of dbProducts) skuToProductId[p.sku] = p.id;

  // E) Generar plan de upload
  const uploadPlan = approvedRecords.map(r => {
    const product = dbProducts.find(p => p.sku === r.product_sku);
    return {
      sku: r.product_sku,
      product_id: product ? product.id : null,
      product_name: r.product_name,
      source_path: r.source_path,
      storage_path: r.storage_path,
      image_role: r.is_main ? 'main' : 'gallery',
      sort_order: r.sort_order,
      mime_type: r.mime_type,
      file_size: r.file_size_bytes,
      sha256: r.sha256
    };
  });

  // Verificar rutas duplicadas
  const pathCounts = {};
  for (const item of uploadPlan) {
    pathCounts[item.storage_path] = (pathCounts[item.storage_path] || 0) + 1;
  }
  const duplicatePaths = Object.entries(pathCounts).filter(([p, c]) => c > 1).map(([p, c]) => ({ path: p, count: c }));

  const invalidItems = uploadPlan.filter(item =>
    !item.product_id ||
    !item.source_path ||
    !item.storage_path ||
    !item.mime_type ||
    item.file_size > 10485760
  );

  const summaryBySku = skusInManifest.map(sku => {
    const product = dbProducts.find(p => p.sku === sku);
    const items = uploadPlan.filter(i => i.sku === sku);
    const main = items.find(i => i.image_role === 'main');
    const gallery = items.filter(i => i.image_role === 'gallery');
    return {
      sku,
      product_id: product ? product.id : null,
      product_name: product ? product.name : null,
      main: main ? main.storage_path : null,
      gallery_count: gallery.length,
      total: items.length,
      status: product ? product.status : null
    };
  });

  const planOutput = {
    generated_at: new Date().toISOString(),
    manifest_checks: manifestChecks,
    product_checks: productChecks,
    existing_product_images: existingImagesCount,
    bucket_checks: bucketChecks,
    duplicate_storage_paths: duplicatePaths,
    invalid_items_count: invalidItems.length,
    total_images_ready: uploadPlan.length,
    total_main_images: uploadPlan.filter(i => i.image_role === 'main').length,
    total_gallery_images: uploadPlan.filter(i => i.image_role === 'gallery').length,
    summary_by_sku: summaryBySku,
    uploads: uploadPlan
  };

  saveJSON(UPLOAD_PLAN, planOutput);

  console.log('=== PREPARACION STORAGE UPLOAD ===');
  console.log('Manifest checks:', manifestChecks);
  console.log('Product checks:', productChecks);
  console.log('Existing product_images:', existingImagesCount);
  console.log('Bucket checks:', bucketChecks);
  console.log('Duplicate storage paths:', duplicatePaths.length);
  console.log('Invalid items:', invalidItems.length);
  console.log('Total images ready:', uploadPlan.length);
  console.log('Total main:', planOutput.total_main_images);
  console.log('Total gallery:', planOutput.total_gallery_images);
  console.log('\nResumen por SKU:');
  console.table(summaryBySku);

  if (duplicatePaths.length > 0) {
    console.log('\nRutas duplicadas:');
    duplicatePaths.forEach(d => console.log(' -', d.path, `(${d.count})`));
  }

  console.log(`\nPlan guardado en ${UPLOAD_PLAN}`);
}

main().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
