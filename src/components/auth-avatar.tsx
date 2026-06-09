"use client"

import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

export function AuthAvatar({
  src,
  displayName,
  email,
  className,
}: {
  src?: string | null
  displayName?: string | null
  email?: string
  className?: string
}) {
  const name = displayName || email || "User"
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full border border-border bg-muted select-none",
        className
      )}
    >
      <AvatarPrimitive.Image
        src={src || undefined}
        alt={name}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-semibold"
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
