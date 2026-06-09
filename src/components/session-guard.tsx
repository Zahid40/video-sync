"use client"

import React from "react"
import { useAuth } from "@/hooks/auth"

export function SessionGuard({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
}
