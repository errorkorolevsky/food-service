import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { products as localProducts } from "@/data/products"
import { VALID_PRODUCT_IMAGES } from "@/lib/db/products"

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

  if (client) {
    const { data } = await client
      .from("products")
      .select("id, emoji, image, title, price, price_num, category")
      .or(`title.ilike.%${q}%,category.ilike.%${q}%`)
      .eq("in_stock", true)
      .limit(7)

    if (data) return NextResponse.json(
      data.map((p: { image?: string | null; [key: string]: unknown }) => ({
        ...p,
        image: p.image && VALID_PRODUCT_IMAGES.has(p.image) ? p.image : null,
      }))
    )
  }

  // Fallback: search local products data
  const lower = q.toLowerCase()
  const results = localProducts
    .filter(
      (p) =>
        p.inStock &&
        (p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(lower)))
    )
    .slice(0, 7)
    .map((p) => ({
      id:        p.id,
      emoji:     p.emoji,
      image:     p.image,
      title:     p.title,
      price:     p.price,
      price_num: p.priceNum,
      category:  p.category,
    }))

  return NextResponse.json(results)
}
