"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export function VerifyEmailNotice({
  email,
  onResend,
  resendLoading = false,
}: {
  email: string
  onResend?: () => void
  resendLoading?: boolean
}) {
  return (
    <div className="w-full max-w-md p-6 bg-card border border-border rounded-3xl shadow-xl text-center flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-foreground">Verify your email</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a verification email to <strong className="text-foreground">{email}</strong>.
          Click the link in that email to complete your registration.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          onClick={onResend}
          disabled={resendLoading}
          className="w-full"
        >
          {resendLoading ? "Resending..." : "Resend Verification Email"}
        </Button>
      </div>
    </div>
  )
}
