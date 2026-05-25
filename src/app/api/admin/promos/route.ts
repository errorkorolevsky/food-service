import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "artemfi435@gmail.com"

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

const CreatePromoSchema = z.object({
  code:           z.string().min(2).max(30).regex(/^[A-Z0-9_-]+$/, "Только заглавные буквы, цифры, _ и -"),
  discount_type:  z.enum(["percent", "fixed"]),
  discount_value: z.number().int().min(1).max(100_000),
  min_order:      z.number().int().min(0).default(0),
  max_uses:       z.number().int().min(1).optional().nullable(),
  expires_at:     z.string().datetime().optional().nullable(),
})

// ─── GET — list all promo codes ───────────────────────────────────────────────

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ promos: [] })

  const { data, error } = await client
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ promos: [] })
  return NextResponse.json({ promos: data ?? [] })
}

// ─── POST — create a new promo code ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const raw    = await req.json().catch(() => null)
  const parsed = CreatePromoSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 })
  }

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const { data, error } = await client
    .from("promo_codes")
    .insert({
      code:           parsed.data.code.toUpperCase(),
      discount_type:  parsed.data.discount_type,
      discount_value: parsed.data.discount_value,
      min_order:      parsed.data.min_order,
      max_uses:       parsed.data.max_uses ?? null,
      expires_at:     parsed.data.expires_at ?? null,
      is_active:      true,
      uses:           0,
    })
    .select("*")
    .single()

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Промокод уже существует" }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ promo: data }, { status: 201 })
}

// ─── PATCH — toggle is_active ─────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, is_active } = await req.json().catch(() => ({}))
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const { error } = await client
    .from("promo_codes")
    .update({ is_active: !!is_active })
    .eq("code", code)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
