import { NextRequest, NextResponse } from "next/server"
import { supabase }      from "@/lib/supabase"
import { getApiSession } from "@/lib/mobileAuth"

export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "artemfi435@gmail.com"

// ─── PATCH — assign (or clear) the courier for an order ───────────────────────
// Admin-only. Stores who delivers the order; status is managed separately by
// PATCH /api/orders/[id]. Pass courierName: null to unassign.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sess = await getApiSession(req)
  if (!sess || sess.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const { courierName, courierPhone } = await req.json()

  const clearing = courierName === null
  if (!clearing && (typeof courierName !== "string" || courierName.trim() === "")) {
    return NextResponse.json({ error: "Укажите курьера" }, { status: 400 })
  }

  const update = clearing
    ? { courier_name: null, courier_phone: null, courier_assigned_at: null }
    : {
        courier_name: courierName.trim(),
        courier_phone: typeof courierPhone === "string" && courierPhone.trim() !== "" ? courierPhone.trim() : null,
        courier_assigned_at: new Date().toISOString(),
      }

  const { error } = await supabase.from("orders").update(update).eq("id", id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
