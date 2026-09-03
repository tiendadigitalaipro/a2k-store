# A2K STORE — ESTADO DEL PROYECTO

> Este es el documento principal de handoff entre sesiones.  
> Leerlo al inicio de cada sesión nueva.

## Estado actual

| Campo | Valor |
|-------|-------|
| Fase actual | 2 (Backend y base de datos) |
| Bloque actual | B (Fases 2 + 3) |
| Último bloque completado | A (Fases 0 + 1) |
| Último commit | `0a1423d docs: persistencia y continuidad del proyecto A2K Store` |
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

## Pendiente

### BLOQUE B — Backend y autenticación
- [ ] Fase 2: Supabase (esquema, Auth, RLS, Storage, migraciones)
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

**BLOQUE B, Fase 2: Backend y base de datos con Supabase**

Acciones concretas:
1. Ejecutar `npm install` (requiere autorización)
2. Verificar build con `npm run build`
3. Diseñar esquema de base de datos (migraciones SQL)
4. Crear modelos: users, products, variants, categories, brands, orders, etc.
5. Configurar Supabase client
6. Crear capa de servicios/repositorios
7. Implementar RLS policies
8. Commit y push

**Dependencia:** Requiere credenciales de Supabase (URL + anon key) para conectar. Si no se proporcionan, implementar la arquitectura de servicios sin conexión real y marcar el bloqueo.

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
├── lib/             format.ts, utils.ts
├── pages/           Home, Catalog, ProductDetail, NotFound
├── router/          index.tsx
└── types/           index.ts
```

## Riesgos / Bloqueos

| Bloqueo | Impacto | Mitigación |
|---------|---------|------------|
| Sin `node_modules/` | No se puede verificar build | Ejecutar `npm install` con autorización |
| Sin credenciales Supabase | No se puede conectar backend | Implementar arquitectura de servicios sin conexión real |
| Sin credenciales Resend | No se puede enviar email | Dejar interfaz preparada, marcar bloqueo |
| Sin credenciales WhatsApp | No se puede enviar notificaciones | Crear abstracción de proveedor configurable |
| Sin dominio Vercel | No se puede deployar | Preparar configuración, documentar proceso |
| Datos demo hard-coded | No son catálogo real | Fase 18 reemplazará con catálogo real desde Admin |

## Verificaciones

| Verificación | Estado | Notas |
|-------------|--------|-------|
| TypeScript compile | ❌ No verificado | Requiere `npm install` |
| Build producción | ❌ No verificado | Requiere `npm install` |
| Lint | ❌ No verificado | Sin ESLint configurado |
| Tests | ❌ No verificado | Sin framework de testing |
| Secretos en código | ✅ Verificado | Ninguno encontrado |
| Git status limpio | ✅ Verificado | Working tree clean |
| Push exitoso | ✅ Verificado | `c74b1a6` en origin/main |

## Historial de sesiones

### Sesión 1 — 2026-09-04

| Campo | Valor |
|-------|-------|
| Fecha | 2026-09-04 |
| Trabajo realizado | BLOQUE A completo (Fases 0 + 1) |
| Commit | `c74b1a6` |
| Problemas | Sin `node_modules/` para verificar build |
| Siguiente acción | BLOQUE B: Backend Supabase + Autenticación |
