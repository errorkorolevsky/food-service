import webpush from "web-push"
import type { PushSubscription } from "web-push"

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY  ?? ""
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY             ?? ""
const VAPID_SUBJECT = process.env.VAPID_SUBJECT                 ?? "mailto:support@food-service.kz"

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
}

export type PushPayload = {
  title: string
  body:  string
  url?:  string
  icon?: string
}

export async function sendPushToUser(userEmail: string, payload: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return

  const { createClient } = await import("@supabase/supabase-js")
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL    ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY   ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  )

  const { data } = await sb
    .from("push_subscriptions")
    .select("endpoint, keys")
    .eq("user_email", userEmail)

  if (!data?.length) return

  await Promise.allSettled(
    data.map((row) =>
      webpush.sendNotification(
        { endpoint: row.endpoint, keys: row.keys } as PushSubscription,
        JSON.stringify(payload),
      ).catch(() => {})
    )
  )
}

export const VAPID_PUBLIC_KEY = VAPID_PUBLIC
