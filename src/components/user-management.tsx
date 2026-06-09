"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthDialog } from "@/components/auth-dialog"
import { FiEdit2, FiShield, FiUser, FiTrash2, FiSearch } from "react-icons/fi"

type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  is_system_admin: boolean
  created_at: string
}

export function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  
  // Form state
  const [displayName, setDisplayName] = useState("")
  const [isSystemAdmin, setIsSystemAdmin] = useState(false)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const { data, error: fetchErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchErr) throw fetchErr
      setProfiles(data || [])
    } catch (err: any) {
      console.error("Error fetching profiles:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const handleOpenEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setDisplayName(profile.display_name || "")
    setIsSystemAdmin(profile.is_system_admin)
    setError(null)
    setDialogOpen(true)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProfile) return
    setSaving(true)
    setError(null)

    try {
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          display_name: displayName || null,
          is_system_admin: isSystemAdmin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingProfile.id)

      if (updateErr) throw updateErr

      await fetchProfiles()
      setDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!confirm("Are you sure you want to delete this user profile? All associated preference/session metadata in profiles will be removed.")) return

    try {
      const { error: deleteErr } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId)

      if (deleteErr) throw deleteErr
      await fetchProfiles()
    } catch (err: any) {
      alert(err.message || "Failed to delete profile.")
    }
  }

  const filteredProfiles = profiles.filter((p) => {
    const term = searchQuery.toLowerCase()
    return (
      (p.display_name?.toLowerCase() || "").includes(term) ||
      (p.email?.toLowerCase() || "").includes(term) ||
      p.id.includes(term)
    )
  })

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage global accounts, toggle platform administrator permissions, and clean profiles.
          </p>
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="relative w-full max-w-sm">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <input
          type="text"
          placeholder="Search users by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-full pl-9 pr-3 rounded-md border border-input bg-input/20 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 dark:bg-input/30"
        />
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading accounts registry...</div>
      ) : filteredProfiles.length === 0 ? (
        <div className="py-12 border border-dashed border-border rounded-2xl text-center text-sm text-muted-foreground">
          No matching accounts found.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/60 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/80 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="p-4">User Details</th>
                <th className="p-4">UUID</th>
                <th className="p-4">Role / Permissions</th>
                <th className="p-4">Registered</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 flex flex-col">
                    <span className="font-semibold text-foreground">{p.display_name || "Anonymous User"}</span>
                    <span className="text-xs text-muted-foreground">{p.email || "No email"}</span>
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground select-all">
                    {p.id}
                  </td>
                  <td className="p-4">
                    {p.is_system_admin ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 font-semibold">
                        <FiShield size={12} /> System Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border font-medium">
                        <FiUser size={12} /> Standard User
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit User"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(p.id)}
                        className="p-1.5 rounded-xl border border-destructive/30 hover:bg-destructive/15 text-destructive hover:text-destructive transition-all"
                        title="Delete User"
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

      {/* Edit User Dialog */}
      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <form onSubmit={handleSaveProfile} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-foreground">Edit User Account</h3>
            <p className="text-sm text-muted-foreground font-mono text-xs">
              Editing: {editingProfile?.email || editingProfile?.id}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Jane Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
              />
            </div>

            {/* Admin Capabilities toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">Platform System Admin</span>
                <span className="text-[10px] text-muted-foreground">Allows full system settings panel, RBAC bypass, and products management.</span>
              </div>
              <input
                type="checkbox"
                checked={isSystemAdmin}
                onChange={(e) => setIsSystemAdmin(e.target.checked)}
                disabled={saving}
                className="size-4 accent-primary cursor-pointer"
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
              {saving ? "Saving Changes..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </AuthDialog>
    </div>
  )
}
