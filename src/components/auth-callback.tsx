"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase"

export function AuthCallback({
  onComplete,
  onError,
}: {
  onComplete?: (next: string) => void
  onError?: (err: any) => void
}) {
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get("code")
        const next = url.searchParams.get("next") || "/"

        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
        }

        if (onComplete) {
          onComplete(next)
        } else {
          window.location.href = next
        }
      } catch (err) {
        console.error("Auth callback exchange error:", err)
        if (onError) {
          onError(err)
        } else {
          window.location.href = "/sign-in"
        }
      }
    }

    handleCallback()
  }, [supabase, onComplete, onError])

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Completing authentication...
        </p>
      </div>
    </div>
  )
}
