import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/orders/track?q=#FS-B7CD4B | ?q=+79991234567 | ?q=email@example.com
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ error: "Укажите номер заказа или телефон" }, { status: 400 })

  // По UUID-суффиксу (#FS-XXXXXX)
  if (q.startsWith("#")) {
    const suffix = q.replace("#FS-", "").toLowerCase()
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .ilike("id", `%${suffix}`)
      .limit(1)
      .single()

    if (error || !data) return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    return NextResponse.json([data])
  }

  // По email (если содержит @)
  if (q.includes("@")) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_email", q)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  // По телефону
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("phone", q)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
