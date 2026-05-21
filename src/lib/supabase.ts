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
