"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/hooks/auth"

export function ProtectedRoute({
  children,
  redirectTo = "/sign-in",
}: {
  children: React.ReactNode
  redirectTo?: string
}) {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.location.href = `${redirectTo}?redirect=${encodeURIComponent(
        window.location.pathname
      )}`
    }
  }, [user, loading, redirectTo])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
