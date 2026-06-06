import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key"
    _client = createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
    })
  }
  return _client
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

let _admin: SupabaseClient | null = null

/**
 * Service-role client — bypasses RLS. Use for privileged writes in already
 * authorization-gated routes (admin order status/courier, owner cancel).
 * The anon client's UPDATEs are silently blocked by RLS (0 rows, no error),
 * which makes mutations look successful while persisting nothing. Falls back to
 * the anon key only when the service-role key is absent (e.g. local dev).
 */
function getAdminClient(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_anon_key"
    _admin = createClient(url, key, { auth: { persistSession: false } })
  }
  return _admin
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getAdminClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
