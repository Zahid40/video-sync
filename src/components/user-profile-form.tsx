"use client"

import React, { useState, useEffect } from "react"
import { useAuthUser } from "@/hooks/auth"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthAvatar } from "@/components/auth-avatar"

export function UserProfileForm() {
  const { user, profile, refresh } = useAuthUser()
  const [displayName, setDisplayName] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "")
    }
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error
      await refresh()
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    setMessage(null)

    try {
      const fileExt = file.name.split(".").pop()
      const filePath = `user/${user.id}/${Math.random()}.${fileExt}`

      // Upload file to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Resolve public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      await refresh()
      setMessage({ type: "success", text: "Avatar uploaded successfully!" })
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to upload avatar.",
      })
    } finally {
      setUploading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex w-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">
          Profile Details
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal public details
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border/50 bg-muted/40 p-4 sm:flex-row">
        <AuthAvatar
          src={profile?.avatar_url ?? undefined}
          displayName={profile?.display_name ?? undefined}
          email={profile?.email ?? undefined}
          className="size-16 border-2 border-primary/10"
        />
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Label htmlFor="avatar-file" className="cursor-pointer">
            <div className="inline-flex h-8 items-center justify-center rounded-xl border border-border bg-background px-3 text-xs font-semibold transition-colors hover:bg-muted">
              {uploading ? "Uploading..." : "Change avatar"}
            </div>
            <input
              id="avatar-file"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </Label>
          <span className="text-xs text-muted-foreground">
            JPG, PNG or WEBP. Max 2MB.
          </span>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email || ""}
            disabled
            className="cursor-not-allowed bg-muted/40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={saving}
          />
        </div>

        {message && (
          <p
            className={`rounded-xl border p-3 text-xs ${
              message.type === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </p>
        )}

        <Button type="submit" className="w-fit self-end px-5" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </div>
  )
}
