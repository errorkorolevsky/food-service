import { NextRequest } from "next/server"
import { auth }        from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const { endpoint, keys } = body as { endpoint: string; keys: Record<string, string> }

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      { user_email: session.user.email, endpoint, keys },
      { onConflict: "endpoint" }
    )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 })

  const { endpoint } = await req.json() as { endpoint: string }
  if (!endpoint) return Response.json({ error: "Missing endpoint" }, { status: 400 })

  await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint)
  return Response.json({ ok: true })
}
