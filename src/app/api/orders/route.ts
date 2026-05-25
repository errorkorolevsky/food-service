import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { sendOrderEmail } from "@/lib/email"
import { auth } from "@/lib/auth"

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
  const raw = await req.json().catch(() => null)
  const parsed = CreateOrderSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные заказа" }, { status: 400 })
  }

  const { company, phone, address, comment, payment, items, subtotal, delivery, total, delivery_date, delivery_time, user_email } = parsed.data

  const { data, error } = await supabase
    .from("orders")
    .insert({ company, phone, address, comment, payment, items, subtotal, delivery, total, delivery_date, delivery_time, user_email: user_email ?? null, status: "pending" })
    .select("id")
    .single()

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
