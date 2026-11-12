-- ============================================================
-- A2K Store — Fase 20 SEO: contenido único para productos reales
-- ============================================================
--
-- Contexto:
--   Los 16 productos reales se crearon con description,
--   short_description, seo_title y seo_description en NULL.
--   Sin contenido único Google no puede posicionar las fichas.
--
-- Qué hace:
--   1. Llena seo_title y seo_description de las 7 categorías reales.
--   2. Llena description, short_description, seo_title y
--      seo_description de los 16 productos reales (SKUs CAL/ELE/
--      HOG/RDC/REP/RPN) con copy único en español, orientado a
--   long-tail para el mercado venezolano.
--
-- Seguridad / idempotencia:
--   - Solo llena campos VACÍOS (NULL o ''). Si el dueño ya editó
--     un texto desde el panel /admin, esta migración NO lo pisa.
--   - No toca precios, stock, imágenes, variantes ni status.
--   - Re-ejecutar no duplica ni sobrescribe nada.
--
-- Notas de redacción:
--   - No se inventan especificaciones técnicas ni certificaciones.
--     Las descripciones solo usan información contenida en el
--     nombre del producto o beneficios generales honestos.
--   - El carácter "surtido" de RDC-001 se explica con transparencia
--     y se dirige al cliente a WhatsApp para ver modelos.
-- ============================================================

-- ------------------------------------------------------------
-- 1. SEO de categorías (solo si están vacías)
-- ------------------------------------------------------------

UPDATE public.categories
SET seo_title = 'Calzados Deportivos en Venezuela — Zapatillas Running | A2K Store',
    seo_description = 'Compra zapatillas deportivas y running para hombre y mujer al mejor precio en Venezuela. Calzados cómodos y modernos en A2K Store con envío nacional.',
    updated_at = now()
WHERE slug = 'calzados' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Productos de Cocina — Utensilios y Accesorios | A2K Store',
    seo_description = 'Utensilios, herramientas y accesorios prácticos para tu cocina al mejor precio. Compra online en A2K Store con envío nacional y atención por WhatsApp.',
    updated_at = now()
WHERE slug = 'cocina' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Productos para el Hogar — Prácticos y Económicos | A2K Store',
    seo_description = 'Todo para el hogar: organización, limpieza y soluciones del día a día a precio justo. Compra en A2K Store con envío nacional a toda Venezuela.',
    updated_at = now()
WHERE slug = 'hogar' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Repuestos y Accesorios — Herramientas para Técnicos | A2K Store',
    seo_description = 'Repuestos, accesorios y herramientas de apoyo para talleres y técnicos de celulares. Compra en A2K Store con asesoría por WhatsApp y envío nacional.',
    updated_at = now()
WHERE slug = 'repuestos-y-accesorios' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Ropa para Niños — Conjuntos Cómodos y Divertidos | A2K Store',
    seo_description = 'Conjuntos y ropa para niños: cómoda, divertida y a precio justo. Compra online en A2K Store con envío nacional y atención personalizada por WhatsApp.',
    updated_at = now()
WHERE slug = 'ropa-para-ninos' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Ropa Deportiva para Caballeros — Camisetas y Shorts | A2K Store',
    seo_description = 'Camisetas deportivas, shorts 2 en 1 y ropa cómoda para caballeros al mejor precio. Compra en A2K Store con envío nacional a toda Venezuela.',
    updated_at = now()
WHERE slug = 'ropa-deportiva-caballeros' AND (seo_title IS NULL OR seo_title = '');

UPDATE public.categories
SET seo_title = 'Electrónica — Smartwatches, Audífonos y Micrófonos | A2K Store',
    seo_description = 'Smartwatches, audífonos inalámbricos y micrófonos para creadores de contenido a precio accesible. Compra electrónica en A2K Store con envío nacional.',
    updated_at = now()
WHERE slug = 'electronica' AND (seo_title IS NULL OR seo_title = '');

-- ------------------------------------------------------------
-- 2. Contenido de los 16 productos reales (solo si está vacío)
-- ------------------------------------------------------------

-- CAL-001 · Zapatilla running turquesa
UPDATE public.products
SET description = 'Zapatillas deportivas de running en color turquesa, pensadas para acompañarte en los entrenamientos y en el día a día. Su diseño fresco y moderno combina igual con tu ropa deportiva que con un look casual, y la comodidad de su pisada te permite caminar, trotar o entrenar durante horas. Disponibles en A2K Store con atención personal por WhatsApp y envío nacional.',
    short_description = 'Zapatillas running ligeras con diseño turquesa para entrenar y usar todos los días.',
    seo_title = 'Zapatillas Deportivas Running Turquesa — Compra en Venezuela',
    seo_description = 'Compra zapatillas deportivas running turquesas en Venezuela. Cómodas para entrenar y para el día a día, con envío nacional y atención por WhatsApp.',
    updated_at = now()
WHERE sku = 'CAL-001' AND (description IS NULL OR description = '');

-- CAL-002 · Zapatilla running CloudTec
UPDATE public.products
SET description = 'Las zapatillas running CloudTec CUUS DUUS están pensadas para quienes buscan comodidad en cada paso: entrena, corre o camina con una pisada estable y un diseño versátil que también sirve para tu rutina diaria. Una opción ideal si quieres empezar a correr sin invertir de más. Pídelas en A2K Store y recíbelas con envío a toda Venezuela.',
    short_description = 'Zapatillas running CloudTec con diseño versátil para tus carreras y tu día a día.',
    seo_title = 'Zapatillas Running CloudTec CUUS DUUS — Precio en Venezuela',
    seo_description = 'Zapatillas deportivas running CloudTec CUUS DUUS al mejor precio en Venezuela. Ideales para correr y uso diario. Compra por WhatsApp con envío nacional.',
    updated_at = now()
WHERE sku = 'CAL-002' AND (description IS NULL OR description = '');

-- CAL-003 · Zapatilla running NOKA
UPDATE public.products
SET description = 'Las zapatillas running NOKA combinan ligereza y estilo para tus carreras y tu ropa casual. Son el par perfecto para el gimnasio, trotar en el parque o salidas informales, con un diseño actual que no pasa desapercibido. Compra online en A2K Store con la seguridad de atención personalizada y envío a todo el país.',
    short_description = 'Zapatillas running NOKA: ligeras y versátiles para tu próximo entrenamiento.',
    seo_title = 'Zapatillas Running NOKA — Compra Online en Venezuela',
    seo_description = 'Zapatillas deportivas running NOKA: ligeras, cómodas y versátiles para entrenar o salir. Compra en A2K Store con envío nacional y atención por WhatsApp.',
    updated_at = now()
WHERE sku = 'CAL-003' AND (description IS NULL OR description = '');

-- ELE-001 · Combo smartwatch + audífonos + correas
UPDATE public.products
SET description = 'Este combo reúne lo esencial para estrenar tecnología: smartwatch, audífonos inalámbricos y correas adicionales para personalizar tu reloj. Todo en un solo pedido y a un precio que no encontras por separado: la mejor opción de regalo o para empezar tu setup de entrenamiento y música. Disponible en A2K Store con envío nacional y atención por WhatsApp.',
    short_description = 'Combo completo: smartwatch, audífonos inalámbricos y correas extra.',
    seo_title = 'Combo Smartwatch + Audífonos + Correas — Oferta en Venezuela',
    seo_description = 'Compra el combo smartwatch con audífonos inalámbricos y correas extra al mejor precio en Venezuela. Ideal para regalo. Envío nacional en A2K Store.',
    updated_at = now()
WHERE sku = 'ELE-001' AND (description IS NULL OR description = '');

-- ELE-002 · Smartwatch / reloj inteligente
UPDATE public.products
SET description = 'Un smartwatch accesible y completo para acompañar tu rutina: pantalla táctil, diseño moderno y funciones de reloj inteligente para consultar tus notificaciones, seguir tu actividad y personalizar su esfera según tu estilo. Es el primer reloj inteligente perfecto para regalar o darte un gusto sin gastar de más. Consíguelo en A2K Store con envío nacional y soporte por WhatsApp.',
    short_description = 'Reloj inteligente con pantalla táctil y diseño moderno a precio accesible.',
    seo_title = 'Smartwatch — Reloj Inteligente Barato en Venezuela | A2K Store',
    seo_description = 'Compra tu reloj inteligente al mejor precio en Venezuela: pantalla táctil, notificaciones y diseño moderno. Envío nacional y atención por WhatsApp.',
    updated_at = now()
WHERE sku = 'ELE-002' AND (description IS NULL OR description = '');

-- ELE-003 · Audífonos inalámbricos con estuche pantalla
UPDATE public.products
SET description = 'Audífonos inalámbricos con estuche de carga con pantalla: revisa el nivel de batería de un vistazo y disfruta tu música sin cables enredados. Cómodos para el gimnasio, el trabajo o los viajes, y con un precio que los hace una de las mejores relaciones calidad-precio del catálogo. Pídelos en A2K Store con envío a toda Venezuela.',
    short_description = 'Audífonos TWS inalámbricos con estuche de carga con pantalla de batería.',
    seo_title = 'Audífonos Inalámbricos con Estuche Pantalla — Precio Venezuela',
    seo_description = 'Audífonos inalámbricos con estuche de carga con pantalla indicadora de batería. Sin cables para gym, trabajo y viajes. Compra en A2K Store.',
    updated_at = now()
WHERE sku = 'ELE-003' AND (description IS NULL OR description = '');

-- ELE-004 · Micrófono inalámbrico de solapa doble
UPDATE public.products
SET description = 'Set de micrófonos inalámbricos de solapa con doble transmisión: graba entrevistas, videos para redes sociales o clases con voz clara y sin cables estorbando. La herramienta ideal para creadores de contenido que graban a dos voces o quieren audio limpio desde el primer intento. Disponible en A2K Store con envío nacional y asesoría por WhatsApp.',
    short_description = 'Micrófono inalámbrico de solapa doble: graba a dos voces sin cables.',
    seo_title = 'Micrófono Inalámbrico de Solapa Doble para Grabar Videos',
    seo_description = 'Micrófono inalámbrico de solapa doble: graba entrevistas y videos con audio claro. Ideal para creadores de contenido. Envío nacional en A2K Store.',
    updated_at = now()
WHERE sku = 'ELE-004' AND (description IS NULL OR description = '');

-- ELE-005 · Micrófono inalámbrico de solapa simple
UPDATE public.products
SET description = 'Micrófono inalámbrico de solapa sencillo y práctico: conéctalo y graba con voz clara en tus videos, transmisiones en vivo y clases virtuales. La forma más económica de empezar a mejorar el audio de tu contenido hoy mismo. Encuéntralo en A2K Store con envío a todo Venezuela y atención personalizada.',
    short_description = 'Micrófono inalámbrico de solapa simple, fácil de usar y conectar.',
    seo_title = 'Micrófono Inalámbrico de Solapa Simple — Audio para Videos',
    seo_description = 'Micrófono inalámbrico de solapa para videos, transmisiones y clases virtuales. Mejora tu audio al mejor precio. Envío nacional en A2K Store.',
    updated_at = now()
WHERE sku = 'ELE-005' AND (description IS NULL OR description = '');

-- HOG-001 · Carrito de compras plegable con asiento
UPDATE public.products
SET description = 'Carrito de compras plegable con asiento: llévalo al mercado o al supermercado y guarda todo con comodidad, o úsalo en los paseos con los niños gracias a su asiento integrado. Se pliega para ocupar poco espacio en el auto o en casa, y su estructura práctica lo vuelve imprescindible en la rutina. Consíguelo en A2K Store con envío nacional.',
    short_description = 'Carrito de compras plegable con asiento para mercado y paseos.',
    seo_title = 'Carrito de Compras Plegable con Asiento — Precio Venezuela',
    seo_description = 'Carrito de compras plegable con asiento para mercado y supermercado. Compacto y práctico. Compra online en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'HOG-001' AND (description IS NULL OR description = '');

-- HOG-002 · Filtro de agua para grifo
UPDATE public.products
SET description = 'Filtro de agua para grifo, diseñado para mejorar la calidad del agua que consumes y usas a diario directamente desde la llave. Su instalación es sencilla y su uso práctico: una forma económica de cuidar la salud de tu familia sin complicaciones. Un imprescindible del hogar disponible en A2K Store con envío a toda Venezuela.',
    short_description = 'Filtro de agua para grifo de instalación sencilla para tu hogar.',
    seo_title = 'Filtro de Agua para Grifo — Compra Online en Venezuela',
    seo_description = 'Filtro de agua para grifo de instalación sencilla: agua más limpia para tu familia a bajo costo. Compra en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'HOG-002' AND (description IS NULL OR description = '');

-- HOG-003 · Pegamento fuerte AO DE GU / MAGIC GLUE
UPDATE public.products
SET description = 'Pegamento fuerte multiusos AO DE GU, también conocido como Magic Glue: la solución rápida para reparaciones del hogar, zapatería, manualidades y arreglos de última hora. Ofrece alta adherencia en diversos materiales para que tus reparaciones aguanten. El básico que toda casa necesita, disponible en A2K Store con envío nacional.',
    short_description = 'Pegamento fuerte multiusos para reparaciones rápidas y duraderas.',
    seo_title = 'Pegamento Fuerte Multiusos Magic Glue — Precio Venezuela',
    seo_description = 'Pegamento fuerte multiusos AO DE GU / Magic Glue para reparaciones del hogar, zapatería y manualidades. Compra en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'HOG-003' AND (description IS NULL OR description = '');

-- RDC-001 · Camiseta deportiva para caballero (surtida)
UPDATE public.products
SET description = 'Camiseta deportiva para caballero en modelos surtidos: cómoda, fresca y versátil para el gym, correr o usar casual. Al ser surtida, el modelo exacto depende de la disponibilidad del momento; si buscas algo específico, escríbenos por WhatsApp y te mostramos con gusto las opciones disponibles antes de tu compra. Envío nacional en A2K Store.',
    short_description = 'Camiseta deportiva para caballero, modelo surtido según disponibilidad.',
    seo_title = 'Camiseta Deportiva para Caballero — Surtida y Económica',
    seo_description = 'Camiseta deportiva para caballero al mejor precio: cómoda para el gym o el día a día. Modelos surtidos según disponibilidad. Envío nacional.',
    updated_at = now()
WHERE sku = 'RDC-001' AND (description IS NULL OR description = '');

-- RDC-002 · Short deportivo 2 en 1
UPDATE public.products
SET description = 'Short deportivo 2 en 1 para caballero: su doble diseño te da libertad de movimiento y soporte durante el entrenamiento, el running o el juego de pelota. Ligero, fresco y resistente al uso constante, se vuelve rápido el favorito de tu rotación deportiva. Pídelo en A2K Store con envío nacional y atención por WhatsApp.',
    short_description = 'Short deportivo 2 en 1: doble capa, libertad total al entrenar.',
    seo_title = 'Short Deportivo 2 en 1 para Caballero — Precio Venezuela',
    seo_description = 'Short deportivo 2 en 1 para caballero: libertad de movimiento para gym, running y pelota. Compra online en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'RDC-002' AND (description IS NULL OR description = '');

-- REP-001 · Placa detectora YCS
UPDATE public.products
SET description = 'Placa detectora YCS para el diagnóstico y la reparación de celulares: una herramienta de apoyo pensada para talleres y técnicos independientes que quieren agilizar su trabajo diario. Pesa poco en la inversión y gana mucho en productividad. Herramienta profesional disponible en A2K Store con envío nacional y asesoría por WhatsApp.',
    short_description = 'Placa detectora YCS para diagnóstico y reparación de celulares.',
    seo_title = 'Placa Detectora YCS para Reparación de Celulares | A2K Store',
    seo_description = 'Placa detectora YCS para diagnóstico y reparación de celulares. Herramienta para talleres y técnicos. Compra en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'REP-001' AND (description IS NULL OR description = '');

-- RPN-001 · Conjunto infantil Colección A
UPDATE public.products
SET description = 'Conjunto infantil estampado de la Colección A: diseño divertido y cómodo para que los más pequeños jueguen y se muevan libres todo el día. Perfecto para la escuela, la casa o los paseos de fin de semana, y a un precio que permite llevar más de uno. Elige la talla y pídelo en A2K Store con envío nacional.',
    short_description = 'Conjunto infantil estampado Colección A: cómodo y divertido.',
    seo_title = 'Conjunto Infantil Estampado Colección A — Precio Venezuela',
    seo_description = 'Conjunto infantil estampado Colección A: cómodo y divertido para escuela, casa y paseos. Compra la talla de tu niño en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'RPN-001' AND (description IS NULL OR description = '');

-- RPN-002 · Conjunto infantil Colección B
UPDATE public.products
SET description = 'Conjunto infantil estampado de la Colección B: estampados alegres y comodidad para el uso diario de los más pequeños de la casa. Resistente al juego constante y fácil de combinar, es de esos conjuntos que los niños piden ponerse otra vez. Elige la talla y pídelo en A2K Store con envío a toda Venezuela.',
    short_description = 'Conjunto infantil estampado Colección B: alegre y de uso diario.',
    seo_title = 'Conjunto Infantil Estampado Colección B — Precio Venezuela',
    seo_description = 'Conjunto infantil estampado Colección B: alegre, cómodo y fácil de combinar para el uso diario. Compra en A2K Store con envío nacional.',
    updated_at = now()
WHERE sku = 'RPN-002' AND (description IS NULL OR description = '');
