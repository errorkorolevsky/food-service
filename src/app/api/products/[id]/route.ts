import { NextRequest, NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { getApiSession } from "@/lib/mobileAuth"
import { ADMIN_EMAIL }   from "@/lib/admin"

export const dynamic = "force-dynamic"

// Match the catalog's stored price string (see src/lib/db/products.ts).
const priceString = (n: number) => `₸${n.toLocaleString("ru-RU")}`

// ─── PATCH — admin edits price / sale / availability ──────────────────────────
// Used by the mobile business cabinet. Keeps the display `price` string,
// numeric `price_num` and derived `discount_percent` consistent on the server.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sess = await getApiSession(req)
  if (!sess || sess.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Current values — needed to recompute the discount from a partial edit.
  const { data: current, error: readErr } = await supabase
    .from("products")
    .select("price_num, old_price_num")
    .eq("id", id)
    .single()

  if (readErr || !current) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 })
  }

  const update: Record<string, unknown> = {}

  if (typeof body.inStock === "boolean") {
    update.in_stock = body.inStock
  }

  if (body.priceNum !== undefined) {
    const priceNum = Math.round(Number(body.priceNum))
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: "Недопустимая цена" }, { status: 400 })
    }
    update.price_num = priceNum
    update.price = priceString(priceNum)
  }

  if (body.oldPriceNum !== undefined) {
    if (body.oldPriceNum === null) {
      update.old_price_num = null
    } else {
      const old = Math.round(Number(body.oldPriceNum))
      if (!Number.isFinite(old) || old <= 0) {
        return NextResponse.json({ error: "Недопустимая старая цена" }, { status: 400 })
      }
      update.old_price_num = old
    }
  }

  // Recompute discount whenever either price changed.
  if ("price_num" in update || "old_price_num" in update) {
    const price = (update.price_num as number | undefined) ?? current.price_num
    const old = "old_price_num" in update
      ? (update.old_price_num as number | null)
      : (current.old_price_num as number | null)
    update.discount_percent = old && old > price ? Math.round((1 - price / old) * 100) : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Нет изменений" }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(update)
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
