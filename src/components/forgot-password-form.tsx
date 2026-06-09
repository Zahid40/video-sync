"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm({
  signInUrl = "/sign-in",
}: {
  signInUrl?: string
}) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (resetError) throw resetError
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-xl flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We have sent password reset instructions to <strong className="text-foreground">{email}</strong>.
            Please follow the link in the email to set a new password.
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = signInUrl
          }}
          className="w-full h-10"
        >
          Return to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-xl flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a recovery link
        </p>
      </div>

      <form onSubmit={handleResetRequest} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-10 mt-2" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Remember your password?{" "}
        <a href={signInUrl} className="font-semibold text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  )
}
