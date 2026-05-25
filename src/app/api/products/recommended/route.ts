import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const excludeParam = searchParams.get("exclude") ?? ""
  const exclude      = excludeParam.split(",").filter(Boolean)

  const client = getClient()
  if (!client) return NextResponse.json({ products: [] })

  let query = client
    .from("products")
    .select("id, emoji, image, title, price, price_num, in_stock, category")
    .eq("in_stock", true)
    .eq("is_hit", true)
    .limit(12)

  if (exclude.length > 0) {
    query = query.not("id", "in", `(${exclude.map((id) => `'${id}'`).join(",")})`)
  }

  const { data } = await query

  const shuffled = (data ?? []).sort(() => Math.random() - 0.5).slice(0, 6)

  return NextResponse.json({ products: shuffled })
}
