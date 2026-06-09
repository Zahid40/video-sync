"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthButtons } from "./oauth-buttons"

export function SignInForm({
  onSuccess,
  signUpUrl = "/sign-up",
  forgotPasswordUrl = "/forgot-password",
}: {
  onSuccess?: () => void
  signUpUrl?: string
  forgotPasswordUrl?: string
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (onSuccess) {
        onSuccess()
      } else {
        window.location.href = "/"
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-xl flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your details to access your account
        </p>
      </div>

      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href={forgotPasswordUrl}
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase">
          Or continue with
        </span>
      </div>

      <OAuthButtons />

      <p className="text-center text-xs text-muted-foreground mt-2">
        Don&apos;t have an account?{" "}
        <a href={signUpUrl} className="font-semibold text-primary hover:underline">
          Sign up
        </a>
      </p>
    </div>
  )
}
