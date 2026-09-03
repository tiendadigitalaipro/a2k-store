/**
 * Services — public API
 *
 * All business logic goes through services.
 * UI components never call Supabase directly.
 */

export * as catalogService from './catalog'
export * as inventoryService from './inventory'
export * as ordersService from './orders'
export * as paymentsService from './payments'
export * as settingsService from './settings'
export * as authService from './auth'
