-- ============================================================
-- A2K Store — Seed catalog (Phase 4)
-- ============================================================
-- Additive migration. Seeds sample categories and products so the
-- catalog and checkout become functional immediately.
--
-- Images use Unsplash URLs for demo purposes. Replace with real
-- product images through the admin panel or a later migration.
--
-- This migration is ready to apply but requires explicit approval
-- before running `supabase db push`.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Seed categories
-- ------------------------------------------------------------
INSERT INTO public.categories (name, slug, description, image_url, sort_order, is_active) VALUES
  ('Tecnología', 'tecnologia', 'Laptops, tablets y dispositivos de última generación.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80', 1, true),
  ('Audio', 'audio', 'Auriculares, parlantes y experiencias sonoras premium.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 2, true),
  ('Wearables', 'wearables', 'Relojes inteligentes y accesorios que te acompañan.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 3, true),
  ('Fotografía', 'fotografia', 'Cámaras y equipos para capturar cada momento.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 4, true),
  ('Accesorios', 'accesorios', 'Teclados, mouse, mochilas y todo lo que necesitas.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 5, true),
  ('Gaming', 'gaming', 'Periféricos y equipos para gamers exigentes.', 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&q=80', 6, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- ------------------------------------------------------------
-- 2. Seed products
-- ------------------------------------------------------------
INSERT INTO public.products (
  name, slug, sku, description, short_description, category_id,
  status, price, compare_at_price, currency, stock, stock_reserved, stock_minimum,
  is_featured, is_new, tags
) VALUES
  ('MacBook Air M3', 'macbook-air-m3', 'MBA-M3-13',
   'El MacBook Air con chip M3 redefine la portabilidad: rendimiento profesional, batería para todo el día y una pantalla Liquid Retina espectacular en un diseño increíblemente delgado y ligero.',
   'Potencia ultrafina con el chip M3.',
   (SELECT id FROM public.categories WHERE slug = 'tecnologia'),
   'active', 1199, 1299, 'USD', 8, 0, 0, true, true, ARRAY['laptop', 'apple', 'destacado']),

  ('Sony WH-1000XM5', 'sony-wh-1000xm5', 'SONY-XM5-BLK',
   'Los auriculares con cancelación de ruido líderes en la industria. Dos procesadores QN1 controlan ocho micrófonos para una cancelación de ruido sin precedentes y un audio de alta fidelidad.',
   'Silencio perfecto, sonido premium.',
   (SELECT id FROM public.categories WHERE slug = 'audio'),
   'active', 348, 399, 'USD', 15, 0, 0, true, false, ARRAY['audio', 'cancelacion', 'destacado']),

  ('Apple Watch Ultra 2', 'apple-watch-ultra-2', 'AWU2-49',
   'Caja de titanio de grado aeroespacial, pantalla Retina siempre activa de 3000 nits y funciones avanzadas para deportes extremos y aventuras al aire libre.',
   'El reloj más resistente y capaz.',
   (SELECT id FROM public.categories WHERE slug = 'wearables'),
   'active', 799, NULL, 'USD', 6, 0, 0, false, true, ARRAY['reloj', 'fitness', 'nuevo']),

  ('Canon EOS R6', 'canon-eos-r6', 'CANON-R6-BODY',
   'Cámara mirrorless full frame con estabilización de imagen de 8 pasos, enfoque automático Dual Pixel CMOS AF II y grabación de video 4K a 60 fps para creadores exigentes.',
   'Captura la acción sin límites.',
   (SELECT id FROM public.categories WHERE slug = 'fotografia'),
   'active', 2499, 2799, 'USD', 4, 0, 0, true, false, ARRAY['camara', 'video', 'destacado']),

  ('Keychron Q1 Pro', 'keychron-q1-pro', 'KCR-Q1-PRO',
   'Teclado mecánico QMK/VIA de cuerpo completo con conectividad Bluetooth y cableada, caja de aluminio y switches hot-swappable para una experiencia de escritura personalizada.',
   'Teclado mecánico inalámbrico premium.',
   (SELECT id FROM public.categories WHERE slug = 'accesorios'),
   'active', 199, NULL, 'USD', 20, 0, 0, false, true, ARRAY['teclado', 'mecanico']),

  ('Logitech MX Master 3S', 'logitech-mx-master-3s', 'LOG-MX3S',
   'Mouse inalámbrico ergonómico con sensor de 8000 DPI, rueda de desplazamiento electromagnética y clicks silenciosos. Diseñado para profesionales que exigen productividad.',
   'Precisión y ergonomía sin igual.',
   (SELECT id FROM public.categories WHERE slug = 'accesorios'),
   'active', 99, 109, 'USD', 30, 0, 0, true, false, ARRAY['mouse', 'productividad']),

  ('iPhone 15 Pro', 'iphone-15-pro', 'IP15P-128',
   'Diseño en titanio de calidad aeroespacial, chip A17 Pro revolucionario y un sistema de cámaras versátil que te permite capturar imágenes increíbles con control total.',
   'Titanio. Chip A17 Pro. Zoom extremo.',
   (SELECT id FROM public.categories WHERE slug = 'tecnologia'),
   'active', 999, 1099, 'USD', 12, 0, 0, false, true, ARRAY['smartphone', 'apple']),

  ('iPad Pro M4', 'ipad-pro-m4', 'IPAD-M4-11',
   'La pantalla Ultra Retina XDR más avanzada, el potente chip M4 y un diseño increíblemente delgado convierten al iPad Pro en una herramienta creativa sin límites.',
   'Delgadísimo. Poderosísimo.',
   (SELECT id FROM public.categories WHERE slug = 'tecnologia'),
   'active', 1099, NULL, 'USD', 7, 0, 0, false, true, ARRAY['tablet', 'apple']),

  ('Sonos Era 100', 'sonos-era-100', 'SONOS-ERA100',
   'Altavoz inteligente con audio estéreo en un solo dispositivo, conectividad WiFi y Bluetooth, y compatibilidad con asistentes de voz para una experiencia sonora versátil.',
   'Sonido envolvente para cualquier espacio.',
   (SELECT id FROM public.categories WHERE slug = 'audio'),
   'active', 249, NULL, 'USD', 10, 0, 0, false, false, ARRAY['altavoz', 'smart']),

  ('Meta Quest 3', 'meta-quest-3', 'META-Q3-128',
   'Gafas de realidad mixta con gráficos 4K+ Infinite Display, sonido espacial y un catálogo inmenso de juegos y experiencias inmersivas para explorar sin cables.',
   'La realidad mixta más avanzada.',
   (SELECT id FROM public.categories WHERE slug = 'gaming'),
   'active', 499, 549, 'USD', 5, 0, 0, true, true, ARRAY['vr', 'gaming', 'nuevo']),

  ('Dell XPS 15', 'dell-xps-15', 'DELL-XPS15-OLED',
   'Laptop premium con pantalla InfinityEdge OLED, procesador Intel Core i7 de última generación y gráficos NVIDIA RTX para creadores y profesionales exigentes.',
   'Rendimiento creativo en un cuerpo elegante.',
   (SELECT id FROM public.categories WHERE slug = 'tecnologia'),
   'active', 1799, 1949, 'USD', 3, 0, 0, false, false, ARRAY['laptop', 'creatividad']),

  ('Bose QuietComfort Ultra', 'bose-quietcomfort-ultra', 'BOSE-QC-ULT',
   'Auriculares con cancelación de ruido personalizada, audio espacial y un ajuste cómodo para escuchar tu música favorita con una calidad excepcional durante horas.',
   'Audio inmersivo con audio espacial.',
   (SELECT id FROM public.categories WHERE slug = 'audio'),
   'active', 429, NULL, 'USD', 9, 0, 0, false, true, ARRAY['audio', 'premium'])
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sku = EXCLUDED.sku,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category_id = EXCLUDED.category_id,
  status = EXCLUDED.status,
  price = EXCLUDED.price,
  compare_at_price = EXCLUDED.compare_at_price,
  currency = EXCLUDED.currency,
  stock = EXCLUDED.stock,
  is_featured = EXCLUDED.is_featured,
  is_new = EXCLUDED.is_new,
  tags = EXCLUDED.tags,
  updated_at = now();

-- ------------------------------------------------------------
-- 3. Seed product variants
-- ------------------------------------------------------------
INSERT INTO public.product_variants (
  product_id, name, sku, attributes, price, stock, stock_reserved, stock_minimum, is_active, sort_order
) VALUES
  ((SELECT id FROM public.products WHERE slug = 'macbook-air-m3'), '13 pulgadas', 'MBA-M3-13', '{"pantalla":"13"}'::jsonb, 1199, 5, 0, 0, true, 1),
  ((SELECT id FROM public.products WHERE slug = 'macbook-air-m3'), '15 pulgadas', 'MBA-M3-15', '{"pantalla":"15"}'::jsonb, 1399, 3, 0, 0, true, 2),
  ((SELECT id FROM public.products WHERE slug = 'iphone-15-pro'), '128 GB', 'IP15P-128', '{"capacidad":"128GB"}'::jsonb, 999, 7, 0, 0, true, 1),
  ((SELECT id FROM public.products WHERE slug = 'iphone-15-pro'), '256 GB', 'IP15P-256', '{"capacidad":"256GB"}'::jsonb, 1099, 5, 0, 0, true, 2)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  attributes = EXCLUDED.attributes,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ------------------------------------------------------------
-- 4. Seed product images
-- ------------------------------------------------------------
INSERT INTO public.product_images (product_id, url, alt_text, sort_order) VALUES
  ((SELECT id FROM public.products WHERE slug = 'macbook-air-m3'), 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&q=80', 'MacBook Air M3', 1),
  ((SELECT id FROM public.products WHERE slug = 'macbook-air-m3'), 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1200&q=80', 'MacBook Air M3 vista lateral', 2),
  ((SELECT id FROM public.products WHERE slug = 'sony-wh-1000xm5'), 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 'Sony WH-1000XM5', 1),
  ((SELECT id FROM public.products WHERE slug = 'apple-watch-ultra-2'), 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 'Apple Watch Ultra 2', 1),
  ((SELECT id FROM public.products WHERE slug = 'canon-eos-r6'), 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Canon EOS R6', 1),
  ((SELECT id FROM public.products WHERE slug = 'keychron-q1-pro'), 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 'Keychron Q1 Pro', 1),
  ((SELECT id FROM public.products WHERE slug = 'logitech-mx-master-3s'), 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80', 'Logitech MX Master 3S', 1),
  ((SELECT id FROM public.products WHERE slug = 'iphone-15-pro'), 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80', 'iPhone 15 Pro', 1),
  ((SELECT id FROM public.products WHERE slug = 'ipad-pro-m4'), 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b1?w=800&q=80', 'iPad Pro M4', 1),
  ((SELECT id FROM public.products WHERE slug = 'sonos-era-100'), 'https://images.unsplash.com/photo-1608043152269-73f1b1d2cf54?w=800&q=80', 'Sonos Era 100', 1),
  ((SELECT id FROM public.products WHERE slug = 'meta-quest-3'), 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?w=800&q=80', 'Meta Quest 3', 1),
  ((SELECT id FROM public.products WHERE slug = 'dell-xps-15'), 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&q=80', 'Dell XPS 15', 1),
  ((SELECT id FROM public.products WHERE slug = 'bose-quietcomfort-ultra'), 'https://images.unsplash.com/photo-1583394838336-acd977856f86?w=800&q=80', 'Bose QuietComfort Ultra', 1);
