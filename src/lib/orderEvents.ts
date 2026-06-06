import { supabase, supabaseAdmin } from "@/lib/supabase"

/**
 * Order event log (Phase 3 · Part 1).
 *
 * Append-only audit trail for an order's lifecycle. Each meaningful action —
 * created, status change, courier (re)assignment, cancellation — is recorded
 * with a timestamp and the actor who triggered it. The mobile/web order screens
 * render this as a real-timestamp history (12:14 создан → 12:16 подтверждён …).
 *
 * Recording is best-effort and fire-and-forget: a failure here must never break
 * the order operation that triggered it.
 */

export type OrderEventActor = "system" | "admin" | "customer" | "courier"

export type OrderEventInput = {
  orderId: string
  event:   string          // an order status ("pending"…) or action key ("courier_assigned")
  actor?:  OrderEventActor
  note?:   string | null
}

export async function recordOrderEvent(input: OrderEventInput): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from("order_events").insert({
      order_id: input.orderId,
      event:    input.event,
      actor:    input.actor ?? "system",
      note:     input.note ?? null,
    })
    if (error) console.error("[orderEvents] insert rejected", input.event, error.message)
  } catch (err) {
    console.error("[orderEvents] failed to record", input.event, err)
  }
}

export type OrderEventRow = {
  id:         string
  order_id:   string
  event:      string
  actor:      OrderEventActor
  note:       string | null
  created_at: string
}

/** Chronological event history for an order (oldest first). */
export async function fetchOrderEvents(orderId: string): Promise<OrderEventRow[]> {
  const { data, error } = await supabase
    .from("order_events")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[orderEvents] fetch failed", error)
    return []
  }
  return (data ?? []) as OrderEventRow[]
}
