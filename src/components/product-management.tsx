"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthDialog } from "@/components/auth-dialog"
import { FiPlus, FiEdit2, FiGlobe, FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiCheck, FiX } from "react-icons/fi"

type Product = {
  id: string
  slug: string
  name: string
  domain: string | null
  description: string | null
  icon_url: string | null
  is_active: boolean
  is_public: boolean
  supports_personal: boolean
  supports_organizations: boolean
  sort_order: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [domain, setDomain] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [supportsPersonal, setSupportsPersonal] = useState(true)
  const [supportsOrganizations, setSupportsOrganizations] = useState(false)
  const [sortOrder, setSortOrder] = useState(0)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true })

      if (fetchErr) throw fetchErr
      setProducts(data || [])
    } catch (err: any) {
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      )
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName("")
    setSlug("")
    setDomain("")
    setDescription("")
    setIsPublic(true)
    setSupportsPersonal(true)
    setSupportsOrganizations(false)
    setSortOrder(products.length + 1)
    setError(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setSlug(product.slug)
    setDomain(product.domain || "")
    setDescription(product.description || "")
    setIsPublic(product.is_public)
    setSupportsPersonal(product.supports_personal)
    setSupportsOrganizations(product.supports_organizations)
    setSortOrder(product.sort_order)
    setError(null)
    setDialogOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const productPayload = {
        name,
        slug,
        domain: domain || null,
        description: description || null,
        is_public: isPublic,
        supports_personal: supportsPersonal,
        supports_organizations: supportsOrganizations,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        // Update product directly via REST (system admin policy allows FOR UPDATE)
        const { error: updateErr } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingProduct.id)

        if (updateErr) throw updateErr
      } else {
        // Insert product directly via REST (system admin policy allows FOR INSERT)
        const { error: insertErr } = await supabase
          .from("products")
          .insert({
            ...productPayload,
            is_active: true,
          })

        if (insertErr) throw insertErr
      }

      await fetchProducts()
      setDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to save product.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      const nextActiveState = !product.is_active
      // Calls system admin product management RPC
      const { error: rpcErr } = await supabase.rpc("admin_set_product_status", {
        product_slug: product.slug,
        active: nextActiveState,
      })

      if (rpcErr) throw rpcErr
      await fetchProducts()
    } catch (err: any) {
      alert(err.message || "Failed to toggle status.")
    }
  }

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">Ecosystem Products</h3>
          <p className="text-sm text-muted-foreground">
            Manage your apps registry, access configuration, and status.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-1.5 self-start">
          <FiPlus size={16} />
          Register Product
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading products registry...</div>
      ) : products.length === 0 ? (
        <div className="py-12 border border-dashed border-border rounded-2xl text-center text-sm text-muted-foreground">
          No products registered in the database yet.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/60 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Name & Slug</th>
                <th className="p-4">Domain</th>
                <th className="p-4">Visibility</th>
                <th className="p-4">Capabilities</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sort</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 flex flex-col">
                    <span className="font-semibold text-foreground">{product.name}</span>
                    <span className="text-xs text-muted-foreground">slug: {product.slug}</span>
                  </td>
                  <td className="p-4">
                    {product.domain ? (
                      <a
                        href={product.domain}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <FiGlobe size={12} />
                        {product.domain.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    {product.is_public ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        <FiEye size={12} /> Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                        <FiEyeOff size={12} /> Internal
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {product.supports_personal ? (
                          <FiCheck size={14} className="text-emerald-500" />
                        ) : (
                          <FiX size={14} className="text-destructive" />
                        )}
                        <span>Personal Access</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {product.supports_organizations ? (
                          <FiCheck size={14} className="text-emerald-500" />
                        ) : (
                          <FiX size={14} className="text-destructive" />
                        )}
                        <span>Organizations</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <FiCheckCircle size={14} className="text-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                        <FiXCircle size={14} className="text-destructive" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground font-semibold">{product.sort_order}</td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Product"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <Button
                        onClick={() => handleToggleActive(product)}
                        variant={product.is_active ? "destructive" : "outline"}
                        className="h-8 text-xs font-semibold px-2.5 rounded-xl"
                      >
                        {product.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Dialog */}
      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground">
              {editingProduct ? "Edit Product" : "Register new product"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure app details in the centralized identity catalog.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodName">Product Name</Label>
              <Input
                id="prodName"
                placeholder="Resume Builder"
                value={name}
                onChange={handleNameChange}
                required
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodSlug">Product Slug</Label>
              <Input
                id="prodSlug"
                placeholder="resume-builder"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={saving || !!editingProduct}
                className={editingProduct ? "bg-muted cursor-not-allowed text-muted-foreground" : ""}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodDomain">Homepage URL (Domain)</Label>
              <Input
                id="prodDomain"
                placeholder="https://superbyte.tools/resume"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodDesc">Description</Label>
              <textarea
                id="prodDesc"
                placeholder="A clean, ATS-compliant online resume builder for job applicants."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className="w-full min-h-20 rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary/80 transition-shadow disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">Public Listing</span>
                <span className="text-[10px] text-muted-foreground">Visible on listings for general public users</span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={saving}
                className="size-4 accent-primary cursor-pointer"
              />
            </div>

            {/* Capability Flags */}
            <div className="flex flex-col gap-3 p-3 rounded-xl border border-border bg-muted/20">
              <span className="text-xs font-bold text-foreground">App Capabilities</span>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">Personal Access Mode</span>
                  <span className="text-[10px] text-muted-foreground">Users can access product individually</span>
                </div>
                <input
                  type="checkbox"
                  checked={supportsPersonal}
                  onChange={(e) => setSupportsPersonal(e.target.checked)}
                  disabled={saving}
                  className="size-4 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">Organizations / Workspaces</span>
                  <span className="text-[10px] text-muted-foreground">Support teams/orgs inside this product</span>
                </div>
                <input
                  type="checkbox"
                  checked={supportsOrganizations}
                  onChange={(e) => setSupportsOrganizations(e.target.checked)}
                  disabled={saving}
                  className="size-4 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prodSort">Sort Order</Label>
              <Input
                id="prodSort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                required
                disabled={saving}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </AuthDialog>
    </div>
  )
}
