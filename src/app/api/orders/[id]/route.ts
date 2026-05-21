import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendOrderEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }     = await params
  const { status } = await req.json()

  const VALID = ["pending", "processing", "in_delivery", "delivered", "cancelled"]
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 })
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Отправляем email уведомление если у заказа есть email
  const { data: order } = await supabase
    .from("orders")
    .select("user_email, items, total, address")
    .eq("id", id)
    .single()

  if (order?.user_email) {
    sendOrderEmail({
      to:      order.user_email,
      orderId: id,
      status,
      items:   order.items,
      total:   order.total,
      address: order.address,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
