# PRODUCT_MEDIA_MAPPING.md — Propuesta de estructura de medios para A2K Store

> Documento de planificación. No modifica el proyecto ni los archivos originales.  
> Fuente: inventario visual de `fuente local de im�genes de productos`.  
> Fecha: 2026-09-06.

---

## 1. Árbol lógico de categorías

```
A2K Store
├── Calzados
│   ├── Zapatilla deportiva running turquesa (modelo catálogo)
│   ├── Zapatilla deportiva running CUUS DUUS / D-TREND (suela CloudTec)
│   └── Zapatilla deportiva running NOKA (suela lisa)
├── Cocina
│   └── (sin medios identificados aún)
├── Hogar
│   ├── Carrito de compras plegable con asiento
│   ├── Filtro de agua para grifo
│   └── Pegamento fuerte multiusos AO DE GU / MAGIC GLUE
├── Repuestos y Accesorios
│   └── Placa detectora YCS para diagnóstico de celulares
├── Ropa para Niños
│   ├── Conjunto infantil estampado — Colección A
│   └── Conjunto infantil estampado — Colección B
├── Ropa Deportiva para Caballeros
│   ├── Camiseta deportiva para caballero — surtido
│   └── Short deportivo 2 en 1
└── Electrónica
    ├── Combo smartwatch + audífonos + correas
    ├── Smartwatch / reloj inteligente
    ├── Audífonos inalámbricos con estuche pantalla
    ├── Micrófono inalámbrico de solapa doble
    └── Micrófono inalámbrico de solapa simple
```

---

## 2. Convenciones para Supabase Storage

Bucket sugerido: `products`

```
products/
└── {categoria-slug}/
     └── {producto-slug}/
          ├── main.{ext}
          ├── gallery/
          │    ├── 01.{ext}
          │    ├── 02.{ext}
          │    └── ...
          └── videos/
               ├── 01.{ext}
               └── ...
```

### Reglas de nombrado

| Elemento | Formato | Ejemplo |
|---|---|---|
| Categoría | kebab-case, minúsculas | `ropa-deportiva-caballeros` |
| Producto | kebab-case, minúsculas, sin acentos | `carrito-compras-plegable` |
| Imagen principal | `main.{ext}` | `main.jpg` |
| Galería | `gallery/NN.{ext}` secuencial | `gallery/01.jpg` |
| Videos | `videos/NN.{ext}` secuencial | `videos/01.mp4` |

### Notas técnicas

- Conservar la extensión original del archivo (`.jpg`, `.jpeg`, `.mp4`).
- Al implementar, considerar generar variantes WebP para imágenes y MP4 H.264 para videos, **sin borrar los originales**.
- Las URL públicas de Storage se guardarán en la tabla `product_images` vinculadas a `product_id` y `variant_id`.

---

## 3. Mapeo de productos confirmados

### HOG-001 — Carrito de compras plegable con asiento

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Carrito de compras plegable con asiento |
| **Slug** | `carrito-compras-plegable-asiento` |
| **SKU** | `HOG-001` |
| **Categoría** | Hogar |
| **Variantes** | Color/estampado: negro, azul, naranja, verde, rosa, espacial, floral |
| **Imagen principal** | Origen: `O1CN018DtPe21o8UgDlUe4T_!!2208525925180-0-cib.jpg` → Destino: `products/hogar/carrito-compras-plegable-asiento/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2208525925180` → Destino: `products/hogar/carrito-compras-plegable-asiento/gallery/01.jpg` ... `14.jpg` |
| **Videos** | Origen: `Zsh2na1mTQLXreCUJ5P_271821557135_hd_hq.mp4` → Destino: `products/hogar/carrito-compras-plegable-asiento/videos/01.mp4` |
| **Duplicados a ignorar** | `O1CN01YmTa4Y1o8UgDW3rtC_!!2208525925180-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01kKAAnp1o8UgDAosoG_!!2208525925180-0-cib.jpg` ↔ `(1).jpg` ↔ `(2).jpg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Fotos de catálogo Taobao. No se observan tallas, capacidad ni peso soportado. Recomendar obtener ficha técnica antes de publicar. |

---

### HOG-002 — Filtro de agua para grifo

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Filtro de agua para grifo |
| **Slug** | `filtro-agua-grifo` |
| **SKU** | `HOG-002` |
| **Categoría** | Hogar |
| **Variantes** | Color blanco, modelo estándar |
| **Imagen principal** | Origen: `WhatsApp Image 2026-09-06 at 10.38.51 AM (6).jpeg` → Destino: `products/hogar/filtro-agua-grifo/main.jpg` |
| **Galería** | Ninguna identificada |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Solo hay una imagen real. No se observa marca, capacidad de filtración ni compatibilidad con tipos de grifo. Se requiere más material o ficha técnica. |

---

### HOG-003 — Pegamento fuerte multiusos AO DE GU / MAGIC GLUE

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Pegamento fuerte multiusos AO DE GU / MAGIC GLUE |
| **Slug** | `pegamento-fuerte-ao-de-gu` |
| **SKU** | `HOG-003` |
| **Categoría** | Hogar (pendiente confirmar; podría ser Repuestos y Accesorios) |
| **Variantes** | Presentación individual y doble |
| **Imagen principal** | Origen: `O1CN016Qh1TH1gkx2g4Wm5n_!!994204181-0-cib.jpg` → Destino: `products/hogar/pegamento-fuerte-ao-de-gu/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `994204181` → Destino: `products/hogar/pegamento-fuerte-ao-de-gu/gallery/01.jpg` ... `05.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Producto no listado inicialmente. Confirmar con negocio si se comercializa y categoría final. Revisar permisos/regulación de pegamentos. |

---

### REP-001 — Placa detectora YCS para diagnóstico de celulares

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Placa detectora YCS para diagnóstico de celulares |
| **Slug** | `placa-detectora-ycs` |
| **SKU** | `REP-001` |
| **Categoría** | Repuestos y Accesorios (podría moverse a Electrónica) |
| **Variantes** | Detector por inducción electromagnética |
| **Imagen principal** | Origen: `O1CN0130xbau2BJF9Jokn3N_!!2138748317-0-cib.jpg` → Destino: `products/repuestos-accesorios/placa-detectora-ycs/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2138748317` → Destino: `products/repuestos-accesorios/placa-detectora-ycs/gallery/01.jpg` ... `03.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `O1CN018LJMTA2BJF9LevD50_!!2138748317-0-cib.jpg` ↔ `O1CN01Gd2njV2BJF9KxgBuk_!!2138748317-0-cib.jpg` <br> `O1CN01xmZKP02BJF9LNF2Db_!!2138748317-0-cib.jpg` ↔ `(1).jpg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Herramienta de reparación. Decidir categoría final antes de publicar. |

---

### CAL-001 — Zapatilla deportiva running turquesa

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Zapatilla deportiva running turquesa |
| **Slug** | `zapatilla-running-turquesa` |
| **SKU** | `CAL-001` |
| **Categoría** | Calzados |
| **Variantes** | Color turquesa/azul |
| **Imagen principal** | Origen: `O1CN012hxNBf1PaYci9RPnI_!!2222117231857-0-cib.jpg` → Destino: `products/calzados/zapatilla-running-turquesa/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2222117231857` → Destino: `products/calzados/zapatilla-running-turquesa/gallery/01.jpg` ... `04.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Modelo distinto a los de WhatsApp. No se observa marca ni tallas. Podría fusionarse con otro SKU si el proveedor confirma que es el mismo producto. |

---

### CAL-002 — Zapatilla deportiva running CUUS DUUS / D-TREND

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Zapatilla deportiva running CloudTec (CUUS DUUS / D-TREND) |
| **Slug** | `zapatilla-running-cloudtec-cuus-duus` |
| **SKU** | `CAL-002` |
| **Categoría** | Calzados |
| **Variantes** | Colores: blanco, negro, gris, azul, verde, amarillo, rojo, beige, morado |
| **Imagen principal** | Origen: `WhatsApp Image 2026-09-06 at 10.38.44 AM (1).jpeg` → Destino: `products/calzados/zapatilla-running-cloudtec-cuus-duus/main.jpg` |
| **Galería** | Origen: imágenes WhatsApp 2026-09-06 que muestren suela agujereada CUUS DUUS/D-TREND → Destino: `products/calzados/zapatilla-running-cloudtec-cuus-duus/gallery/NN.jpg` |
| **Videos** | Origen: `20260322_..._taobao.mp4`, `WhatsApp Video 2026-09-06 at 10.38.43 AM.mp4` → Destino: `products/calzados/zapatilla-running-cloudtec-cuus-duus/videos/01.mp4`, `02.mp4` |
| **Duplicados a ignorar** | Varios dentro del lote WhatsApp 2026-09-06 (ver sección 5). |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Se separa del SKU NOKA por silueta visiblemente distinta. Confirmar con proveedor. No se observan tallas. |

---

### CAL-003 — Zapatilla deportiva running NOKA

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Zapatilla deportiva running NOKA |
| **Slug** | `zapatilla-running-noka` |
| **SKU** | `CAL-003` |
| **Categoría** | Calzados |
| **Variantes** | Colores: blanco, negro, gris, azul, verde oliva, beige |
| **Imagen principal** | Origen: imagen WhatsApp 2026-09-06 con marca NOKA visible → Destino: `products/calzados/zapatilla-running-noka/main.jpg` |
| **Galería** | Origen: imágenes WhatsApp 2026-09-06 con marca NOKA/suela lisa → Destino: `products/calzados/zapatilla-running-noka/gallery/NN.jpg` |
| **Videos** | Ninguno específico identificado |
| **Duplicados a ignorar** | Varios dentro del lote WhatsApp 2026-09-06 (ver sección 5). |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Propuesto como SKU separado por silueta distinta. Requiere confirmación del proveedor. No se observan tallas. |

---

### ELE-001 — Combo smartwatch + audífonos + correas

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Combo smartwatch + audífonos + correas |
| **Slug** | `combo-smartwatch-audifonos-correas` |
| **SKU** | `ELE-001` |
| **Categoría** | Electrónica |
| **Variantes** | Kit de regalo. Smartwatch(es), audífonos y correas surtidas. |
| **Imagen principal** | Origen: `WhatsApp Image 2026-09-06 at 10.38.51 AM (2).jpeg` → Destino: `products/electronica/combo-smartwatch-audifonos-correas/main.jpg` |
| **Galería** | Origen: `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg`, `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg3.jpeg`, `WhatsApp Image 2026-09-06 at 10.38.53 AM (6).jpeg` → Destino: `products/electronica/combo-smartwatch-audifonos-correas/gallery/01.jpg` ... `03.jpg` |
| **Videos** | Origen: `WhatsApp Video 2026-09-06 at 10.38.48 AM.mp4` → Destino: `products/electronica/combo-smartwatch-audifonos-correas/videos/01.mp4` |
| **Duplicados a ignorar** | `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.51 AM (3).jpeg` <br> `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg3.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM.jpeg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | No se observa marca. Incluye smartwatch, audífonos y 7 correas aproximadamente. Definir si se vende como kit único o por piezas. |

---

### ELE-002 — Smartwatch / reloj inteligente

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Smartwatch / reloj inteligente |
| **Slug** | `smartwatch-reloj-inteligente` |
| **SKU** | `ELE-002` |
| **Categoría** | Electrónica |
| **Variantes** | Correas naranja, azul, rosa, blanca, metálica. Caja dorada y plateada. |
| **Imagen principal** | Origen: `WhatsApp Image 2026-08-13 at 3.46.50 PM.jpeg15.jpeg` → Destino: `products/electronica/smartwatch-reloj-inteligente/main.jpg` |
| **Galería** | Origen: `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg0.jpeg`, `jpeg1.jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (6).jpeg`, `WhatsApp Image 2026-08-13 at 4.00.27 PM (1).jpeg`, `WhatsApp Image 2026-08-13 at 4.00.27 PM.jpeg` → Destino: `products/electronica/smartwatch-reloj-inteligente/gallery/01.jpg` ... `05.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `WhatsApp Image 2026-08-13 at 3.46.50 PM.jpeg15.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (1).jpeg` <br> `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg0.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (2).jpeg` ↔ `(3).jpeg` <br> `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg1.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (6).jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.26 PM (6).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (4).jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.27 PM (1).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (3).jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.27 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (5).jpeg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Fotos reales. No se distingue marca ni modelo específico. Decidir si es el mismo smartwatch del combo ELE-001 o un producto separado. |

---

### ELE-003 — Audífonos inalámbricos con estuche pantalla

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Audífonos inalámbricos con estuche pantalla |
| **Slug** | `audifonos-inalambricos-estuche-pantalla` |
| **SKU** | `ELE-003` |
| **Categoría** | Electrónica |
| **Variantes** | Colores blanco y negro observados |
| **Imagen principal** | Origen: `WhatsApp Image 2026-08-12 at 3.43.58 PM.jpeg` → Destino: `products/electronica/audifonos-inalambricos-estuche-pantalla/main.jpg` |
| **Galería** | Origen: `WhatsApp Image 2026-08-12 at 3.44.15 PM.jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (6).jpeg` → Destino: `products/electronica/audifonos-inalambricos-estuche-pantalla/gallery/01.jpg`, `02.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `WhatsApp Image 2026-08-13 at 4.00.26 PM (6).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (4).jpeg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Probablemente corresponde a "AirMax" de la lista inicial, pero no se lee claramente en la imagen. Confirmar marca/modelo. |

---

### ELE-004 — Micrófono inalámbrico de solapa doble

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Micrófono inalámbrico de solapa doble |
| **Slug** | `microfono-inalambrico-solapa-doble` |
| **SKU** | `ELE-004` |
| **Categoría** | Electrónica |
| **Variantes** | 2 micrófonos + receptor USB-C/Lightning. Colores negro y negro con detalles azules. |
| **Imagen principal** | Origen: `WhatsApp Image 2026-09-06 at 10.38.51 AM (5).jpeg` → Destino: `products/electronica/microfono-inalambrico-solapa-doble/main.jpg` |
| **Galería** | Origen: `WhatsApp Image 2026-08-13 at 4.00.25 PM.jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (1).jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (2).jpeg` → Destino: `products/electronica/microfono-inalambrico-solapa-doble/gallery/01.jpg` ... `03.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `WhatsApp Image 2026-08-13 at 4.00.25 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.51 AM (7).jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.26 PM (1).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.44 AM.jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.26 PM (2).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (1).jpeg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Probablemente corresponde a "K9 Duo". Algunas cajas muestran referencia K11. Confirmar modelo final antes de publicar. |

---

### ELE-005 — Micrófono inalámbrico de solapa simple

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Micrófono inalámbrico de solapa simple |
| **Slug** | `microfono-inalambrico-solapa-simple` |
| **SKU** | `ELE-005` |
| **Categoría** | Electrónica |
| **Variantes** | 1 micrófono + receptor. Color negro. Caja negra o blanca. |
| **Imagen principal** | Origen: `WhatsApp Image 2026-08-12 at 2.20.13 PM.jpeg` → Destino: `products/electronica/microfono-inalambrico-solapa-simple/main.jpg` |
| **Galería** | Origen: `WhatsApp Image 2026-08-12 at 2.19.54 PM.jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (3).jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (4).jpeg`, `WhatsApp Image 2026-08-13 at 4.00.26 PM (5).jpeg` → Destino: `products/electronica/microfono-inalambrico-solapa-simple/gallery/01.jpg` ... `04.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `WhatsApp Image 2026-08-12 at 2.19.54 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (5).jpeg` <br> `WhatsApp Image 2026-08-12 at 2.20.13 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (4).jpeg` <br> `WhatsApp Image 2026-08-13 at 4.00.26 PM (5).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM.jpeg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Probablemente corresponde a "K9 One". Confirmar modelo final. |

---

### RPN-001 — Conjunto infantil estampado — Colección A

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Conjunto infantil estampado — Colección A |
| **Slug** | `conjunto-infantil-estampado-coleccion-a` |
| **SKU** | `RPN-001` |
| **Categoría** | Ropa para Niños |
| **Variantes** | Diseños surtidos (oso, fútbol, personajes, Spiderman, Gamer, etc.). Cada diseño puede ser una variante/SKU separado. |
| **Imagen principal** | Origen: `O1CN0109qnf024bq06zER26_!!2219021487410-0-cib (1).jpg` → Destino: `products/ropa-ninos/conjunto-infantil-estampado-coleccion-a/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2219021487410` → Destino: `products/ropa-ninos/conjunto-infantil-estampado-coleccion-a/gallery/01.jpg` ... `32.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | `O1CN0109qnf024bq06zER26_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01JG9FjV24bq05Pbz1w_!!2219021487410-0-cib.jpg` ↔ `O1CN01JzvGgF24bq058Q8nJ_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01K9dDMA24bq058CVt3_!!2219021487410-0-cib.jpg` ↔ `O1CN01omFSPj24bq059meCm_!!2219021487410-0-cib.jpg` <br> `O1CN01OmCdSg24bq05DR71y_!!2219021487410-0-cib.jpg` ↔ `O1CN01pMpZiL24bq05N8Ezm_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01TOpM7424bq05N9hxV_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` ↔ `O1CN01U6f6Oq24bq05z6Kv4_!!2219021487410-0-cib.jpg` <br> `O1CN01YeJMMg24bq05PvNkj_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01auloji24bq05DgDb6_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01eshGJW24bq05Ilhwo_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` <br> `O1CN01h00JqM24bq058CurF_!!2219021487410-0-cib.jpg` ↔ `O1CN01xJnr9624bq05VaKFq_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` ↔ `(2).jpg` <br> `O1CN01yi1w4724bq05zNmxP_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Fotos de catálogo Taobao. No se observan tallas. Considerar dividir cada diseño en SKU separado al implementar el catálogo. Algunos modelos parecen camisones/vestidos largos; revisar. |

---

### RPN-002 — Conjunto infantil estampado — Colección B

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Conjunto infantil estampado — Colección B |
| **Slug** | `conjunto-infantil-estampado-coleccion-b` |
| **SKU** | `RPN-002` |
| **Categoría** | Ropa para Niños |
| **Variantes** | Diseños surtidos (oso neon, graffiti, dinosaurio, Mickey, Boston, etc.). Cada diseño puede ser una variante/SKU separado. |
| **Imagen principal** | Origen: `O1CN016bsuTb1ZmbCyc0XTs_!!2222335923237-0-cib.jpg` → Destino: `products/ropa-ninos/conjunto-infantil-estampado-coleccion-b/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2222335923237` → Destino: `products/ropa-ninos/conjunto-infantil-estampado-coleccion-b/gallery/01.jpg` ... `11.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno detectado en este vendedor. |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Algunos diseños se repiten visualmente con la Colección A. Revisar duplicados de diseño antes de crear SKUs. |

---

### RDC-001 — Camiseta deportiva para caballero — surtido

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Camiseta deportiva para caballero — surtido |
| **Slug** | `camiseta-deportiva-caballero-surtido` |
| **SKU** | `RDC-001` |
| **Categoría** | Ropa Deportiva para Caballeros |
| **Variantes** | Colores y estampados surtidos: degradados "whatever", "Paris", "Never Give Up", rayas, conjuntos 5 piezas. |
| **Imagen principal** | Origen: `O1CN0104U8SR1SEWQ92cLXd_!!2214054902215-0-cib.jpg` → Destino: `products/ropa-deportiva-caballeros/camiseta-deportiva-caballero-surtido/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2214054902215` → Destino: `products/ropa-deportiva-caballeros/camiseta-deportiva-caballero-surtido/gallery/01.jpg` ... `21.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno detectado. |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Algunas imágenes muestran la palabra "Calvin" (posible imitación de marca). Revisar legalidad antes de publicar. No se observan tallas. Considerar SKU por diseño/color. |

---

### RDC-002 — Short deportivo 2 en 1

| Campo | Valor |
|---|---|
| **Nombre comercial definitivo** | Short deportivo 2 en 1 |
| **Slug** | `short-deportivo-2-en-1` |
| **SKU** | `RDC-002` |
| **Categoría** | Ropa Deportiva para Caballeros |
| **Variantes** | Colores: verde, negro, gris, turquesa, morado, verde oliva, rosa, azul |
| **Imagen principal** | Origen: `O1CN01285Ttn29xt98pqMrx_!!2220162858135-0-cib.jpg` → Destino: `products/ropa-deportiva-caballeros/short-deportivo-2-en-1/main.jpg` |
| **Galería** | Origen: resto de imágenes del vendedor `2220162858135` → Destino: `products/ropa-deportiva-caballeros/short-deportivo-2-en-1/gallery/01.jpg` ... `11.jpg` |
| **Videos** | Ninguno |
| **Duplicados a ignorar** | Ninguno detectado. |
| **Archivos descartados** | Ninguno |
| **Observaciones** | Fotos de catálogo. No se observan tallas. Podría ser unisex; confirmar target. |

---

## 4. Estructura completa propuesta en Supabase Storage

```
products/
├── calzados/
│   ├── zapatilla-running-turquesa/
│   │   ├── main.jpg
│   │   └── gallery/
│   │       ├── 01.jpg
│   │       ├── 02.jpg
│   │       ├── 03.jpg
│   │       └── 04.jpg
│   ├── zapatilla-running-cloudtec-cuus-duus/
│   │   ├── main.jpg
│   │   ├── gallery/
│   │   │   ├── 01.jpg
│   │   │   └── ...
│   │   └── videos/
│   │       ├── 01.mp4
│   │       └── 02.mp4
│   └── zapatilla-running-noka/
│       ├── main.jpg
│       └── gallery/
│           ├── 01.jpg
│           └── ...
├── cocina/
│   └── (reservado — sin medios aún)
├── hogar/
│   ├── carrito-compras-plegable-asiento/
│   │   ├── main.jpg
│   │   ├── gallery/
│   │   │   ├── 01.jpg
│   │   │   └── ...
│   │   └── videos/
│   │       └── 01.mp4
│   ├── filtro-agua-grifo/
│   │   └── main.jpg
│   └── pegamento-fuerte-ao-de-gu/
│       ├── main.jpg
│       └── gallery/
│           ├── 01.jpg
│           └── ...
├── repuestos-accesorios/
│   └── placa-detectora-ycs/
│       ├── main.jpg
│       └── gallery/
│           ├── 01.jpg
│           └── ...
├── ropa-ninos/
│   ├── conjunto-infantil-estampado-coleccion-a/
│   │   ├── main.jpg
│   │   └── gallery/
│   │       ├── 01.jpg
│   │       └── ...
│   └── conjunto-infantil-estampado-coleccion-b/
│       ├── main.jpg
│       └── gallery/
│           ├── 01.jpg
│           └── ...
├── ropa-deportiva-caballeros/
│   ├── camiseta-deportiva-caballero-surtido/
│   │   ├── main.jpg
│   │   └── gallery/
│   │       ├── 01.jpg
│   │       └── ...
│   └── short-deportivo-2-en-1/
│       ├── main.jpg
│       └── gallery/
│           ├── 01.jpg
│           └── ...
└── electronica/
    ├── combo-smartwatch-audifonos-correas/
    │   ├── main.jpg
    │   ├── gallery/
    │   │   ├── 01.jpg
    │   │   └── ...
    │   └── videos/
    │       └── 01.mp4
    ├── smartwatch-reloj-inteligente/
    │   ├── main.jpg
    │   └── gallery/
    │       ├── 01.jpg
    │       └── ...
    ├── audifonos-inalambricos-estuche-pantalla/
    │   ├── main.jpg
    │   └── gallery/
    │       ├── 01.jpg
    │       └── 02.jpg
    ├── microfono-inalambrico-solapa-doble/
    │   ├── main.jpg
    │   └── gallery/
    │       ├── 01.jpg
    │       └── ...
    └── microfono-inalambrico-solapa-simple/
        ├── main.jpg
        └── gallery/
            ├── 01.jpg
            └── ...
```

---

## 5. Duplicados exactos a ignorar (resumen por grupo)

Conservar **una sola copia** de cada grupo. Se sugiere conservar la de mayor resolución o mejor encuadre.

### Archivos O1CN

| Grupo | Archivos duplicados | SKU afectado |
|---|---|---|
| 1 | `O1CN01YmTa4Y1o8UgDW3rtC_!!2208525925180-0-cib.jpg` ↔ `(1).jpg` | HOG-001 |
| 2 | `O1CN01kKAAnp1o8UgDAosoG_!!2208525925180-0-cib.jpg` ↔ `(1).jpg` ↔ `(2).jpg` | HOG-001 |
| 3 | `O1CN018LJMTA2BJF9LevD50_!!2138748317-0-cib.jpg` ↔ `O1CN01Gd2njV2BJF9KxgBuk_!!2138748317-0-cib.jpg` | REP-001 |
| 4 | `O1CN01xmZKP02BJF9LNF2Db_!!2138748317-0-cib.jpg` ↔ `(1).jpg` | REP-001 |
| 5 | `O1CN0109qnf024bq06zER26_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 6 | `O1CN01JG9FjV24bq05Pbz1w_!!2219021487410-0-cib.jpg` ↔ `O1CN01JzvGgF24bq058Q8nJ_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 7 | `O1CN01K9dDMA24bq058CVt3_!!2219021487410-0-cib.jpg` ↔ `O1CN01omFSPj24bq059meCm_!!2219021487410-0-cib.jpg` | RPN-001 |
| 8 | `O1CN01OmCdSg24bq05DR71y_!!2219021487410-0-cib.jpg` ↔ `O1CN01pMpZiL24bq05N8Ezm_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 9 | `O1CN01TOpM7424bq05N9hxV_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` ↔ `O1CN01U6f6Oq24bq05z6Kv4_!!2219021487410-0-cib.jpg` | RPN-001 |
| 10 | `O1CN01YeJMMg24bq05PvNkj_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 11 | `O1CN01auloji24bq05DgDb6_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 12 | `O1CN01eshGJW24bq05Ilhwo_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |
| 13 | `O1CN01h00JqM24bq058CurF_!!2219021487410-0-cib.jpg` ↔ `O1CN01xJnr9624bq05VaKFq_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` ↔ `(2).jpg` | RPN-001 |
| 14 | `O1CN01yi1w4724bq05zNmxP_!!2219021487410-0-cib.jpg` ↔ `(1).jpg` | RPN-001 |

### Videos

| Grupo | Archivos duplicados | SKU afectado |
|---|---|---|
| 1 | `20260322_1bd5c181c4693fa3_557765372711_418299854697032_published_mp4_264_hd_taobao.mp4` ↔ `(1).mp4` | CAL-002 |

### WhatsApp (agosto ↔ septiembre)

| Grupo | Archivos duplicados | SKU afectado |
|---|---|---|
| 1 | `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.51 AM (3).jpeg` | ELE-001 |
| 2 | `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg0.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (2).jpeg` ↔ `(3).jpeg` | ELE-002 |
| 3 | `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg1.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (6).jpeg` | ELE-002 |
| 4 | `WhatsApp Image 2026-08-13 at 3.46.49 PM.jpeg3.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM.jpeg` | ELE-001 |
| 5 | `WhatsApp Image 2026-08-13 at 3.46.50 PM.jpeg15.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (1).jpeg` | ELE-002 |
| 6 | `WhatsApp Image 2026-08-13 at 4.00.25 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.51 AM (7).jpeg` | ELE-004 |
| 7 | `WhatsApp Image 2026-08-13 at 4.00.26 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (2).jpeg` | ELE-005 |
| 8 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (1).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.44 AM.jpeg` | ELE-004 |
| 9 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (2).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (1).jpeg` | ELE-004 |
| 10 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (3).jpeg` | (único) | ELE-005 |
| 11 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (4).jpeg` | (único) | ELE-005 |
| 12 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (5).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM.jpeg` | ELE-005 |
| 13 | `WhatsApp Image 2026-08-13 at 4.00.26 PM (6).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (4).jpeg` | ELE-002 / ELE-003 |
| 14 | `WhatsApp Image 2026-08-13 at 4.00.27 PM (1).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (3).jpeg` | ELE-002 |
| 15 | `WhatsApp Image 2026-08-13 at 4.00.27 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.52 AM (5).jpeg` | ELE-002 |
| 16 | `WhatsApp Image 2026-08-12 at 2.19.54 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (5).jpeg` | ELE-005 |
| 17 | `WhatsApp Image 2026-08-12 at 2.20.13 PM.jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.53 AM (4).jpeg` | ELE-005 |
| 18 | `WhatsApp Image 2026-09-06 at 10.38.44 AM (1).jpeg` ↔ `WhatsApp Image 2026-09-06 at 10.38.51 AM (4).jpeg` | CAL-002 |

---

## 6. Archivos que NO deben entrar al catálogo

| Archivo | Razón |
|---|---|
| `20260421_a56de925cfe43cda_561984904661_435368659007719_published_mp4_264_hd_taobao.mp4` | Video de impresora textil industrial. No es producto comercializable. |

---

## 7. Productos esperados sin medios

| Producto | Categoría | Acción sugerida |
|---|---|---|
| Cortador / rebanador de vegetales | Cocina | Solicitar medios al proveedor o ubicar carpeta alternativa. |
| Piedras / repuestos para filtros de agua | Repuestos y Accesorios | Solicitar medios al proveedor. |

---

## 8. Tabla resumen de productos propuestos

| SKU | Categoría | Nombre comercial | Slug | Variantes | Main | Galería | Video |
|---|---|---|---|---|---|---|---|
| HOG-001 | Hogar | Carrito de compras plegable con asiento | `carrito-compras-plegable-asiento` | Colores/estampados | Sí | 14 imágenes | 1 video |
| HOG-002 | Hogar | Filtro de agua para grifo | `filtro-agua-grifo` | Blanco | Sí | No | No |
| HOG-003 | Hogar | Pegamento fuerte multiusos AO DE GU | `pegamento-fuerte-ao-de-gu` | Individual/doble | Sí | 5 imágenes | No |
| REP-001 | Repuestos y Accesorios | Placa detectora YCS | `placa-detectora-ycs` | Detector de cortocircuitos | Sí | 3 imágenes | No |
| CAL-001 | Calzados | Zapatilla deportiva running turquesa | `zapatilla-running-turquesa` | Turquesa | Sí | 4 imágenes | No |
| CAL-002 | Calzados | Zapatilla deportiva running CloudTec | `zapatilla-running-cloudtec-cuus-duus` | Colores surtidos | Sí | ~20 imágenes | 2 videos |
| CAL-003 | Calzados | Zapatilla deportiva running NOKA | `zapatilla-running-noka` | Colores surtidos | Sí | ~15 imágenes | No |
| ELE-001 | Electrónica | Combo smartwatch + audífonos + correas | `combo-smartwatch-audifonos-correas` | Kit de regalo | Sí | 3 imágenes | 1 video |
| ELE-002 | Electrónica | Smartwatch / reloj inteligente | `smartwatch-reloj-inteligente` | Correas surtidas | Sí | 5 imágenes | No |
| ELE-003 | Electrónica | Audífonos inalámbricos con estuche pantalla | `audifonos-inalambricos-estuche-pantalla` | Blanco/negro | Sí | 2 imágenes | No |
| ELE-004 | Electrónica | Micrófono inalámbrico de solapa doble | `microfono-inalambrico-solapa-doble` | Negro/azul | Sí | 3 imágenes | No |
| ELE-005 | Electrónica | Micrófono inalámbrico de solapa simple | `microfono-inalambrico-solapa-simple` | Negro | Sí | 4 imágenes | No |
| RPN-001 | Ropa para Niños | Conjunto infantil estampado — Colección A | `conjunto-infantil-estampado-coleccion-a` | Diseños surtidos | Sí | 32 imágenes | No |
| RPN-002 | Ropa para Niños | Conjunto infantil estampado — Colección B | `conjunto-infantil-estampado-coleccion-b` | Diseños surtidos | Sí | 11 imágenes | No |
| RDC-001 | Ropa Deportiva para Caballeros | Camiseta deportiva para caballero — surtido | `camiseta-deportiva-caballero-surtido` | Colores/estampados | Sí | 21 imágenes | No |
| RDC-002 | Ropa Deportiva para Caballeros | Short deportivo 2 en 1 | `short-deportivo-2-en-1` | Colores surtidos | Sí | 11 imágenes | No |

---

## 9. Recomendaciones antes de implementar

1. **Confirmar SKUs CAL-002 y CAL-003:** el proveedor debe validar si son dos modelos distintos o variantes de color del mismo modelo.
2. **Confirmar modelos de micrófonos:** validar si ELE-004 es "K9 Duo" y ELE-005 es "K9 One", o si corresponden a otras referencias (K11, etc.).
3. **Confirmar audífonos:** validar si ELE-003 corresponde a "AirMax" o a otro modelo.
4. **Revisar imágenes con texto "Calvin"** en RDC-001 por posibles problemas legales de marca.
5. **Decidir categoría final** de HOG-003 (pegamento) y REP-001 (placa YCS).
6. **Solicitar medios faltantes:** cortador de vegetales y repuestos de filtro de agua.
7. **Depurar duplicados** antes de subir a Storage: conservar solo el archivo de mayor resolución de cada grupo.
8. **No subir** el video de impresora textil al bucket `products`.
9. **Definir tallas** para calzados y ropa antes de crear variantes en la base de datos.
10. **Considerar conversión a WebP/MP4 optimizado** al subir, manteniendo los originales como respaldo local.
