import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Code-splitting por ruta (Fase 20): cada página carga en chunks separados
// para reducir el bundle inicial. El admin y checkout solo se descargan
// cuando el usuario entra a esas rutas.
const Home = lazy(() => import('@/pages/Home'))
const Catalog = lazy(() => import('@/pages/Catalog'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Login = lazy(() => import('@/pages/Login'))
const Register = lazy(() => import('@/pages/Register'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const AuthCallback = lazy(() => import('@/pages/AuthCallback'))
const Account = lazy(() => import('@/pages/Account'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const CheckoutConfirmation = lazy(() => import('@/pages/CheckoutConfirmation'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const AdminLayout = lazy(() =>
  import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public routes with layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="catalogo" element={<Catalog />} />
          {/* Página de categoría con URL propia (Fase 20 SEO): /categoria/:slug */}
          <Route path="categoria/:slug" element={<Catalog />} />
          <Route path="producto/:slug" element={<ProductDetail />} />

          {/* Protected routes */}
          <Route
            path="mi-cuenta"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="checkout/confirmado"
            element={
              <ProtectedRoute>
                <CheckoutConfirmation />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Auth routes (no layout) */}
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="recuperar-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="auth/callback" element={<AuthCallback />} />

        {/* Admin (Fase 19): rol admin/superadmin, respaldado por RLS */}
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="pedidos" element={<AdminOrders />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
