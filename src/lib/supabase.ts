import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Compiler-safe env variable resolution for monorepo workspaces
const getEnv = () => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    return (import.meta as any).env
  }
  if (typeof globalThis !== "undefined" && (globalThis as any).process?.env) {
    return (globalThis as any).process.env
  }
  return {}
}

const env = getEnv()

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || "https://yyblpycpuifsvzykcrvz.supabase.co"
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "sb_publishable_TCOv2m03iG3U4N4Rs3gAvg_I09qnrpW"

let browserClient: any = null

export function createClient() {
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
    }
    return browserClient
  }
  // Server-side client configuration
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
