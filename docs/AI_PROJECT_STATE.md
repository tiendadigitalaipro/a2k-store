# A2K STORE — ESTADO DEL PROYECTO

> Este es el documento principal de handoff entre sesiones.  
> Leerlo al inicio de cada sesión nueva.

## Estado actual

| Campo | Valor |
|-------|-------|
| Fase actual | 18 (Catálogo real) — completada |
| Bloque actual | G (Fases 18 + 19 + 20) |
| Último bloque completado | B (Fases 2 + 3) — G parcial (Fase 18 completada) |
| Último commit | `6efa200` (feat(fase-3): auth context, login/register) |
| Rama | `main` |
| Remote | `origin` → `git@github.com:tiendadigitalaipro/a2k-store.git` |
| Estado del repositorio | Modificado (migraciones 00021–00023, scripts de carga, reportes QA); sin commit |

## Completado

### BLOQUE A — Fundación del e-commerce frontend ✅

**Fase 0 — Auditoría:**
- [x] Inspección completa del repositorio
- [x] Identificación de problemas P0
- [x] Confirmación de stack y estructura

**Fase 1 — Fundación frontend:**
- [x] CartDrawer con UI completa (items, cantidad, eliminar, subtotal, estado vacío)
- [x] CartBadge funcional (abre el drawer con toggleCart)
- [x] CartDrawer integrado en Layout
- [x] Validación de stock en ADD_ITEM y UPDATE_QUANTITY del carrito
- [x] Galería de imágenes con thumbnails y navegación
- [x] Selector de variantes con estado stock/activo
- [x] Precio, SKU y stock por variante
- [x] Estado agotado con botón deshabilitado
- [x] Búsqueda extendida (name, description, SKU, tags, variantes)
- [x] Ordenamiento (relevancia, precio asc/desc, newest, rating)
- [x] Filtros rápidos (destacados, nuevos, en stock)
- [x] Contador de filtros activos y botón limpiar
- [x] Footer links corregidos (usan params reales del catálogo)
- [x] Canonical URL
- [x] Open Graph (og:image, og:url, og:site_name)
- [x] Twitter meta tags
- [x] sitemap.xml creado
- [x] robots.txt corregido (dominio correcto)
- [x] Skip link para accesibilidad
- [x] aria-labels en controles del carrito
- [x] site.ts actualizado con datos de negocio correctos

### BLOQUE B — Backend y autenticación

**B1 — Build verification ✅**
- [x] `npm install` exitoso (94 paquetes)
- [x] `npm run build` limpio: 422 modules, 380KB JS
- [x] TypeScript sin errores

**B2 — Database schema (Supabase) ✅ (auditado, corregido y aplicado)**
- [x] 11 migraciones SQL (00001–00011) — reordenadas por dependencias
- [x] 34 tablas con RLS habilitado
- [x] Enums completos (incluye `customer` role)
- [x] Helper functions con `search_path` hardening
- [x] Funciones RPC atómicas para inventario
- [x] Order number generation con advisory lock
- [x] Stock reservation con validación de concurrencia
- [x] Service layer completo (6 servicios)
- [x] TypeScript types completos para todas las tablas
- [x] Aplicado a Supabase (`lreccgsruakmaaamjidr`)
- [x] Seed data: 13 business_settings, 1 exchange_rate

### BLOQUE G — Producción (parcial)

**Fase 18 — Catálogo real ✅**
- [x] 7 categorías reales creadas idempotentemente (`00021_seed_real_categories.sql`)
  - Calzados, Cocina, Hogar, Repuestos y Accesorios, Ropa para Niños, Ropa Deportiva para Caballeros, Electrónica
- [x] Bucket `products` configurado en Supabase Storage (`00022_setup_products_storage.sql`)
  - Público, límite 10 MB, MIME types de imagen permitidos
  - Policies RLS para lectura pública, escritura admin y service_role
- [x] 16 productos reales creados con `status = 'inactive'`
- [x] 169 imágenes reales subidas a `products/<slug>/main.jpg` y `products/<slug>/gallery/NN.jpg`
- [x] 169 registros creados en `product_images`
- [x] Migración `00023_activate_real_products.sql`: productos demo desactivados, 16 productos reales activados
- [x] `npm run build` exitoso (485 modules, 639KB JS)
- [x] QA visual y funcional del catálogo aprobado
  - 16 productos reales visibles, 0 productos demo visibles
  - Imágenes cargando correctamente, 0 rotas
  - Filtros por categoría funcionando
  - Detalle de producto y galerías funcionando
  - Sin errores críticos en consola

## Pendiente

### BLOQUE B — Backend y autenticación ✅
- [x] Fase 2: Supabase ✅
- [x] Fase 3: Autenticación ✅

### BLOQUE C — Checkout, inventario, pagos
- [ ] Fase 4: Checkout (datos, entrega, pago, revisión)
- [ ] Fase 5: Inventario y reservas (stock, reservas 30min, movimientos)
- [ ] Fase 6: Pagos (métodos configurables, comprobantes, verificación)

### BLOQUE D — Pedidos, envíos, moneda
- [ ] Fase 7: Moneda y precios (USD/VES, tasa A2K configurable)
- [ ] Fase 8: Pedidos (A2K-YYYY-NNNNNN, estados, historial, snapshots)
- [ ] Fase 9: Envíos (transportistas, tracking, pickup)
- [ ] Fase 10: Devoluciones y garantías

### BLOQUE E — Admin
- [ ] Fase 11: Admin Panel completo
- [ ] Fase 12: Roles y seguridad admin
- [ ] Fase 13: Promociones y cupones

### BLOQUE F — Funciones adicionales
- [ ] Fase 14: Wishlist, reviews y Q&A
- [x] Fase 15: Imágenes y storage — completada en Fase 18
- [x] Fase 16: Categorías y marcas — categorías reales completadas en Fase 18
- [ ] Fase 17: Notificaciones

### BLOQUE G — Producción
- [x] Fase 18: Catálogo real
- [ ] Fase 19: Configuración de negocio
- [ ] Fase 20: Testing y producción

## Próximo paso

**BLOQUE G, Fase 19: Configuración de negocio** — Completar datos comerciales y preparar producción.

Acciones concretas:
1. Revisar y ajustar precios estimados de los 12 productos no electrónicos (CAL, HOG, RDC, REP, RPN, ELE-001)
2. Confirmar stock real vs. stock provisional de 10 unidades
3. Definir costos internos si aplica
4. Revisar descripciones y SEO de productos
5. Configurar datos de negocio en `business_settings` (tasa A2K, horario, contacto, etc.)
6. Commit y push de las migraciones 00021–00023 y scripts de carga

**Nota:** La Fase 3 (Autenticación) del BLOQUE B ya fue completada previamente según el historial del repositorio.

## Correcciones de auditoría B2 (2026-09-05)

| Problema | Corrección |
|----------|-----------|
| Enum `user_role` sin `customer` | Agregado `customer` como primer valor |
| `profiles.role` default incorrecto | Cambiado de `customer_service` a `customer` |
| Race condition en `generate_order_number()` | Agregado `pg_advisory_xact_lock` |
| `update_stock_reserved()` sin validación | Agregada verificación de stock antes de reservar |
| Funciones sin `search_path` | Todas las funciones tienen `SET search_path = public, pg_temp` |
| `review_photos` solo admin | Agregada política para clientes en sus propios reviews |
| `decrementStock()` race condition | Reemplazado con RPC atómica `decrement_stock()` |
| Sin RPC para reservas atómicas | Creada `create_stock_reservation()` con `FOR UPDATE` lock |
| Sin RPC para expirar reservas | Creada `expire_overdue_reservations()` |

## Decisiones de negocio

| Decisión | Valor | Notas |
|----------|-------|-------|
| Moneda principal | USD | Equivalente VES mostrado al cliente |
| Tasa A2K | Configurable desde Admin | BCV como referencia, no hard-codeada |
| Envío retail | GRATIS para cliente | Costo real registrado internamente |
| Retiro | Ocumare del Tuy | Confirmación manual por WhatsApp |
| Devoluciones | Solo reemplazo | No reembolsos monetarios |
| Smartwatch | Garantía cubre dispositivo | No accesorios de caja sellada |
| Wholesale | No activo inicialmente | Arquitectura preparada |
| Canal principal | WhatsApp | Meta Cloud API |
| Email | Resend | Para verificación, confirmaciones |
| Pedido formato | A2K-YYYY-NNNNNN | Secuencial por año |
| Reserva inventario | 30 min | Configurable desde Admin |
| Stock definitivo | Al marcar ENTREGADO | No al aprobar pago |

## Arquitectura

### Frontend (actual)
```
React 19 + TypeScript (strict) + Vite 6
React Router 6.30
Tailwind CSS 4 (@tailwindcss/vite)
Framer Motion 11.15
```

### Backend (objetivo)
```
Supabase
├── PostgreSQL (base de datos)
├── Supabase Auth (autenticación)
├── Supabase Storage (imágenes)
├── Row Level Security (seguridad)
└── Edge Functions (lógica server-side)
```

### Deploy (objetivo)
```
Vercel → store.a2kdigitalstudio.online
```

### Estructura de directorios
```
src/
├── components/
│   ├── cart/        CartBadge, CartDrawer, AddToCartButton
│   ├── home/        Hero, FeaturedProducts, Features
│   ├── layout/      Header, Footer, Layout, MobileMenu
│   ├── product/     ProductCard, ProductGrid, ProductImage, ProductPrice, ProductBadge
│   └── ui/          Badge, Button, Card, Container, Icon, Input, VisuallyHidden
├── config/          site.ts
├── context/         CartContext.tsx
├── data/            products.ts, categories.ts (DEMO — inactivos, reemplazados por datos reales en Supabase)
├── hooks/           useCart.ts
├── lib/             format.ts, utils.ts, supabase/
├── pages/           Home, Catalog, ProductDetail, NotFound
├── router/          index.tsx
├── services/        auth, catalog, inventory, orders, payments, settings
└── types/           index.ts

supabase/
└── migrations/
    ├── 00001_create_enums.sql
    ├── 00002_create_profiles_and_roles.sql
    ├── 00003_create_catalog.sql
    ├── 00004_create_inventory.sql
    ├── 00005_create_base_tables.sql (payment_methods, shipping_carriers, promotions, coupons)
    ├── 00006_create_orders.sql
    ├── 00007_create_order_junctions.sql (order_payments, payment_receipts, order_shipping, coupon_usage)
    ├── 00008_create_reviews_qa_wishlist.sql
    ├── 00009_create_notifications_settings_audit.sql
    ├── 00010_enable_rls.sql
    ├── 00011_add_stock_rpc_functions.sql
    ├── 00012_auth_triggers.sql
    ├── 00013_security_hardening.sql
    ├── 00014_harden_orders_insert_status.sql
    ├── 00015_seed_checkout_config.sql
    ├── 00016_order_financial_validation.sql
    ├── 00017_create_order_checkout_rpc.sql
    ├── 00018_seed_catalog.sql
    ├── 00019_grant_table_privileges.sql
    ├── 00020_add_reservation_duration_setting.sql
    ├── 00021_seed_real_categories.sql
    ├── 00022_setup_products_storage.sql
    └── 00023_activate_real_products.sql
```

## Riesgos / Bloqueos

| Bloqueo | Impacto | Mitigación |
|---------|---------|------------|
| Sin credenciales Supabase | Resuelto | URL + anon key configurados en `.env.local`; backend conectado |
| Sin credenciales Resend | No se puede enviar email | Dejar interfaz preparada, marcar bloqueo |
| Sin credenciales WhatsApp | No se puede enviar notificaciones | Crear abstracción de proveedor configurable |
| Sin dominio Vercel | No se puede deployar | Preparar configuración, documentar proceso |
| Datos demo hard-coded | Resuelto | Catálogo real activado: 16 productos reales con 169 imágenes en Storage |
| Precios estimados | 12 productos con precio provisional | Revisar y ajustar en Fase 19 antes de producción |
| Stock provisional | 16 productos con stock = 10 | Confirmar inventario real en Fase 19 |

## Verificaciones

| Verificación | Estado | Notas |
|-------------|--------|-------|
| TypeScript compile | ✅ | Sin errores |
| Build producción | ✅ | 485 modules, 639KB JS, 185KB gzip |
| Lint | ❌ | Sin ESLint configurado |
| Tests | ❌ | Sin framework de testing |
| Secretos en código | ✅ | Ninguno encontrado |
| Git status limpio | ❌ | Working tree modificado: migraciones 00021–00023, scripts de carga, reportes QA |
| Push exitoso | ❌ | Pendiente commit/push de la sesión actual |
| Migraciones SQL | ✅ | 23 archivos (00001–00023), aplicadas a Supabase |
| Supabase remoto | ✅ | 34 tablas, RLS, funciones, seed data verificados |
| RLS | ✅ | 34 tablas, políticas completas |
| SECURITY DEFINER | ✅ | Todas con `search_path` hardening |
| Funciones RPC atómicas | ✅ | `decrement_stock`, `create_stock_reservation`, `expire_overdue_reservations` |
| Advisory lock | ✅ | `generate_order_number()` protegido |
| Bucket `products` Storage | ✅ | Público, 10 MB límite, MIME images, policies RLS |
| Imágenes en Storage | ✅ | 169 objetos, 0 duplicados, URLs públicas accesibles |
| Productos activos | ✅ | 16 productos reales activos |
| Productos demo | ✅ | 12 productos demo inactivos |
| QA catálogo | ✅ | Aprobado: 16/16 productos visibles, imágenes OK, filtros OK, detalle OK |

## Historial de sesiones

### Sesión 1 — 2026-09-04

| Campo | Valor |
|-------|-------|
| Fecha | 2026-09-04 |
| Trabajo realizado | BLOQUE A completo (Fases 0 + 1) |
| Commit | `c74b1a6` |
| Problemas | Sin `node_modules/` para verificar build |
| Siguiente acción | BLOQUE B: Backend Supabase + Autenticación |

### Sesión 2 — 2026-09-04

| Campo | Valor |
|-------|-------|
| Fecha | 2026-09-04 |
| Trabajo realizado | BLOQUE B: B1 (build) + B2 (database) + B3 (RLS) + B4 (services) + B5 (types) |
| Commits | `eae6b47`, `0d3387a` |
| Problemas | Button/ref TS error corregido; Supabase client requiere `any` type |
| Siguiente acción | Fase 3: Autenticación |

### Sesión 3 — 2026-09-05

| Campo | Valor |
|-------|-------|
| Fecha | 2026-09-05 |
| Trabajo realizado | Auditoría completa B2 + correcciones de seguridad y concurrencia |
| Cambios | 12 migraciones auditadas, 8 problemas corregidos, 1 nueva migración (00012) |
| Commits | (pendiente) |
| Siguiente acción | Fase 3: Autenticación |

### Sesión 4 — 2026-09-06

| Campo | Valor |
|-------|-------|
| Fecha | 2026-09-06 |
| Trabajo realizado | **BLOQUE G, Fase 18: Catálogo real** — carga, activación y QA |
| Cambios | 3 migraciones SQL (00021–00023), 169 imágenes en Supabase Storage, 16 productos reales activos, 12 productos demo inactivos |
| Commits | (pendiente) |
| Problemas | Ninguno crítico. Solo warnings no bloqueantes de React Router v7 y advertencia de chunk > 500 KB |
| Siguiente acción | Fase 19: Configuración de negocio (precios reales, stock real, datos de negocio) |
