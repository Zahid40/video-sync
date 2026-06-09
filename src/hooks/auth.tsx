"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { createClient } from "@/lib/supabase"
import type { Database } from "@/types/database.types"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type UserPreference = Database["public"]["Tables"]["user_preferences"]["Row"]

export interface AuthContextType {
  user: User | null
  profile: Profile | null
  activeOrg: Organization | null
  activeRole: string | null
  organizations: Organization[]
  preferences: UserPreference | null
  loading: boolean
  refresh: () => Promise<void>
  switchOrg: (orgId: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [preferences, setPreferences] = useState<UserPreference | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadUserData = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setUser(null)
        setProfile(null)
        setActiveOrg(null)
        setActiveRole(null)
        setOrganizations([])
        setPreferences(null)
        setLoading(false)
        return
      }

      setUser(currentUser)

      try {
        // 1. Fetch Profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .single()

        setProfile(profileData)

        // 2. Fetch User Preferences (theme, active org)
        let { data: prefsData } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", currentUser.id)
          .single()

        // If preferences do not exist yet, bootstrap them
        if (!prefsData) {
          const { data: newPrefs } = await supabase
            .from("user_preferences")
            .insert({
              user_id: currentUser.id,
              theme: "system",
              custom_settings: {},
            })
            .select("*")
            .single()
          prefsData = newPrefs
        }

        setPreferences(prefsData)

        // 3. Fetch Organizations user is member of
        const { data: membersList } = await supabase
          .from("organization_members")
          .select("organization_id, role, organizations(*)")
          .eq("user_id", currentUser.id)

        const orgs: Organization[] = []
        let resolvedActiveRole: string | null = null
        let resolvedActiveOrg: Organization | null = null

        if (membersList) {
          ;(membersList as any[]).forEach((m) => {
            if (m.organizations) {
              orgs.push(m.organizations)
              if (
                prefsData &&
                m.organization_id === prefsData.active_organization_id
              ) {
                resolvedActiveOrg = m.organizations
                resolvedActiveRole = m.role
              }
            }
          })
        }

        setOrganizations(orgs)

        // If active org preference is invalid or not in list, clear it
        if (prefsData?.active_organization_id && !resolvedActiveOrg) {
          await supabase
            .from("user_preferences")
            .update({ active_organization_id: null })
            .eq("user_id", currentUser.id)

          setActiveOrg(null)
          setActiveRole(null)
        } else {
          setActiveOrg(resolvedActiveOrg)
          setActiveRole(resolvedActiveRole)
        }
      } catch (error) {
        console.error(
          "Error loading user profile and organization data:",
          error
        )
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  const refresh = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    await loadUserData(currentUser)
  }, [supabase, loadUserData])

  const switchOrg = useCallback(
    async (orgId: string | null) => {
      if (!user) return
      setLoading(true)
      try {
        await supabase
          .from("user_preferences")
          .update({ active_organization_id: orgId })
          .eq("user_id", user.id)

        await refresh()
      } catch (error) {
        console.error("Failed to switch organization:", error)
        setLoading(false)
      }
    },
    [user, supabase, refresh]
  )

  useEffect(() => {
    // Initial fetch of current session user
    supabase.auth.getUser().then((res: any) => {
      loadUserData(res.data?.user ?? null)
    })

    // Listen to changes in auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN") {
          loadUserData(session?.user ?? null)
        } else if (event === "SIGNED_OUT") {
          loadUserData(null)
        } else if (event === "TOKEN_REFRESHED") {
          setUser(session?.user ?? null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, loadUserData])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeOrg,
        activeRole,
        organizations,
        preferences,
        loading,
        refresh,
        switchOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthUser() {
  const { user, profile, loading, refresh } = useAuth()
  return { user, profile, loading, refresh }
}

export function useActiveOrganization() {
  const { activeOrg, activeRole, switchOrg, loading } = useAuth()
  return { activeOrg, activeRole, switchOrg, loading }
}

export function useOrganizations() {
  const { organizations, loading, refresh } = useAuth()
  return { organizations, loading, refresh }
}

export function useAccountContext() {
  const { preferences, refresh } = useAuth()
  return { preferences, refresh }
}

export function useRequireAuth(redirectTo = "/sign-in") {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.location.href = redirectTo
    }
  }, [user, loading, redirectTo])

  return { user, loading }
}

export function useProductAccess(productSlug: string) {
  const { user } = useAuth()
  const [access, setAccess] = useState<{
    hasAccess: boolean
    role: string | null
    status: string | null
    loading: boolean
  }>({
    hasAccess: false,
    role: null,
    status: null,
    loading: true,
  })

  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setAccess({ hasAccess: false, role: null, status: null, loading: false })
      return
    }

    const checkAccess = async () => {
      try {
        const { data: membership, error } = await supabase
          .rpc("provision_product_membership", { product_slug: productSlug })
          .maybeSingle()

        if (error || !membership) {
          setAccess({
            hasAccess: false,
            role: null,
            status: null,
            loading: false,
          })
          return
        }

        if (membership.status === "active") {
          setAccess({
            hasAccess: true,
            role: membership.role,
            status: membership.status,
            loading: false,
          })
        } else {
          setAccess({
            hasAccess: false,
            role: membership.role || null,
            status: membership.status || null,
            loading: false,
          })
        }
      } catch (error) {
        console.error("Error checking product access:", error)
        setAccess({
          hasAccess: false,
          role: null,
          status: null,
          loading: false,
        })
      }
    }

    checkAccess()
  }, [user, productSlug, supabase])

  return access
}

export function useOnboardingStatus(productSlug: string) {
  const { user } = useAuth()
  const [onboarding, setOnboarding] = useState<{
    completed: boolean
    loading: boolean
    profileData: any | null
    refresh: () => Promise<void>
  }>({
    completed: false,
    loading: true,
    profileData: null,
    refresh: async () => {},
  })

  const supabase = createClient()

  const fetchOnboarding = useCallback(async () => {
    if (!user) {
      setOnboarding((prev) => ({ ...prev, loading: false }))
      return
    }

    try {
      if (productSlug === "superbyte" || productSlug === "superbytego") {
        const { data } = await supabase
          .from("superbyte_onboarding")
          .select("*")
          .eq("user_id", user.id)
          .single()

        setOnboarding({
          completed: data?.onboarding_completed || false,
          profileData: data || null,
          loading: false,
          refresh: fetchOnboarding,
        })
      } else {
        // Fallback for other apps: verify and auto-provision via RPC
        const { data: membership, error } = await supabase
          .rpc("provision_product_membership", { product_slug: productSlug })
          .maybeSingle()

        if (error || !membership) {
          setOnboarding({
            completed: false,
            profileData: null,
            loading: false,
            refresh: fetchOnboarding,
          })
          return
        }

        setOnboarding({
          completed: !!membership?.onboarded_at,
          profileData: membership || null,
          loading: false,
          refresh: fetchOnboarding,
        })
      }
    } catch (error) {
      console.error("Error fetching onboarding status:", error)
      setOnboarding((prev) => ({ ...prev, loading: false }))
    }
  }, [user, productSlug, supabase])

  useEffect(() => {
    fetchOnboarding()
  }, [fetchOnboarding])

  return onboarding
}
