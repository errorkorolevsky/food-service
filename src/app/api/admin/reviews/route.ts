import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { ADMIN_EMAIL } from "@/lib/admin"

export const dynamic = "force-dynamic"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) return null
  return session
}

// ─── GET — list all reviews (admin) ──────────────────────────────────────────

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ reviews: [] })

  const { data, error } = await client
    .from("reviews")
    .select("id, product_id, user_email, user_name, rating, text, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ reviews: [] })
  return NextResponse.json({ reviews: data ?? [] })
}

// ─── DELETE — remove a review by id ──────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const { error } = await client.from("reviews").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
