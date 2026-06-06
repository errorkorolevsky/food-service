import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/orders/track?q=#FS-B7CD4B | ?q=+79991234567 | ?q=email@example.com
//     /api/orders/track?email=...&phone=...   (signed-in customer history, mobile)
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  // Signed-in customer history (mobile app): explicit email/phone params, match
  // either. The web tracking page uses the single `q` param below.
  const email = sp.get("email")?.trim()
  const phone = sp.get("phone")?.trim()
  if (email || phone) {
    let query = supabase.from("orders").select("*")
    if (email && phone)  query = query.or(`user_email.eq.${email},phone.eq.${phone}`)
    else if (email)      query = query.eq("user_email", email)
    else                 query = query.eq("phone", phone as string)

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  const q = sp.get("q")?.trim()
  if (!q)          return NextResponse.json({ error: "Укажите номер заказа или телефон" }, { status: 400 })
  if (q.length > 200) return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 })

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
