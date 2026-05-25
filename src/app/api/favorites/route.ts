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

const ProductDataSchema = z.object({
  id:              z.string().min(1),
  title:           z.string().min(1).max(200),
  emoji:           z.string().max(10),
  price:           z.string().max(50),
  priceNum:        z.number().nonnegative(),
  oldPriceNum:     z.number().nonnegative().optional(),
  discountPercent: z.number().optional(),
  category:        z.string().max(100),
  image:           z.string().optional().nullable(),
  unit:            z.string().max(50).optional(),
  rating:          z.string().max(10),
  inStock:         z.boolean(),
  isNew:           z.boolean(),
  isHit:           z.boolean(),
  isPopular:       z.boolean(),
  tags:            z.array(z.string()).optional(),
  description:     z.string().optional(),
})

// ─── GET — fetch user's favorites ────────────────────────────────────────────

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const client = getAdminClient()
  if (!client) return NextResponse.json([])

  const { data, error } = await client
    .from("user_favorites")
    .select("product_data")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json([], { status: 200 })

  return NextResponse.json(data?.map((r) => r.product_data) ?? [])
}

// ─── POST — add a product to favorites ───────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const raw    = await req.json().catch(() => null)
  const parsed = ProductDataSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 })
  }

  const client = getAdminClient()
  if (!client) return NextResponse.json({ ok: true })

  const { error } = await client
    .from("user_favorites")
    .upsert({
      user_email:   session.user.email,
      product_id:   parsed.data.id,
      product_data: parsed.data,
    }, { onConflict: "user_email,product_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

// ─── DELETE — remove a product from favorites ────────────────────────────────

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const client = getAdminClient()
  if (!client) return NextResponse.json({ ok: true })

  const { error } = await client
    .from("user_favorites")
    .delete()
    .eq("user_email", session.user.email)
    .eq("product_id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
