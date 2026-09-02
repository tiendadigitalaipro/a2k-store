export interface Category {
  id: string
  slug: string
  name: string
  description: string
  imageUrl?: string
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  shortDescription: string
  price: number
  compareAtPrice?: number
  currency: string
  imageUrl: string
  gallery?: string[]
  categoryId: Category['id']
  categorySlug?: string
  categoryName?: string
  stock: number
  sku: string
  tags: string[]
  variants?: ProductVariant[]
  isFeatured: boolean
  isNew: boolean
  rating?: number
  reviewCount?: number
}

export interface CartItem {
  product: Product
  quantity: number
  variantId?: string | null
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number; variantId?: string | null } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId?: string | null } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId?: string | null; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
