import { NextRequest, NextResponse } from "next/server"
import { fetchOrderEvents } from "@/lib/orderEvents"

export const dynamic = "force-dynamic"

// ─── GET — the lifecycle event log for an order ───────────────────────────────
// Consumed by the order-detail screen (web tracking + mobile, customer & admin).
// The order UUID acts as an unguessable capability, the same exposure model as
// GET /api/orders/[id] and /api/orders/track.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const events = await fetchOrderEvents(id)
  return NextResponse.json(events)
}
