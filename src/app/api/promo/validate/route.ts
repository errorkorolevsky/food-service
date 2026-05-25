import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

export const dynamic = "force-dynamic"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

const ValidateSchema = z.object({
  code:     z.string().min(1).max(50),
  subtotal: z.number().nonnegative(),
})

// ─── POST — validate a promo code (no side effects) ──────────────────────────

export async function POST(req: NextRequest) {
  const raw    = await req.json().catch(() => null)
  const parsed = ValidateSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { code, subtotal } = parsed.data
  const upperCode = code.toUpperCase()

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const { data: promo, error } = await client
    .from("promo_codes")
    .select("code, discount_type, discount_value, min_order, max_uses, uses, expires_at, is_active")
    .eq("code", upperCode)
    .single()

  if (error || !promo) {
    return NextResponse.json({ error: "Промокод не найден" }, { status: 404 })
  }

  if (!promo.is_active) {
    return NextResponse.json({ error: "Промокод неактивен" }, { status: 400 })
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ error: "Срок действия промокода истёк" }, { status: 400 })
  }

  if (promo.max_uses !== null && promo.uses >= promo.max_uses) {
    return NextResponse.json({ error: "Лимит использований промокода исчерпан" }, { status: 400 })
  }

  if (subtotal < promo.min_order) {
    return NextResponse.json({
      error: `Минимальная сумма заказа для этого промокода: ₸${promo.min_order.toLocaleString()}`,
    }, { status: 400 })
  }

  const amount = promo.discount_type === "percent"
    ? Math.round(subtotal * promo.discount_value / 100)
    : Math.min(promo.discount_value, subtotal)

  return NextResponse.json({
    code:     upperCode,
    type:     promo.discount_type,
    value:    promo.discount_value,
    amount,
  })
}
