# MEMORY.md — Memoria permanente del proyecto A2K Store

## Objetivo

Construir una tienda online de producción llamada **A2K Store** para el mercado de **Venezuela**. La plataforma debe ser una tienda e-commerce real, no un prototipo ni una demo.

- Dominio: `store.a2kdigitalstudio.online`
- Moneda principal: USD (con equivalente VES)
- Mercado: Venezuela nacional
- Retiro: Ocumare del Tuy

## Arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 6, React Router 6, Tailwind CSS 4, Framer Motion 11 |
| Backend/DB | Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions) |
| Deploy | Vercel |
| Email | Resend |
| WhatsApp | Meta WhatsApp Business Platform / Cloud API |

## Stack actual (estado actual, sin commit pendiente)

- React 19 + TypeScript (strict mode) + Vite 6
- React Router 6.30
- Tailwind CSS 4 con `@tailwindcss/vite`
- Framer Motion 11.15
- Supabase conectado (PostgreSQL, Auth, Storage, RLS)
- 23 migraciones SQL aplicadas a Supabase (00001–00023)
- 16 productos reales activos con imágenes en Supabase Storage
- 12 productos demo inactivos
- Build producción exitoso: 485 modules, 639KB JS

## Decisiones de negocio confirmadas

- Moneda principal: USD
- Tasa A2K configurable desde Admin (no hard-codeada)
- Envío retail: GRATIS para el cliente (costo real registrado internamente)
- Retiro en Ocumare del Tuy
- No reembolsos monetarios — solo reemplazo de producto
- Smartwatch: garantía cubre dispositivo, no accesorios de caja sellada
- Wholesale: preparado técnicamente, no activo inicialmente
- WhatsApp es canal principal de comunicación
- Email secundario: `ceo@a2kdigitalstudio.online`
- Horario: 7:00 a.m. – 10:00 p.m.
- Número de pedido: `A2K-YYYY-NNNNNN` (secuencial por año)
- Reserva de inventario: 30 minutos (configurable)
- Descuento definitivo de stock al marcar ENTREGADO

## Decisiones técnicas confirmadas

- Supabase como fuente de verdad para todos los datos
- Capa de servicios/repositorios entre UI y Supabase
- RLS para seguridad a nivel de base de datos
- El servidor/base de datos es autoridad para precios, stock, permisos y estados
- No confiar en datos enviados por frontend
- TypeScript estricto, sin `any` innecesarios
- localStorage key para carrito: `a2k-store-cart`
- Path alias: `@/` → `./src/`

## Fases completadas

### BLOQUE A (Fases 0 + 1) — ✅ Completado
- Commit: `c74b1a6`
- Push: `origin/main`

Implementado:
- CartDrawer completo (abre/cierra, items, cantidad, eliminar, subtotal, vacío)
- CartBadge funcional (abre el drawer)
- Validación de stock en carrito (add y update)
- Galería de imágenes con thumbnails
- Selector de variantes con estado stock/activo
- Búsqueda extendida (name, desc, SKU, tags, variantes)
- Ordenamiento (relevancia, precio, novedad, rating)
- Filtros rápidos (destacados, nuevos, en stock)
- Footer links corregidos
- SEO: canonical, og:image, og:url, Twitter cards, sitemap.xml
- Accesibilidad: skip link, aria-labels
- Config actualizada con datos de negocio correctos

### BLOQUE G, Fase 18 — Catálogo real ✅ Completado
- 7 categorías reales creadas en Supabase
- Bucket `products` configurado en Supabase Storage
- 169 imágenes reales subidas a Storage
- 16 productos reales creados y activados
- 12 productos demo desactivados
- 169 registros en `product_images`
- Build producción exitoso
- QA visual y funcional aprobado
- Commit: (pendiente)

## Fases pendientes

| Fase | Descripción | Estado |
|------|-------------|--------|
| 2 | Backend y base de datos (Supabase) | ✅ Completado |
| 3 | Autenticación | ✅ Completado |
| 4 | Checkout | ⏳ |
| 5 | Inventario y reservas | ⏳ |
| 6 | Pagos | ⏳ |
| 7 | Moneda y precios | ⏳ |
| 8 | Pedidos | ⏳ |
| 9 | Envíos | ⏳ |
| 10 | Devoluciones y garantías | ⏳ |
| 11 | Admin Panel | ⏳ |
| 12 | Roles y seguridad admin | ⏳ |
| 13 | Promociones y cupones | ⏳ |
| 14 | Wishlist, reviews y Q&A | ⏳ |
| 15 | Imágenes y storage | ✅ Completado en Fase 18 |
| 16 | Categorías y marcas | ✅ Categorías reales completadas en Fase 18 |
| 17 | Notificaciones | ⏳ |
| 18 | Catálogo real | ✅ Completado |
| 19 | Configuración de negocio | ⏳ Siguiente paso |
| 20 | Testing y producción | ⏳ |

## Restricciones

- No ejecutar `npm install` sin autorización explícita
- No publicar el repositorio
- No hard-codear tasas, costes ni credenciales
- No hacer force push
- No eliminar funcionalidades existentes sin justificación
- Los 12 productos demo NO son catálogo de producción

## Bloqueos actuales

- Precios estimados: 12 productos tienen precios provisionales que requieren confirmación comercial
- Stock provisional: 16 productos tienen stock = 10 unidades que deben validarse contra inventario real
- Sin credenciales de Resend — no se puede enviar email
- Sin credenciales de WhatsApp Cloud API — no se puede enviar notificaciones
- Sin dominio configurado en Vercel — no se puede deployar

## Bloqueos resueltos

- ✅ `node_modules/` disponible — build TypeScript verificado
- ✅ Credenciales de Supabase configuradas — backend conectado
- ✅ Datos demo hard-coded — reemplazados por catálogo real en Supabase

## Información de contacto (no es secreto)

- WhatsApp principal: +58 416 411 7331
- WhatsApp secundario: +58 412 614 8666
- Email: ceo@a2kdigitalstudio.online
