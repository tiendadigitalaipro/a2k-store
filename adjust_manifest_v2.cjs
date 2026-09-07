// adjust_manifest_v2.cjs
// FASE 2.7: Genera PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json a partir del manifiesto V1
// y los informes forenses, SIN subir archivos ni modificar Storage/BD.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST_V1 = 'PRODUCT_MEDIA_UPLOAD_MANIFEST.json';
const FORENSIC_CAL = 'FORENSIC_CAL002_CAL003_REPORT.json';
const FORENSIC_RDC = 'FORENSIC_RDC001_REPORT.json';
const MANIFEST_V2 = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const manifest = loadJSON(MANIFEST_V1);
const forensicCal = loadJSON(FORENSIC_CAL);
const forensicRdc = loadJSON(FORENSIC_RDC);

// Construir conjuntos de decisión forense
const cal002Allowed = new Set(
  forensicCal.files
    .filter(f => f.visual_assessment === 'cloudtec')
    .map(f => f.filename)
);
const cal003Files = new Set(forensicCal.proposed_cal003_files);
const calvinFile = forensicRdc.filenames_with_calvin[0] || null;
const pumaFile = forensicRdc.filenames_ambiguous[0] || null;

// SKU/Slug para CAL-003
const CAL003_SKU = 'CAL-003';
const CAL003_NAME = 'Zapatilla deportiva running NOKA';
const CAL003_SLUG = 'zapatilla-running-noka';

const records = manifest.records.map(rec => {
  const r = { ...rec };

  if (r.product_sku === 'CAL-002') {
    if (cal003Files.has(r.filename)) {
      // Mover a CAL-003
      r.product_sku = CAL003_SKU;
      r.product_name = CAL003_NAME;
      r.product_slug = CAL003_SLUG;
      r.decision = 'APPROVED';
      r.reason = 'Imagen NOKA confirmada por revisión forense; asignada a CAL-003.';
    } else if (!cal002Allowed.has(r.filename)) {
      // Modelo no identificado como CloudTec ni NOKA
      r.decision = 'EXCLUDE_FORENSIC_QUARANTINE';
      r.reason = 'Modelo no identificado como CloudTec/CUUS DUUS ni NOKA; queda en cuarentena hasta revisión del proveedor.';
      r.is_main = false;
    }
  }

  if (r.product_sku === 'RDC-001') {
    if (calvinFile && r.filename === calvinFile) {
      r.decision = 'EXCLUDE_BRAND_VIOLATION';
      r.reason = 'Imagen con texto/logo "Calvin" protegido; descartada del catálogo por riesgo de propiedad intelectual.';
      r.is_main = false;
    } else if (pumaFile && r.filename === pumaFile) {
      r.decision = 'EXCLUDE_LEGAL_REVIEW';
      r.reason = 'Silueta de felino potencialmente similar a marca registrada; requiere revisión legal antes de publicar.';
      r.is_main = false;
    } else {
      r.decision = 'APPROVED';
      r.reason = 'Imagen válida para carga.';
    }
  }

  return r;
});

// Reasignar main y sort_order por SKU
const bySku = {};
for (const r of records) {
  if (!bySku[r.product_sku]) bySku[r.product_sku] = [];
  bySku[r.product_sku].push(r);
}

for (const sku of Object.keys(bySku)) {
  const skuRecords = bySku[sku];
  const approved = skuRecords.filter(r => r.decision === 'APPROVED');

  if (approved.length === 0) continue;

  // Ordenar: primero el main preexistente si está aprobado, luego por sort_order, luego por filename
  approved.sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.filename.localeCompare(b.filename);
  });

  // Asignar exactamente un main
  approved.forEach((r, idx) => {
    r.is_main = idx === 0;
    r.sort_order = idx;
    const base = r.product_slug;
    if (r.is_main) {
      r.storage_path = `products/${base}/main.jpg`;
    } else {
      const nn = String(idx).padStart(2, '0');
      r.storage_path = `products/${base}/gallery/${nn}.jpg`;
    }
  });
}

// Asignar storage_path a TODOS los registros (incluidos excluidos) para evitar colisiones y paths nulos
function safeFilename(filename) {
  return filename.replace(/\\/g, '_').replace(/\//g, '_');
}

const quarantineCounters = {};
for (const r of records) {
  if (r.decision === 'APPROVED' && r.storage_path) continue; // ya asignado arriba

  if (r.product_slug) {
    const key = r.product_slug;
    quarantineCounters[key] = (quarantineCounters[key] || 0) + 1;
    const nn = String(quarantineCounters[key]).padStart(2, '0');
    r.storage_path = `quarantine/${r.product_slug}/${nn}_${safeFilename(r.filename)}`;
  } else {
    quarantineCounters['unmapped'] = (quarantineCounters['unmapped'] || 0) + 1;
    const nn = String(quarantineCounters['unmapped']).padStart(2, '0');
    r.storage_path = `unmapped/${nn}_${safeFilename(r.filename)}`;
  }
}

// Validaciones
const approvedRecords = records.filter(r => r.decision === 'APPROVED');
const storagePathCounts = {};
for (const r of records) {
  storagePathCounts[r.storage_path] = (storagePathCounts[r.storage_path] || 0) + 1;
}
const duplicateStoragePaths = Object.entries(storagePathCounts)
  .filter(([p, c]) => c > 1)
  .map(([p, c]) => ({ storage_path: p, count: c }));

const mainBySku = {};
const sortOrdersBySku = {};
for (const r of records) {
  if (r.decision !== 'APPROVED') continue;
  if (r.is_main) mainBySku[r.product_sku] = (mainBySku[r.product_sku] || 0) + 1;
  if (!sortOrdersBySku[r.product_sku]) sortOrdersBySku[r.product_sku] = new Set();
  sortOrdersBySku[r.product_sku].add(r.sort_order);
}

const productsWithZeroMain = [];
const productsWithMultipleMains = [];
const productsWithDuplicateSortOrders = [];

for (const sku of Object.keys(bySku)) {
  const approvedCount = bySku[sku].filter(r => r.decision === 'APPROVED').length;
  if (approvedCount > 0) {
    if (!mainBySku[sku] || mainBySku[sku] === 0) productsWithZeroMain.push(sku);
    if (mainBySku[sku] > 1) productsWithMultipleMains.push(sku);
    const expectedOrders = new Set(Array.from({ length: approvedCount }, (_, i) => i));
    const actualOrders = sortOrdersBySku[sku];
    if (actualOrders.size !== approvedCount || ![...actualOrders].every(o => expectedOrders.has(o))) {
      productsWithDuplicateSortOrders.push(sku);
    }
  }
}

// Verificar SHA-256 de archivos aprobados (solo lectura)
let sha256Mismatches = 0;
for (const r of approvedRecords) {
  if (!fs.existsSync(r.source_path)) {
    r.sha256_verified = false;
    sha256Mismatches++;
    continue;
  }
  const currentHash = sha256File(r.source_path);
  if (currentHash !== r.sha256) {
    r.sha256_verified = false;
    sha256Mismatches++;
  } else {
    r.sha256_verified = true;
  }
}

// Resumen por SKU (excluyendo registros sin SKU asignado)
const perSkuSummary = {};
for (const sku of Object.keys(bySku).sort()) {
  if (sku === 'null' || sku === null) continue;
  const skuRecords = bySku[sku];
  const approved = skuRecords.filter(r => r.decision === 'APPROVED');
  perSkuSummary[sku] = {
    product_name: skuRecords[0]?.product_name || null,
    product_slug: skuRecords[0]?.product_slug || null,
    total_files: skuRecords.length,
    approved: approved.length,
    main: approved.find(r => r.is_main)?.filename || null,
    gallery: approved.filter(r => !r.is_main).map(r => r.filename),
    excluded_brand_violation: skuRecords.filter(r => r.decision === 'EXCLUDE_BRAND_VIOLATION').length,
    excluded_legal_review: skuRecords.filter(r => r.decision === 'EXCLUDE_LEGAL_REVIEW').length,
    excluded_forensic_quarantine: skuRecords.filter(r => r.decision === 'EXCLUDE_FORENSIC_QUARANTINE').length,
    excluded_other: skuRecords.filter(r =>
      r.decision !== 'APPROVED' &&
      r.decision !== 'EXCLUDE_BRAND_VIOLATION' &&
      r.decision !== 'EXCLUDE_LEGAL_REVIEW' &&
      r.decision !== 'EXCLUDE_FORENSIC_QUARANTINE'
    ).length
  };
}

// Conteos globales
const decisionCounts = {
  APPROVED: records.filter(r => r.decision === 'APPROVED').length,
  EXCLUDE_BRAND_VIOLATION: records.filter(r => r.decision === 'EXCLUDE_BRAND_VIOLATION').length,
  EXCLUDE_LEGAL_REVIEW: records.filter(r => r.decision === 'EXCLUDE_LEGAL_REVIEW').length,
  EXCLUDE_FORENSIC_QUARANTINE: records.filter(r => r.decision === 'EXCLUDE_FORENSIC_QUARANTINE').length,
  EXCLUDE_VIDEO: records.filter(r => r.decision === 'EXCLUDE_VIDEO').length,
  EXCLUDE_NO_PRODUCT: records.filter(r => r.decision === 'EXCLUDE_NO_PRODUCT').length,
  EXCLUDE_DUPLICATE_OR_UNMAPPED: records.filter(r => r.decision === 'EXCLUDE_DUPLICATE_OR_UNMAPPED').length,
  EXCLUDE_OTHER: records.filter(r =>
    !['APPROVED', 'EXCLUDE_BRAND_VIOLATION', 'EXCLUDE_LEGAL_REVIEW', 'EXCLUDE_FORENSIC_QUARANTINE', 'EXCLUDE_VIDEO', 'EXCLUDE_NO_PRODUCT', 'EXCLUDE_DUPLICATE_OR_UNMAPPED'].includes(r.decision)
  ).length
};

const skusWithApproved = new Set(approvedRecords.map(r => r.product_sku).filter(Boolean));
const productsWithoutMedia = Object.keys(bySku)
  .filter(sku => sku !== 'null' && sku !== null && !skusWithApproved.has(sku));

const manifestV2 = {
  generated_at: new Date().toISOString(),
  source_directory: manifest.source_directory,
  allowed_mime_types: manifest.allowed_mime_types,
  max_file_size_bytes: manifest.max_file_size_bytes,
  predecessor_manifest: MANIFEST_V1,
  summary: {
    total_physical_files: manifest.summary.total_physical_files,
    total_images: manifest.summary.total_images,
    total_videos: manifest.summary.total_videos,
    unique_image_hashes: manifest.summary.unique_image_hashes,
    unique_video_hashes: manifest.summary.unique_video_hashes,
    duplicate_groups: manifest.summary.duplicate_groups,
    duplicate_files: manifest.summary.duplicate_files,
    approved_for_upload: decisionCounts.APPROVED,
    excluded_brand_violation: decisionCounts.EXCLUDE_BRAND_VIOLATION,
    excluded_legal_review: decisionCounts.EXCLUDE_LEGAL_REVIEW,
    excluded_forensic_quarantine: decisionCounts.EXCLUDE_FORENSIC_QUARANTINE,
    excluded_video: decisionCounts.EXCLUDE_VIDEO,
    excluded_no_product: decisionCounts.EXCLUDE_NO_PRODUCT,
    excluded_duplicate_or_unmapped: decisionCounts.EXCLUDE_DUPLICATE_OR_UNMAPPED,
    excluded_other: decisionCounts.EXCLUDE_OTHER,
    products_with_media: skusWithApproved.size,
    products_without_media: productsWithoutMedia.length
  },
  validations: {
    total_files_in_manifest: records.length,
    duplicate_storage_paths: duplicateStoragePaths,
    products_with_zero_main: productsWithZeroMain,
    products_with_multiple_mains: productsWithMultipleMains,
    products_with_duplicate_sort_orders: productsWithDuplicateSortOrders,
    sha256_mismatches: sha256Mismatches
  },
  per_sku_summary: perSkuSummary,
  records: records
};

saveJSON(MANIFEST_V2, manifestV2);

console.log('PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json generado.');
console.log('Resumen de decisiones:', decisionCounts);
console.log('Productos con medios:', skusWithApproved.size);
console.log('Productos sin medios:', productsWithoutMedia.length, productsWithoutMedia);
console.log('Validaciones:');
console.log('  duplicate_storage_paths:', duplicateStoragePaths.length);
console.log('  products_with_zero_main:', productsWithZeroMain);
console.log('  products_with_multiple_mains:', productsWithMultipleMains);
console.log('  products_with_duplicate_sort_orders:', productsWithDuplicateSortOrders);
console.log('  sha256_mismatches:', sha256Mismatches);
