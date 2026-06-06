import { NextRequest } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { verifyKaspiWebhook } from "@/lib/payment"
import { sendPushToUser }     from "@/lib/push"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get("x-kaspi-signature") ?? ""

  if (!process.env.KASPI_API_KEY) {
    return new Response("Not configured", { status: 501 })
  }

  const result = verifyKaspiWebhook(body, signature)
  if (!result) {
    return Response.json({ error: "Invalid signature" }, { status: 401 })
  }

  if (result.paid && result.orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_email, status")
      .eq("id", result.orderId)
      .single()

    if (order && order.status === "pending") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "processing" })
        .eq("id", result.orderId)

      if (order.user_email) {
        sendPushToUser(order.user_email, {
          title: "Food Service",
          body:  "Оплата подтверждена — заказ принят в обработку",
          url:   `/order/track/${result.orderId}`,
        }).catch(console.error)
      }
    }
  }

  return Response.json({ ok: true })
}
