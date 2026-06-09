"use client"

import { useState } from "react"
import { useAuthUser } from "@/hooks/auth"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { AuthDialog } from "@/components/auth-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DeleteAccountDialog() {
  const { user } = useAuthUser()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleDelete = async () => {
    if (!user || confirmText !== "delete my account") return
    setDeleting(true)
    setError(null)

    try {
      // 1. Delete user profile record in public schema. 
      // PostgreSQL cascade triggers will handle clearing metadata.
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id)

      if (profileError) throw profileError

      // 2. Sign out the user
      await supabase.auth.signOut()
      window.location.href = "/sign-in"
    } catch (err: any) {
      setError(err.message || "Failed to delete account.")
      setDeleting(false)
    }
  }

  return (
    <div className="w-full bg-card border border-destructive/20 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated workspace data
        </p>
      </div>

      <div className="flex justify-between items-center bg-destructive/5 border border-destructive/10 p-4 rounded-2xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">Delete Account</span>
          <span className="text-xs text-muted-foreground">This action cannot be undone.</span>
        </div>

        <AuthDialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) {
              setConfirmText("")
              setError(null)
            }
          }}
          trigger={
            <Button variant="destructive" className="px-4">
              Delete Account
            </Button>
          }
        >
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-foreground">Are you absolutely sure?</h3>
              <p className="text-sm text-muted-foreground">
                This will delete your user profile, cancel organization roles, and remove preferences.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmDelete" className="text-xs text-muted-foreground">
                Type <strong className="text-foreground">delete my account</strong> to confirm
              </Label>
              <Input
                id="confirmDelete"
                placeholder="delete my account"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={deleting}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={confirmText !== "delete my account" || deleting}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </AuthDialog>
      </div>
    </div>
  )
}
