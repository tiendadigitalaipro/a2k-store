import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import Home from '@/pages/Home'
import Catalog from '@/pages/Catalog'
import ProductDetail from '@/pages/ProductDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import Account from '@/pages/Account'
import NotFound from '@/pages/NotFound'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes with layout */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
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

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Auth routes (no layout) */}
      <Route path="login" element={<Login />} />
      <Route path="registro" element={<Register />} />
      <Route path="recuperar-password" element={<ForgotPassword />} />
    </Routes>
  )
}
