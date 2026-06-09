"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthDialog } from "@/components/auth-dialog"
import { FiPlus, FiEdit2, FiLayers, FiSearch, FiTrash2 } from "react-icons/fi"

type Product = {
  id: string
  name: string
}

type Profile = {
  id: string
  email: string | null
  display_name: string | null
}

type Organization = {
  id: string
  name: string
  slug: string
  created_by: string
  product_id: string
  created_at: string
  products: {
    name: string
  } | null
  profiles: {
    email: string | null
    display_name: string | null
  } | null
}

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Dialog controls
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  
  // Form State
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [productId, setProductId] = useState("")
  const [creatorId, setCreatorId] = useState("")
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchEcosystemData = async () => {
    setLoading(true)
    try {
      // 1. Fetch organizations with join relations
      const { data: orgData, error: orgErr } = await supabase
        .from("organizations")
        .select(`
          id,
          name,
          slug,
          created_by,
          product_id,
          created_at,
          products(name),
          profiles:created_by(email, display_name)
        `)
        .order("created_at", { ascending: false })

      if (orgErr) throw orgErr
      setOrganizations((orgData as any) || [])

      // 2. Fetch compatible products for dropdown
      const { data: prodData } = await supabase
        .from("products")
        .select("id, name")
        .eq("is_active", true)
        .eq("supports_organizations", true)
        .order("sort_order", { ascending: true })
      
      setProducts(prodData || [])

      // 3. Fetch profiles for creator selector dropdown
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, email, display_name")
        .order("display_name", { ascending: true })
      
      setProfiles(userData || [])
    } catch (err: any) {
      console.error("Failed to load ecosystem data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEcosystemData()
  }, [])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setName(val)
    if (!editingOrg) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      )
    }
  }

  const handleOpenAdd = () => {
    setEditingOrg(null)
    setName("")
    setSlug("")
    setProductId(products[0]?.id || "")
    setCreatorId(profiles[0]?.id || "")
    setError(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (org: Organization) => {
    setEditingOrg(org)
    setName(org.name)
    setSlug(org.slug)
    setProductId(org.product_id)
    setCreatorId(org.created_by)
    setError(null)
    setDialogOpen(true)
  }

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug || !productId || !creatorId) return
    setSaving(true)
    setError(null)

    try {
      if (editingOrg) {
        // Edit Organization
        const { error: updateErr } = await supabase
          .from("organizations")
          .update({
            name,
            slug,
            product_id: productId,
            created_by: creatorId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingOrg.id)

        if (updateErr) throw updateErr
      } else {
        // Create Organization
        const { error: insertErr } = await supabase
          .from("organizations")
          .insert({
            name,
            slug,
            product_id: productId,
            created_by: creatorId,
          })

        if (insertErr) throw insertErr
      }

      await fetchEcosystemData()
      setDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to save organization.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this workspace? This action is permanent and removes all organization members, invitations, and metadata.")) return

    try {
      const { error: deleteErr } = await supabase
        .from("organizations")
        .delete()
        .eq("id", orgId)

      if (deleteErr) throw deleteErr
      await fetchEcosystemData()
    } catch (err: any) {
      alert(err.message || "Failed to delete organization.")
    }
  }

  const filteredOrgs = organizations.filter((org) => {
    const term = searchQuery.toLowerCase()
    return (
      org.name.toLowerCase().includes(term) ||
      org.slug.toLowerCase().includes(term) ||
      (org.products?.name?.toLowerCase() || "").includes(term) ||
      (org.profiles?.email?.toLowerCase() || "").includes(term)
    );
  })

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">Workspace Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage organization listings, associate them to active products, and audit creation ownership.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-1.5 self-start">
          <FiPlus size={16} />
          Create Workspace
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="relative w-full max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          type="text"
          placeholder="Search workspaces by name, slug, or product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-full pl-9 pr-3 rounded-md border border-input bg-input/20 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 dark:bg-input/30"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading workspace records...</div>
      ) : filteredOrgs.length === 0 ? (
        <div className="py-12 border border-dashed border-border rounded-2xl text-center text-sm text-muted-foreground">
          No matching workspaces registered in the system database.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/60 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Workspace Details</th>
                <th className="p-4">Ecosystem Product</th>
                <th className="p-4">Workspace Creator</th>
                <th className="p-4">Created At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 flex flex-col">
                    <span className="font-semibold text-foreground">{org.name}</span>
                    <span className="text-xs text-muted-foreground">slug: {org.slug}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                      <FiLayers size={11} /> {org.products?.name || "Unknown Product"}
                    </span>
                  </td>
                  <td className="p-4 flex flex-col">
                    <span className="font-medium text-foreground text-xs">{org.profiles?.display_name || "Anonymous"}</span>
                    <span className="text-[11px] text-muted-foreground">{org.profiles?.email || "No email info"}</span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(org)}
                        className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Workspace"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrg(org.id)}
                        className="p-1.5 rounded-xl border border-destructive/30 hover:bg-destructive/15 text-destructive hover:text-destructive transition-all"
                        title="Delete Workspace"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Workspace Dialog */}
      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <form onSubmit={handleSaveOrganization} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground">
              {editingOrg ? "Edit Workspace" : "Create Workspace"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Define workspace scope and assign organization ownership.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orgName">Workspace Name</Label>
              <Input
                id="orgName"
                placeholder="Super Team"
                value={name}
                onChange={handleNameChange}
                required
                disabled={saving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orgSlug">Workspace Slug</Label>
              <Input
                id="orgSlug"
                placeholder="super-team"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            {/* Product selection dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="productSelection">Ecosystem Product</Label>
              <select
                id="productSelection"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={saving}
                className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 cursor-pointer dark:bg-input/30"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Creator / Owner selection dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="creatorSelection">Workspace Owner</Label>
              <select
                id="creatorSelection"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                disabled={saving}
                className="h-7 w-full rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 cursor-pointer dark:bg-input/30"
              >
                {profiles.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.email || "No details"} ({u.email})
                  </option>
                ))}
              </select>
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
            <Button type="submit" disabled={saving || !productId || !creatorId}>
              {saving ? "Saving Workspace..." : editingOrg ? "Save Changes" : "Create Workspace"}
            </Button>
          </div>
        </form>
      </AuthDialog>
    </div>
  )
}
