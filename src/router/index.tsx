import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Catalog from '@/pages/Catalog'
import ProductDetail from '@/pages/ProductDetail'
import NotFound from '@/pages/NotFound'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="producto/:slug" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
