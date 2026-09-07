// preflight_upload.cjs
// FASE 2.8: Validación final antes de upload. Solo lectura del manifiesto V2.

const fs = require('fs');

const MANIFEST = 'PRODUCT_MEDIA_UPLOAD_MANIFEST_V2.json';
const FORENSIC_CAL = 'FORENSIC_CAL002_CAL003_REPORT.json';
const FORENSIC_RDC = 'FORENSIC_RDC001_REPORT.json';
const REPORT = 'PREFLIGHT_UPLOAD_REPORT.json';

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const manifest = loadJSON(MANIFEST);
const forensicCal = loadJSON(FORENSIC_CAL);
const forensicRdc = loadJSON(FORENSIC_RDC);

const records = manifest.records;
const approved = records.filter(r => r.decision === 'APPROVED');

// Conjuntos forenses
const cal002Allowed = new Set(
  forensicCal.files
    .filter(f => f.visual_assessment === 'cloudtec')
    .map(f => f.filename)
);
const cal003Files = new Set(forensicCal.proposed_cal003_files);
const calvinFile = forensicRdc.filenames_with_calvin[0] || null;
const pumaFile = forensicRdc.filenames_ambiguous[0] || null;
const quarantineFiles = new Set(
  records
    .filter(r => r.decision === 'EXCLUDE_FORENSIC_QUARANTINE')
    .map(r => r.filename)
);

const allowedMimeTypes = new Set(manifest.allowed_mime_types);
const maxSize = manifest.max_file_size_bytes;

const issues = [];

// 1. Exactamente 169 imágenes APPROVED
if (approved.length !== 169) {
  issues.push(`Se esperaban 169 imágenes APPROVED; se encontraron ${approved.length}.`);
}

// 2. Exactamente 16 SKUs con medios aprobados
const skusApproved = new Set(approved.map(r => r.product_sku));
if (skusApproved.size !== 16) {
  issues.push(`Se esperaban 16 SKUs con medios aprobados; se encontraron ${skusApproved.size}: ${[...skusApproved].join(', ')}.`);
}

// 3. Cada SKU aprobado tiene exactamente 1 main
const mainBySku = {};
for (const r of approved) {
  if (r.is_main) mainBySku[r.product_sku] = (mainBySku[r.product_sku] || 0) + 1;
}
for (const sku of skusApproved) {
  if (mainBySku[sku] !== 1) {
    issues.push(`SKU ${sku} tiene ${mainBySku[sku] || 0} main(s); se esperaba exactamente 1.`);
  }
}

// 4. sort_order único dentro de cada SKU
const sortOrdersBySku = {};
for (const r of approved) {
  if (!sortOrdersBySku[r.product_sku]) sortOrdersBySku[r.product_sku] = new Set();
  if (sortOrdersBySku[r.product_sku].has(r.sort_order)) {
    issues.push(`SKU ${sku} tiene sort_order duplicado: ${r.sort_order}.`);
  }
  sortOrdersBySku[r.product_sku].add(r.sort_order);
}

// 5. Ninguna imagen APPROVED pertenece a categorías prohibidas
for (const r of approved) {
  if (calvinFile && r.filename === calvinFile) {
    issues.push(`Archivo APPROVED es la imagen Calvin prohibida: ${r.filename}.`);
  }
  if (pumaFile && r.filename === pumaFile) {
    issues.push(`Archivo APPROVED es la imagen Puma-like prohibida: ${r.filename}.`);
  }
  if (quarantineFiles.has(r.filename)) {
    issues.push(`Archivo APPROVED está en cuarentena forense: ${r.filename}.`);
  }
  if (r.decision === 'EXCLUDE_VIDEO' || (r.mime_type && r.mime_type.startsWith('video/'))) {
    issues.push(`Archivo APPROVED es video: ${r.filename}.`);
  }
  if (!r.product_sku || !r.product_slug) {
    issues.push(`Archivo APPROVED está unmapped: ${r.filename}.`);
  }
}

// 6. Ningún archivo APPROVED tiene campos inválidos
for (const r of approved) {
  if (!r.product_sku) issues.push(`SKU null en APPROVED: ${r.filename}.`);
  if (!r.product_slug) issues.push(`product_slug null en APPROVED: ${r.filename}.`);
  if (!r.storage_path) issues.push(`storage_path null en APPROVED: ${r.filename}.`);
  if (!r.sha256) issues.push(`SHA256 vacío en APPROVED: ${r.filename}.`);
  if (!r.sha256_verified) issues.push(`SHA256 no verificado en APPROVED: ${r.filename}.`);
  if (!allowedMimeTypes.has(r.mime_type)) issues.push(`MIME no permitido en APPROVED: ${r.filename} (${r.mime_type}).`);
  if (r.file_size_bytes > maxSize) issues.push(`Tamaño > 10 MB en APPROVED: ${r.filename} (${r.file_size_bytes} bytes).`);
}

// 7. CAL-002 solo contiene imágenes CloudTec/CUUS DUUS aprobadas
const cal002Approved = approved.filter(r => r.product_sku === 'CAL-002');
for (const r of cal002Approved) {
  if (!cal002Allowed.has(r.filename)) {
    issues.push(`CAL-002 contiene archivo no CloudTec: ${r.filename}.`);
  }
}

// 8. CAL-003 exactamente 6 imágenes NOKA
const cal003Approved = approved.filter(r => r.product_sku === 'CAL-003');
if (cal003Approved.length !== 6) {
  issues.push(`CAL-003 debe tener exactamente 6 imágenes; tiene ${cal003Approved.length}.`);
}
for (const r of cal003Approved) {
  if (!cal003Files.has(r.filename)) {
    issues.push(`CAL-003 contiene archivo no NOKA: ${r.filename}.`);
  }
}

// 9. RDC-001 exactamente 20 imágenes, sin Calvin ni Puma-like
const rdc001Approved = approved.filter(r => r.product_sku === 'RDC-001');
if (rdc001Approved.length !== 20) {
  issues.push(`RDC-001 debe tener exactamente 20 imágenes; tiene ${rdc001Approved.length}.`);
}
for (const r of rdc001Approved) {
  if (r.filename === calvinFile || r.filename === pumaFile) {
    issues.push(`RDC-001 contiene imagen legal excluida: ${r.filename}.`);
  }
}

// 10. 16 slugs de Storage únicos
const approvedSlugs = new Set(approved.map(r => r.product_slug));
if (approvedSlugs.size !== 16) {
  issues.push(`Se esperaban 16 slugs únicos; se encontraron ${approvedSlugs.size}.`);
}

// Resumen por SKU
const bySku = {};
for (const r of approved) {
  if (!bySku[r.product_sku]) bySku[r.product_sku] = [];
  bySku[r.product_sku].push(r);
}

const summaryTable = Object.keys(bySku).sort().map(sku => {
  const skuRecords = bySku[sku];
  const main = skuRecords.find(r => r.is_main);
  const gallery = skuRecords.filter(r => !r.is_main);
  return {
    sku,
    product: skuRecords[0].product_name,
    main: main ? main.filename : null,
    gallery_count: gallery.length,
    total: skuRecords.length,
    storage_path: main ? main.storage_path : null
  };
});

const report = {
  generated_at: new Date().toISOString(),
  manifest: MANIFEST,
  status: issues.length === 0 ? 'PASS' : 'FAIL',
  issues,
  checks: {
    approved_count_169: approved.length === 169,
    sku_count_16: skusApproved.size === 16,
    one_main_per_sku: Object.values(mainBySku).every(c => c === 1),
    unique_sort_order_per_sku: Object.keys(sortOrdersBySku).every(sku => sortOrdersBySku[sku].size === bySku[sku].length),
    no_prohibited_content: approved.every(r =>
      r.filename !== calvinFile &&
      r.filename !== pumaFile &&
      !quarantineFiles.has(r.filename) &&
      !r.mime_type.startsWith('video/') &&
      r.product_sku && r.product_slug
    ),
    no_invalid_fields: approved.every(r =>
      r.product_sku && r.product_slug && r.storage_path && r.sha256 && r.sha256_verified &&
      allowedMimeTypes.has(r.mime_type) && r.file_size_bytes <= maxSize
    ),
    cal002_only_cloudtec: cal002Approved.every(r => cal002Allowed.has(r.filename)),
    cal003_exactly_6_noka: cal003Approved.length === 6 && cal003Approved.every(r => cal003Files.has(r.filename)),
    rdc001_exactly_20_clean: rdc001Approved.length === 20 && rdc001Approved.every(r => r.filename !== calvinFile && r.filename !== pumaFile),
    unique_slugs_16: approvedSlugs.size === 16
  },
  summary: {
    approved_count: approved.length,
    sku_count: skusApproved.size,
    cal002_count: cal002Approved.length,
    cal003_count: cal003Approved.length,
    rdc001_count: rdc001Approved.length
  },
  summary_table: summaryTable
};

fs.writeFileSync(REPORT, JSON.stringify(report, null, 2), 'utf8');

console.log('=== PREFLIGHT UPLOAD REPORT ===');
console.log('Status:', report.status);
console.log('Issues found:', issues.length);
if (issues.length > 0) {
  console.log('Issues:');
  issues.forEach(i => console.log(' -', i));
}
console.log('\nResumen por SKU:');
console.table(summaryTable);
console.log(`\nReporte completo guardado en ${REPORT}`);
