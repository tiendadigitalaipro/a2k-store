import { createContext, useCallback, useMemo, useReducer, useEffect, type ReactNode } from 'react'
import type { CartAction, CartState, Product } from '@/types'

interface CartContextValue extends CartState {
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number, variantId?: string | null) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const initialState: CartState = {
  items: [],
  isOpen: false,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity = 1, variantId = null } = action.payload
      const existingIndex = state.items.findIndex(
        (item) => item.product.id === product.id && item.variantId === variantId,
      )

      // Determine available stock for this product/variant
      const availableStock = variantId
        ? product.variants?.find((v) => v.id === variantId)?.stock ?? product.stock
        : product.stock

      if (existingIndex >= 0) {
        const nextItems = [...state.items]
        const newQty = Math.min(
          nextItems[existingIndex].quantity + quantity,
          availableStock,
        )
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: newQty,
        }
        return { ...state, items: nextItems }
      }

      const clampedQty = Math.min(quantity, availableStock)
      return { ...state, items: [...state.items, { product, quantity: clampedQty, variantId }] }
    }
    case 'REMOVE_ITEM': {
      const { productId, variantId = null } = action.payload
      return {
        ...state,
        items: state.items.filter(
          (item) => !(item.product.id === productId && item.variantId === variantId),
        ),
      }
    }
    case 'UPDATE_QUANTITY': {
      const { productId, quantity, variantId = null } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.variantId === variantId),
          ),
        }
      }
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.product.id !== productId || item.variantId !== variantId) return item
          // Enforce stock limit: never allow quantity > available stock
          const maxStock = item.variantId
            ? item.product.variants?.find((v) => v.id === item.variantId)?.stock ?? item.product.stock
            : item.product.stock
          const clampedQty = Math.min(quantity, maxStock)
          return { ...item, quantity: clampedQty }
        }),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    default:
      return state
  }
}

const STORAGE_KEY = 'a2k-store-cart'

export const CartContext = createContext<CartContextValue | null>(null)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    if (typeof window === 'undefined') return init
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return init
      const parsed = JSON.parse(stored) as CartState
      return { ...init, items: parsed.items ?? [] }
    } catch {
      return init
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }))
  }, [state.items])

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items],
  )

  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, item) => {
        const price = item.variantId
          ? item.product.variants?.find((v) => v.id === item.variantId)?.price ?? item.product.price
          : item.product.price
        return sum + price * item.quantity
      }, 0),
    [state.items],
  )

  const addItem = useCallback(
    (product: Product, quantity = 1, variantId?: string | null) => {
      dispatch({ type: 'ADD_ITEM', payload: { product, quantity, variantId: variantId ?? null } })
    },
    [dispatch],
  )

  const removeItem = useCallback(
    (productId: string, variantId?: string | null) => {
      dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId: variantId ?? null } })
    },
    [dispatch],
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string | null) => {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { productId, quantity, variantId: variantId ?? null },
      })
    },
    [dispatch],
  )

  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), [dispatch])
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), [dispatch])
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), [dispatch])
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), [dispatch])

  const value = useMemo(
    () => ({
      ...state,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [state, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
