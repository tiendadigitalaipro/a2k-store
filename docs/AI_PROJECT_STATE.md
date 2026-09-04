# A2K STORE — ESTADO DEL PROYECTO

> Este es el documento principal de handoff entre sesiones.  
> Leerlo al inicio de cada sesión nueva.

## Estado actual

| Campo | Valor |
|-------|-------|
| Fase actual | 3 (Autenticación) |
| Bloque actual | B (Fases 2 + 3) |
| Último bloque completado | A (Fases 0 + 1) |
| Último commit | `fc90d90` (docs: actualizar estado post-bloque-b) |
| Rama | `main` |
| Remote | `origin` → `git@github.com:tiendadigitalaipro/a2k-store.git` |
| Estado del repositorio | Limpio, sincronizado con origin/main |

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

**B2 — Database schema (Supabase) ✅ (auditado y corregido)**
- [x] 12 migraciones SQL (00001–00012)
- [x] 33 tablas con RLS habilitado
- [x] Enums completos (incluye `customer` role)
- [x] Helper functions con `search_path` hardening
- [x] Funciones RPC atómicas para inventario
- [x] Order number generation con advisory lock
- [x] Stock reservation con validación de concurrencia
- [x] Service layer completo (6 servicios)
- [x] TypeScript types completos para todas las tablas

## Pendiente

### BLOQUE B — Backend y autenticación
- [ ] Fase 3: Autenticación (registro, login, verificación email, recuperación)

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
- [ ] Fase 15: Imágenes y storage
- [ ] Fase 16: Categorías y marcas
- [ ] Fase 17: Notificaciones

### BLOQUE G — Producción
- [ ] Fase 18: Catálogo real
- [ ] Fase 19: Configuración de negocio
- [ ] Fase 20: Testing y producción

## Próximo paso

**BLOQUE B, Fase 3: Autenticación** — Conectar Supabase Auth con el service layer existente.

Acciones concretas:
1. Implementar AuthContext con React Context
2. Crear páginas de Login, Registro, Recuperar contraseña
3. Conectar authService con la UI
4. Crear perfil de cliente automáticamente al registrarse
5. Proteger rutas según rol
6. Commit y push

**Dependencia:** Requiere credenciales de Supabase (URL + anon key) para conexión real. Sin credenciales, la arquitectura está lista para conectar.

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
├── data/            products.ts, categories.ts (DEMO — será reemplazado)
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
    ├── 00005_create_orders.sql
    ├── 00006_create_payments.sql
    ├── 00007_create_shipping.sql
    ├── 00008_create_promotions_coupons.sql
    ├── 00009_create_reviews_qa_wishlist.sql
    ├── 00010_create_notifications_settings_audit.sql
    ├── 00011_enable_rls.sql
    └── 00012_add_stock_rpc_functions.sql
```

## Riesgos / Bloqueos

| Bloqueo | Impacto | Mitigación |
|---------|---------|------------|
| Sin credenciales Supabase | No se puede conectar backend | Arquitectura lista, falta URL + anon key |
| Sin credenciales Resend | No se puede enviar email | Dejar interfaz preparada, marcar bloqueo |
| Sin credenciales WhatsApp | No se puede enviar notificaciones | Crear abstracción de proveedor configurable |
| Sin dominio Vercel | No se puede deployar | Preparar configuración, documentar proceso |
| Datos demo hard-coded | No son catálogo real | Fase 18 reemplazará con catálogo real desde Admin |

## Verificaciones

| Verificación | Estado | Notas |
|-------------|--------|-------|
| TypeScript compile | ✅ | Sin errores |
| Build producción | ✅ | 422 modules, 380KB JS |
| Lint | ❌ | Sin ESLint configurado |
| Tests | ❌ | Sin framework de testing |
| Secretos en código | ✅ | Ninguno encontrado |
| Git status limpio | ✅ | Working tree clean |
| Push exitoso | ✅ | `fc90d90` en origin/main |
| Migraciones SQL | ✅ | 12 archivos, orden correcto, dependencias verificadas |
| RLS | ✅ | 33 tablas, políticas completas |
| SECURITY DEFINER | ✅ | Todas con `search_path` hardening |
| Funciones RPC atómicas | ✅ | `decrement_stock`, `create_stock_reservation`, `expire_overdue_reservations` |
| Advisory lock | ✅ | `generate_order_number()` protegido |

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
