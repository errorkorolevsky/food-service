import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { sendOrderEmail } from "@/lib/email"
import { auth } from "@/lib/auth"
import { rateLimit, getIp } from "@/lib/rateLimiter"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "artemfi435@gmail.com"

const OrderItemSchema = z.object({
  id:       z.string().min(1).max(100),
  title:    z.string().min(1).max(200),
  emoji:    z.string().max(10),
  price:    z.number().nonnegative().max(10_000_000),
  quantity: z.number().int().positive().max(999),
  image:    z.string().optional().nullable(),
})

const CreateOrderSchema = z.object({
  company:       z.string().max(200).optional().nullable(),
  phone:         z.string().min(5).max(30),
  address:       z.string().min(3).max(500),
  comment:       z.string().max(1000).optional().nullable(),
  payment:       z.enum(["kaspi", "freedom", "cash"]),
  items:         z.array(OrderItemSchema).min(1).max(200),
  subtotal:      z.number().nonnegative(),
  delivery:      z.number().nonnegative(),
  total:         z.number().positive(),
  delivery_date: z.string().max(50).optional().nullable(),
  delivery_time: z.string().max(100).optional().nullable(),
  user_email:    z.string().email().optional().nullable(),
  promo_code:    z.string().max(50).optional().nullable(),
  discount:      z.number().nonnegative().optional(),
})

// ─── GET — список заказов для admin panel ────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// ─── POST — создать заказ (checkout) ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Слишком много запросов. Попробуйте через 10 минут." }, { status: 429 })
  }

  const raw = await req.json().catch(() => null)
  const parsed = CreateOrderSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные заказа" }, { status: 400 })
  }

  const { company, phone, address, comment, payment, items, subtotal, delivery, total, delivery_date, delivery_time, user_email, promo_code, discount } = parsed.data

  const { data, error } = await supabase
    .from("orders")
    .insert({
      company, phone, address, comment, payment, items, subtotal, delivery, total,
      delivery_date, delivery_time, user_email: user_email ?? null, status: "pending",
      promo_code: promo_code ?? null, discount: discount ?? 0,
    })
    .select("id")
    .single()

  if (!error && promo_code) {
    const adminClient = getAdminClient()
    if (adminClient) {
      const upper = promo_code.toUpperCase();
      (async () => {
        const { data: p } = await adminClient.from("promo_codes").select("uses").eq("code", upper).single()
        if (p) await adminClient.from("promo_codes").update({ uses: p.uses + 1 }).eq("code", upper)
      })().catch(() => null)
    }
  }

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (user_email) {
    sendOrderEmail({
      to:      user_email,
      orderId: data.id,
      status:  "pending",
      items,
      total,
      address,
    }).catch(console.error)
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
