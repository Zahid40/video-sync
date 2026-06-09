"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function UserSecuritySettings() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." })
      return
    }

    setUpdating(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setPassword("")
      setConfirmPassword("")
      setMessage({ type: "success", text: "Password updated successfully!" })
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update password." })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="w-full bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Secure your account and update your login credentials
        </p>
      </div>

      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={updating}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-new-password">Confirm Password</Label>
          <Input
            id="confirm-new-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={updating}
          />
        </div>

        {message && (
          <p
            className={`text-xs p-3 rounded-xl border ${
              message.type === "success"
                ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                : "text-destructive bg-destructive/10 border-destructive/20"
            }`}
          >
            {message.text}
          </p>
        )}

        <Button type="submit" className="w-fit self-end px-5" disabled={updating}>
          {updating ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  )
}
