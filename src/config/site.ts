export const SITE = {
  name: 'A2K Store',
  tagline: 'Tecnología que se siente premium',
  description:
    'Descubre productos tecnológicos seleccionados con diseño, calidad y una experiencia de compra moderna.',
  // Dominio canónico: se toma de VITE_SITE_URL si existe (Vercel), con fallback
  // al dominio propio. Al activar store.a2kdigitalstudio.online bastará con
  // cambiar la variable VITE_SITE_URL en Vercel, sin tocar código.
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
    'https://store.a2kdigitalstudio.online',
  locale: 'es',
  currency: 'USD',
  currencySymbol: '$',
  contact: {
    email: 'ceo@a2kdigitalstudio.online',
    // Único canal telefónico: WhatsApp (lo pidió el dueño, 2026-11-19).
    phone: '+58 416 411 7331',
    whatsapp: '584164117331',
  },
  business: {
    name: 'A2K Store',
    hours: '7:00 a.m. – 10:00 p.m.',
    pickup: 'Ocumare del Tuy',
    pickupAddress: 'Urbanización Ciudad Betania, Ocumare del Tuy, Estado Miranda',
    market: 'Venezuela',
  },
} as const
