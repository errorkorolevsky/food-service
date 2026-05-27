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
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) return NextResponse.json([])

  const client = getClient()
  if (!client) return NextResponse.json([])

  const { data } = await client
    .from("products")
    .select("id, emoji, image, title, price, price_num, category")
    .or(`title.ilike.%${q}%,category.ilike.%${q}%`)
    .eq("in_stock", true)
    .limit(7)

  return NextResponse.json(data ?? [])
}
