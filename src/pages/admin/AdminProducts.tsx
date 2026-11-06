/**
 * Admin Products (Fase 19) — LA SECCIÓN CLAVE PARA EL DUEÑO
 *
 * El dueño puede, desde aquí y sin tocar código:
 *  - Crear y editar productos (precio, compare_at, stock, SKU, categoría,
 *    etiquetas, destacado/nuevo, estado activo/inactivo).
 *  - Subir las fotos de los productos que va trayendo (Storage `products`,
 *    JPG/PNG/WebP/GIF hasta 10 MB), definir la foto principal y borrar fotos.
 *  - Gestionar variantes (talla/color/modelo) con precio y stock propios.
 *
 * Toda escritura está respaldada por RLS (solo admin activo).
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  listAdminProducts,
  listCategories,
  createProduct,
  updateProduct,
  archiveProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
  slugify,
  type AdminProductFull,
  type AdminCategory,
  type AdminVariant,
  type AdminImage,
} from '@/services/admin'
import { formatPrice } from '@/lib/format'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Modal editor
// ─────────────────────────────────────────────────────────────

interface EditorState {
  id: string | null
  name: string
  slug: string
  short_description: string
  description: string
  price: string
  compare_at_price: string
  stock: string
  sku: string
  tags: string
  status: 'active' | 'inactive' | 'archived'
  is_featured: boolean
  is_new: boolean
  category_id: string
}

const emptyEditor: EditorState = {
  id: null,
  name: '',
  slug: '',
  short_description: '',
  description: '',
  price: '',
  compare_at_price: '',
  stock: '0',
  sku: '',
  tags: '',
  status: 'active',
  is_featured: false,
  is_new: true,
  category_id: '',
}

function statusBadge(status: AdminProductFull['status']) {
  if (status === 'active') return <Badge variant="success">Activo</Badge>
  if (status === 'inactive') return <Badge variant="warning">Pausado</Badge>
  return <Badge variant="outline">Archivado</Badge>
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProductFull[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all')

  // Editor
  const [editing, setEditing] = useState<EditorState | null>(null)
  const [editingFull, setEditingFull] = useState<AdminProductFull | null>(null)
  const [saving, setSaving] = useState(false)
  const [editorError, setEditorError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [{ data, error }, { data: cats }] = await Promise.all([listAdminProducts(), listCategories()])
    if (error) setListError(error)
    else setProducts(data)
    setCategories(cats)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openEditor = (product?: AdminProductFull) => {
    setEditorError(null)
    setNotice(null)
    if (product) {
      setEditingFull(product)
      setEditing({
        id: product.id,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        description: product.description,
        price: String(product.price),
        compare_at_price: product.compare_at_price ? String(product.compare_at_price) : '',
        stock: String(product.stock),
        sku: product.sku,
        tags: (product.tags ?? []).join(', '),
        status: product.status,
        is_featured: product.is_featured,
        is_new: product.is_new,
        category_id: product.category_id ?? '',
      })
    } else {
      setEditingFull(null)
      setEditing({ ...emptyEditor })
    }
  }

  const handleNameBlur = () => {
    setEditing((e) => (e && !e.slug ? { ...e, slug: slugify(e.name) } : e))
  }

  const handleSave = async (ev?: FormEvent) => {
    ev?.preventDefault()
    if (!editing) return
    setEditorError(null)

    const price = Number(editing.price.replace(',', '.'))
    if (!editing.name.trim()) return setEditorError('El nombre es obligatorio.')
    if (!Number.isFinite(price) || price <= 0) return setEditorError('Escribe un precio válido.')

    const compare = editing.compare_at_price.trim()
      ? Number(editing.compare_at_price.replace(',', '.'))
      : null
    if (compare !== null && (!Number.isFinite(compare) || compare <= price)) {
      return setEditorError('El precio "antes" debe ser mayor que el precio actual (para mostrar el descuento).')
    }

    setSaving(true)
    const payload = {
      name: editing.name.trim(),
      slug: editing.slug.trim() || slugify(editing.name),
      short_description: editing.short_description.trim(),
      description: editing.description.trim(),
      price,
      compare_at_price: compare,
      stock: Math.max(0, Math.trunc(Number(editing.stock) || 0)),
      sku: editing.sku.trim(),
      tags: editing.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: editing.status,
      is_featured: editing.is_featured,
      is_new: editing.is_new,
      category_id: editing.category_id || null,
    }

    let fresh: AdminProductFull | undefined

    if (editing.id) {
      const { error: upError } = await updateProduct(editing.id, payload)
      if (upError) {
        setEditorError(upError)
        setSaving(false)
        return
      }
      const { data } = await listAdminProducts()
      fresh = data.find((p) => p.id === editing.id)
      setNotice('Cambios guardados.')
    } else {
      const { data: created, error: createError } = await createProduct(payload)
      if (createError || !created) {
        setEditorError(createError ?? 'No se pudo crear el producto.')
        setSaving(false)
        return
      }
      const { data } = await listAdminProducts()
      fresh = data.find((p) => p.id === created.id)
      setNotice('Producto creado. Ya puedes subirle fotos y agregar variantes.')
    }

    if (fresh) {
      setEditingFull(fresh)
      setEditing({
        id: fresh.id,
        name: fresh.name,
        slug: fresh.slug,
        short_description: fresh.short_description,
        description: fresh.description,
        price: String(fresh.price),
        compare_at_price: fresh.compare_at_price ? String(fresh.compare_at_price) : '',
        stock: String(fresh.stock),
        sku: fresh.sku,
        tags: (fresh.tags ?? []).join(', '),
        status: fresh.status,
        is_featured: fresh.is_featured,
        is_new: fresh.is_new,
        category_id: fresh.category_id ?? '',
      })
    } else {
      setEditing(null)
    }
    setSaving(false)
  }

  const handleArchive = async (product: AdminProductFull) => {
    const msg =
      product.status === 'archived'
        ? `¿Restaurar "${product.name}" al catálogo?`
        : `¿Archivar "${product.name}"? Desaparece de la tienda sin borrar su historial.`
    if (!window.confirm(msg)) return
    const target = product.status === 'archived' ? 'inactive' : 'archived'
    const { error } =
      target === 'archived'
        ? await archiveProduct(product.id)
        : await updateProduct(product.id, { status: 'inactive' })
    if (error) setListError(error)
    await load()
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const okStatus = filter === 'all' || p.status === filter
      const okQuery = !q || p.name.toLowerCase().includes(q) || p.slug.includes(q) || p.sku.toLowerCase().includes(q)
      return okStatus && okQuery
    })
  }, [products, query, filter])

  // ── Render ──
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Productos</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? 'Cargando…' : `${products.length} productos · el catálogo público solo muestra los activos`}
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Icon name="plus" size={16} />
          Nuevo producto
        </Button>
      </div>

      {listError && (
        <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {listError}{' '}
          <button className="underline" onClick={() => setListError(null)}>
            cerrar
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, slug o SKU…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                filter === f ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-elevated',
              )}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'inactive' ? 'Pausados' : 'Archivados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Cargando productos…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No hay productos que coincidan. Crea el primero con «Nuevo producto».
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-elevated">
                      {p.images[0]?.url ? (
                        <img src={p.images[0].url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Icon name="image" size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        /{p.slug}
                        {p.variants.length > 0 && ` · ${p.variants.length} variantes`}
                        {` · ${p.images.length} fotos`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{formatPrice(Number(p.price))}</span>
                  {p.compare_at_price && (
                    <span className="ml-1.5 text-xs text-muted-foreground line-through">
                      {formatPrice(Number(p.compare_at_price))}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(Number(p.stock) <= 0 && 'text-danger')}>{p.stock}</span>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">{statusBadge(p.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => openEditor(p)}>
                      <Icon name="edit" size={14} />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(p)} title="Archivar/restaurar">
                      <Icon name="trash" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          editing={editing}
          setEditing={setEditing}
          full={editingFull}
          categories={categories}
          saving={saving}
          error={editorError}
          notice={notice}
          onNameBlur={handleNameBlur}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          onReload={load}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Editor + imágenes + variantes
// ─────────────────────────────────────────────────────────────

interface EditorProps {
  editing: EditorState
  setEditing: React.Dispatch<React.SetStateAction<EditorState | null>>
  full: AdminProductFull | null
  categories: AdminCategory[]
  saving: boolean
  error: string | null
  notice: string | null
  onNameBlur: () => void
  onSave: (e?: FormEvent) => void
  onClose: () => void
  onReload: () => Promise<void>
}

function ProductEditor({
  editing,
  setEditing,
  full,
  categories,
  saving,
  error,
  notice,
  onNameBlur,
  onSave,
  onClose,
  onReload,
}: EditorProps) {
  const field = (key: keyof EditorState, value: string | boolean) =>
    setEditing((e) => (e ? { ...e, [key]: value } : e))

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={onSave}
        className="my-8 w-full max-w-3xl rounded-2xl border border-border-strong bg-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold">
            {editing.id ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-elevated hover:text-foreground" aria-label="Cerrar">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">{error}</div>
          )}
          {notice && (
            <div className="rounded-xl border border-success/25 bg-success/10 p-3 text-sm text-success">{notice}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="p-name" label="Nombre *" value={editing.name} onChange={(e) => field('name', e.target.value)} onBlur={onNameBlur} required placeholder="Ej. iPhone 13 128GB" />
            <Input id="p-slug" label="Enlace (slug)" value={editing.slug} onChange={(e) => field('slug', e.target.value)} placeholder="iphone-13-128gb" />
          </div>

          <Input
            id="p-short"
            label="Descripción corta (tarjeta del catálogo)"
            value={editing.short_description}
            onChange={(e) => field('short_description', e.target.value)}
            placeholder="Una línea que venda el producto"
          />
          <div>
            <label htmlFor="p-desc" className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Descripción completa (detalle del producto)
            </label>
            <textarea
              id="p-desc"
              value={editing.description}
              onChange={(e) => field('description', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface-elevated focus:outline-none"
              placeholder="Características, qué incluye, condiciones…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input id="p-price" label="Precio USD *" type="number" step="0.01" min="0" value={editing.price} onChange={(e) => field('price', e.target.value)} required placeholder="149.99" />
            <Input id="p-compare" label="Precio antes (opcional)" type="number" step="0.01" min="0" value={editing.compare_at_price} onChange={(e) => field('compare_at_price', e.target.value)} placeholder="189.99" />
            <Input id="p-stock" label="Existencias" type="number" min="0" value={editing.stock} onChange={(e) => field('stock', e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input id="p-sku" label="SKU (código interno)" value={editing.sku} onChange={(e) => field('sku', e.target.value)} placeholder="A2K-XXXX" />
            <div>
              <label htmlFor="p-cat" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Categoría
              </label>
              <select
                id="p-cat"
                value={editing.category_id}
                onChange={(e) => field('category_id', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">— Sin categoría —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-status" className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Estado
              </label>
              <select
                id="p-status"
                value={editing.status}
                onChange={(e) => field('status', e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="active">Activo (visible en la tienda)</option>
                <option value="inactive">Pausado (oculto)</option>
              </select>
            </div>
          </div>

          <Input id="p-tags" label="Etiquetas (separadas por coma)" value={editing.tags} onChange={(e) => field('tags', e.target.value)} placeholder="apple, iphone, reacondicionado" />

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={editing.is_featured} onChange={(e) => field('is_featured', e.target.checked)} className="h-4 w-4 accent-[#C5A059]" />
              Destacado en inicio
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={editing.is_new} onChange={(e) => field('is_new', e.target.checked)} className="h-4 w-4 accent-[#C5A059]" />
              Mostrar insignia «Nuevo»
            </label>
          </div>

          {editing.id ? (
            <>
              <ImagesSection productId={editing.id} images={full?.images ?? []} onChanged={onReload} />
              <VariantsSection productId={editing.id} variants={full?.variants ?? []} onChanged={onReload} />
            </>
          ) : (
            <p className="rounded-xl border border-border bg-surface-elevated p-3 text-xs text-muted">
              Guarda el producto primero para poder subirle fotos y agregar variantes.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : editing.id ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Imágenes
// ─────────────────────────────────────────────────────────────

function ImagesSection({
  productId,
  images,
  onChanged,
}: {
  productId: string
  images: AdminImage[]
  onChanged: () => Promise<void>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    setUploadError(null)
    let ok = 0
    for (const file of Array.from(files)) {
      const { error } = await uploadProductImage(productId, file)
      if (error) setUploadError(`${file.name}: ${error}`)
      else ok++
    }
    if (ok > 0) await onChanged()
    setBusy(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="rounded-xl border border-border bg-surface-elevated/40 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Fotos ({images.length}) — la primera es la principal
        </h3>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
          <Icon name="upload" size={14} />
          {busy ? 'Subiendo…' : 'Subir fotos'}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={busy}
          />
        </label>
      </div>

      {uploadError && <p className="mb-2 text-xs text-danger">{uploadError}</p>}

      {images.length === 0 ? (
        <p className="text-xs text-muted">
          Aún no hay fotos. Sube JPG/PNG/WebP/GIF de hasta 10 MB (puedes seleccionar varias a la vez).
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border bg-surface">
              <img src={img.url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Principal
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    title="Hacer principal"
                    onClick={async () => {
                      const { error } = await setPrimaryImage(productId, img.id)
                      if (error) setUploadError(error)
                      await onChanged()
                    }}
                    className="rounded-full bg-primary/90 p-1.5 text-primary-foreground hover:bg-primary"
                  >
                    <Icon name="star" size={13} />
                  </button>
                )}
                <button
                  type="button"
                  title="Eliminar foto"
                  onClick={async () => {
                    if (!window.confirm('¿Eliminar esta foto?')) return
                    const { error } = await deleteProductImage(img)
                    if (error) setUploadError(error)
                    await onChanged()
                  }}
                  className="rounded-full bg-danger/90 p-1.5 text-white hover:bg-danger"
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Variantes
// ─────────────────────────────────────────────────────────────

function VariantsSection({
  productId,
  variants,
  onChanged,
}: {
  productId: string
  variants: AdminVariant[]
  onChanged: () => Promise<void>
}) {
  const [rows, setRows] = useState<
    { key: string; id: string | null; name: string; sku: string; price: string; stock: string }[]
  >([])
  const [rowError, setRowError] = useState<string | null>(null)
  const [busyRow, setBusyRow] = useState<string | null>(null)

  const addRow = () =>
    setRows((r) => [...r, { key: `new-${Date.now()}`, id: null, name: '', sku: '', price: '', stock: '0' }])

  const patchRow = (key: string, patch: Partial<{ name: string; sku: string; price: string; stock: string }>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const saveRow = async (key: string) => {
    setRowError(null)
    const row = rows.find((r) => r.key === key)
    if (!row) return
    if (!row.name.trim()) return setRowError('La variante necesita un nombre (ej. "Negro / 256GB").')
    setBusyRow(key)
    const payload = {
      name: row.name.trim(),
      sku: row.sku.trim() || `${productId.slice(0, 8)}-V${rows.indexOf(row) + 1}`,
      price: row.price.trim() ? Number(row.price.replace(',', '.')) : null,
      stock: Math.max(0, Math.trunc(Number(row.stock) || 0)),
    }
    const { error } = row.id
      ? await updateVariant(row.id, payload)
      : await createVariant(productId, payload)
    if (error) setRowError(error)
    else {
      setRows((rs) => rs.filter((r) => r.key !== key))
      await onChanged()
    }
    setBusyRow(null)
  }

  const removeVariant = async (row: { id: string | null }) => {
    if (row.id) {
      if (!window.confirm('¿Eliminar esta variante?')) return
      const { error } = await deleteVariant(row.id)
      if (error) return setRowError(error)
      await onChanged()
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface-elevated/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Variantes ({variants.length}) — talla, color o modelo
        </h3>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
          <Icon name="plus" size={14} />
          Agregar
        </button>
      </div>

      {rowError && <p className="mb-2 text-xs text-danger">{rowError}</p>}

      {variants.length === 0 && rows.length === 0 && (
        <p className="text-xs text-muted">
          Sin variantes el producto se vende como unidad única. Agrega variantes si tienes colores,
          capacidades o tallas con precio o stock propios.
        </p>
      )}

      {/* Variantes guardadas */}
      <div className="space-y-2">
        {variants.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="min-w-32 flex-1 text-sm text-foreground">{v.name}</span>
            <span className="text-xs text-muted-foreground">{v.sku}</span>
            <span className="text-sm font-medium">{v.price != null ? formatPrice(Number(v.price)) : '—'}</span>
            <span className={cn('text-xs', v.stock <= 0 && 'text-danger')}>stock {v.stock}</span>
            <button
              type="button"
              title="Eliminar variante"
              onClick={() => removeVariant(v)}
              className="rounded p-1 text-muted-foreground hover:text-danger"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}

        {/* Filas nuevas/en edición */}
        {rows.map((r) => (
          <div key={r.key} className="grid grid-cols-2 gap-2 rounded-lg border border-primary/30 bg-surface px-3 py-2 sm:grid-cols-9">
            <input value={r.name} onChange={(e) => patchRow(r.key, { name: e.target.value })} placeholder="Nombre (Negro / 256GB)" className="col-span-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-3" />
            <input value={r.sku} onChange={(e) => patchRow(r.key, { sku: e.target.value })} placeholder="SKU" className="col-span-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-2" />
            <input value={r.price} onChange={(e) => patchRow(r.key, { price: e.target.value })} placeholder="Precio" inputMode="decimal" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm sm:col-span-2" />
            <input value={r.stock} onChange={(e) => patchRow(r.key, { stock: e.target.value })} placeholder="Stock" inputMode="numeric" className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm" />
            <div className="flex items-center justify-end gap-1">
              <button type="button" title="Guardar variante" onClick={() => saveRow(r.key)} disabled={busyRow === r.key} className="rounded-full bg-primary/90 p-1.5 text-primary-foreground hover:bg-primary disabled:opacity-50">
                <Icon name="check" size={13} />
              </button>
              {!r.id && (
                <button type="button" title="Descartar" onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} className="rounded-full p-1.5 text-muted-foreground hover:text-danger">
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
