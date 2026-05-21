import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendOrderEmail } from "@/lib/email"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "artemfi435@gmail.com"

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
  const body = await req.json()
  const { company, phone, address, comment, payment, items, subtotal, delivery, total, user_email } = body

  if (!phone || !address || !items?.length) {
    return NextResponse.json({ error: "Заполните обязательные поля" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({ company, phone, address, comment, payment, items, subtotal, delivery, total, user_email: user_email ?? null, status: "pending" })
    .select("id")
    .single()

  if (error) {
    console.error("Supabase error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Отправляем email подтверждения если есть адрес
  const emailTo = user_email ?? null
  if (emailTo) {
    sendOrderEmail({
      to:      emailTo,
      orderId: data.id,
      status:  "pending",
      items,
      total,
      address,
    }).catch(console.error)
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
