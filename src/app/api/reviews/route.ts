import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { auth } from "@/lib/auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

const ReviewSchema = z.object({
  product_id: z.string().min(1),
  rating:     z.number().int().min(1).max(5),
  text:       z.string().max(500).optional(),
})

// ─── GET — fetch reviews for a product (public) ───────────────────────────────

export async function GET(req: NextRequest) {
  const product_id = req.nextUrl.searchParams.get("product_id")
  if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ reviews: [] })

  const { data, error } = await client
    .from("reviews")
    .select("id, user_email, user_name, rating, text, created_at")
    .eq("product_id", product_id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ reviews: [] })

  return NextResponse.json({ reviews: data ?? [] })
}

// ─── POST — submit or update a review (auth required) ────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const raw    = await req.json().catch(() => null)
  const parsed = ReviewSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })
  }

  const client = getAdminClient()
  if (!client) return NextResponse.json({ error: "DB unavailable" }, { status: 503 })

  const row = {
    product_id: parsed.data.product_id,
    user_email: session.user.email,
    user_name:  session.user.name ?? null,
    rating:     parsed.data.rating,
    text:       parsed.data.text ?? null,
  }

  const { data, error } = await client
    .from("reviews")
    .upsert(row, { onConflict: "product_id,user_email" })
    .select("id, user_email, user_name, rating, text, created_at")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ review: data })
}
