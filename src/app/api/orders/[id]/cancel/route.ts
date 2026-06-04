import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { notifyTelegramStatusChange } from "@/lib/telegram"
import { recordOrderEvent } from "@/lib/orderEvents"

export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body   = await req.json().catch(() => null)

  const phone: string | undefined = body?.phone
  const email: string | undefined = body?.email

  if (!phone && !email) {
    return NextResponse.json({ error: "Укажите телефон или email" }, { status: 400 })
  }

  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("id, status, phone, user_email")
    .eq("id", id)
    .single()

  if (fetchErr || !order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  const ownsViaEmail = email && order.user_email && order.user_email === email
  const ownsViaPhone = phone && order.phone      && order.phone      === phone

  if (!ownsViaEmail && !ownsViaPhone) {
    return NextResponse.json({ error: "Нет доступа к этому заказу" }, { status: 403 })
  }

  if (order.status !== "pending") {
    return NextResponse.json(
      { error: "Можно отменить только заказ в статусе «Ожидает»" },
      { status: 400 }
    )
  }

  const { error: updateErr } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  recordOrderEvent({ orderId: id, event: "cancelled", actor: "customer", note: "Отменён клиентом" })

  notifyTelegramStatusChange({
    orderId:             id,
    status:              "cancelled",
    phone:               order.phone,
    cancelledByCustomer: true,
  }).catch(console.error)

  return NextResponse.json({ ok: true })
}
