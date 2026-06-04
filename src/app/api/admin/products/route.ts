import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth }         from "@/lib/auth"
import { sendPushToUser } from "@/lib/push"
import { z }            from "zod"
import { ADMIN_EMAIL }  from "@/lib/admin"

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

const PatchSchema = z.object({
  id:        z.string().min(1),
  in_stock:  z.boolean().optional(),
  price_num: z.number().int().positive().optional(),
})

// ─── GET — list all products ──────────────────────────────────────────────────

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ products: [] })

  const { data, error } = await client
    .from("products")
    .select("id, emoji, image, category, title, price, price_num, in_stock, is_hit, is_new")
    .order("category", { ascending: true })
    .order("title", { ascending: true })

  if (error) return NextResponse.json({ products: [] })
  return NextResponse.json({ products: data ?? [] })
}

// ─── PATCH — update in_stock and/or price ────────────────────────────────────

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const raw    = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(raw)
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const updates: Record<string, unknown> = {}
  if (parsed.data.in_stock !== undefined) updates.in_stock = parsed.data.in_stock
  if (parsed.data.price_num !== undefined) {
    updates.price_num = parsed.data.price_num
    updates.price     = `₸${parsed.data.price_num.toLocaleString("ru-RU")}`
  }

  const { error } = await client
    .from("products")
    .update(updates)
    .eq("id", parsed.data.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify restock subscribers when product comes back in stock
  if (parsed.data.in_stock === true) {
    const productId = parsed.data.id;
    (async () => {
      const { data: subs } = await client
        .from("restock_subscriptions")
        .select("user_email, product_title")
        .eq("product_id", productId)
      if (!subs?.length) return
      await Promise.allSettled(subs.map((s) =>
        sendPushToUser(s.user_email, {
          title: "Food Service",
          body:  `${s.product_title} снова в наличии!`,
          url:   `/product/${productId}`,
        })
      ))
      await client.from("restock_subscriptions").delete().eq("product_id", productId)
    })().catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
