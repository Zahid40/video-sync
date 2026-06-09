"use client"

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { useAuth } from "@/hooks/auth"
import { AuthAvatar } from "@/components/auth-avatar"
import { createClient } from "@/lib/supabase"
import { 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiBriefcase, 
  FiPlus,
  FiCheck
} from "react-icons/fi"

export function UserMenu() {
  const { 
    user, 
    profile, 
    activeOrg, 
    organizations, 
    switchOrg 
  } = useAuth()

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/sign-in"
  }

  if (!user) return null

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger className="focus:outline-hidden outline-hidden select-none">
        <div className="flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
          <AuthAvatar 
            src={profile?.avatar_url ?? undefined} 
            displayName={profile?.display_name ?? undefined} 
            email={profile?.email ?? undefined} 
            className="size-9 border border-border"
          />
        </div>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content 
          align="end" 
          sideOffset={8}
          className="z-50 min-w-64 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-lg outline-hidden duration-200 animate-in fade-in-80 slide-in-from-top-5"
        >
          {/* Header Info */}
          <div className="flex flex-col gap-1 px-3 py-2.5 border-b border-border mb-1.5">
            <span className="text-sm font-semibold text-foreground truncate">
              {profile?.display_name || "User Account"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {profile?.email}
            </span>
          </div>

          {/* Account Settings link */}
          <DropdownMenuPrimitive.Item 
            onSelect={() => window.location.href = "/settings"}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground rounded-xl hover:bg-muted cursor-pointer outline-hidden select-none"
          >
            <FiUser size={16} className="text-muted-foreground" />
            <span>Account Profile</span>
          </DropdownMenuPrimitive.Item>

          {/* Active Org Info / Link */}
          {activeOrg && (
            <DropdownMenuPrimitive.Item 
              onSelect={() => window.location.href = `/settings?tab=org`}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground rounded-xl hover:bg-muted cursor-pointer outline-hidden select-none"
            >
              <FiSettings size={16} className="text-muted-foreground" />
              <span>Workspace Settings</span>
            </DropdownMenuPrimitive.Item>
          )}

          {/* Organizations / Switcher Section */}
          <div className="border-t border-border my-1.5" />
          
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Workspaces
          </div>

          {/* Personal Account Switcher */}
          <DropdownMenuPrimitive.Item 
            onSelect={() => switchOrg(null)}
            className="flex items-center justify-between px-3 py-2 text-sm text-foreground rounded-xl hover:bg-muted cursor-pointer outline-hidden select-none"
          >
            <div className="flex items-center gap-2.5">
              <FiUser size={16} className="text-muted-foreground" />
              <span>Personal Account</span>
            </div>
            {!activeOrg && <FiCheck size={16} className="text-primary" />}
          </DropdownMenuPrimitive.Item>

          {/* Orgs List */}
          {organizations.map((org) => (
            <DropdownMenuPrimitive.Item 
              key={org.id}
              onSelect={() => switchOrg(org.id)}
              className="flex items-center justify-between px-3 py-2 text-sm text-foreground rounded-xl hover:bg-muted cursor-pointer outline-hidden select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FiBriefcase size={16} className="text-muted-foreground shrink-0" />
                <span className="truncate">{org.name}</span>
              </div>
              {activeOrg?.id === org.id && <FiCheck size={16} className="text-primary shrink-0" />}
            </DropdownMenuPrimitive.Item>
          ))}

          {/* Create Org item */}
          <DropdownMenuPrimitive.Item 
            onSelect={() => window.location.href = "/settings?tab=org&create=true"}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary font-medium rounded-xl hover:bg-primary/5 cursor-pointer outline-hidden select-none mt-1"
          >
            <FiPlus size={16} className="text-primary" />
            <span>Create Workspace</span>
          </DropdownMenuPrimitive.Item>

          {/* Sign Out */}
          <div className="border-t border-border my-1.5" />

          <DropdownMenuPrimitive.Item 
            onSelect={handleSignOut}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive font-medium rounded-xl hover:bg-destructive/10 cursor-pointer outline-hidden select-none"
          >
            <FiLogOut size={16} className="text-destructive" />
            <span>Log out</span>
          </DropdownMenuPrimitive.Item>

        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
