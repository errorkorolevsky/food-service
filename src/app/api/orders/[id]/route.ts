import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin }   from "@/lib/supabase"
import { sendOrderEmail }            from "@/lib/email"
import { notifyTelegramStatusChange } from "@/lib/telegram"
import { sendPushToUser }            from "@/lib/push"
import { sendSms }                   from "@/lib/sms"
import { recordOrderEvent }          from "@/lib/orderEvents"
import { getApiSession }             from "@/lib/mobileAuth"
import { ADMIN_EMAIL }               from "@/lib/admin"

export const dynamic = "force-dynamic"

// ─── GET — a single order by id ───────────────────────────────────────────────
// Consumed by the order-detail screen (web tracking + mobile app, customer and
// admin). The UUID acts as an unguessable capability — same exposure model as
// /api/orders/track — so guests can view an order they just placed.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sess = await getApiSession(req)
  if (!sess || sess.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id }     = await params
  const { status } = await req.json()

  const VALID = ["pending", "processing", "in_delivery", "delivered", "cancelled"]
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Недопустимый статус" }, { status: 400 })
  }

  const { data: updated, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("id")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  recordOrderEvent({ orderId: id, event: status, actor: "admin" })

  // Отправляем email уведомление если у заказа есть email
  const { data: order } = await supabase
    .from("orders")
    .select("user_email, phone, items, total, address, delivery_date, delivery_time")
    .eq("id", id)
    .single()

  if (order?.user_email) {
    sendOrderEmail({
      to:           order.user_email,
      orderId:      id,
      status,
      items:        order.items,
      total:        order.total,
      address:      order.address,
      deliveryDate: order.delivery_date,
      deliveryTime: order.delivery_time,
    }).catch(console.error)
  }

  if (order?.phone) {
    notifyTelegramStatusChange({
      orderId: id,
      status,
      phone:   order.phone,
    }).catch(console.error)
  }

  if (order?.phone) {
    const smsLabels: Record<string, string> = {
      processing:  `Food Service: ваш заказ #FS-${id.slice(-6).toUpperCase()} принят в обработку`,
      in_delivery: `Food Service: ваш заказ передан курьеру`,
      delivered:   `Food Service: заказ доставлен! Спасибо за покупку`,
      cancelled:   `Food Service: ваш заказ отменён`,
    }
    const smsText = smsLabels[status]
    if (smsText) {
      sendSms({ to: order.phone, message: smsText }).catch(console.error)
    }
  }

  if (order?.user_email) {
    const statusLabels: Record<string, string> = {
      processing:  "Заказ принят в обработку",
      in_delivery: "Заказ передан курьеру",
      delivered:   "Заказ доставлен",
      cancelled:   "Заказ отменён",
    }
    const label = statusLabels[status]
    if (label) {
      sendPushToUser(order.user_email, {
        title: "Food Service",
        body:  label,
        url:   `/order/track/${id}`,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ ok: true })
}
