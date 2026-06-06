import { NextRequest } from "next/server"
import { auth }        from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// POST /api/restock   { productId, productTitle }  — subscribe
// DELETE /api/restock { productId }               — unsubscribe
// GET /api/restock?productId=X                   — check if subscribed

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return Response.json({ subscribed: false })

  const productId = req.nextUrl.searchParams.get("productId")
  if (!productId) return Response.json({ subscribed: false })

  const { data } = await supabaseAdmin
    .from("restock_subscriptions")
    .select("id")
    .eq("user_email", session.user.email)
    .eq("product_id", productId)
    .maybeSingle()

  return Response.json({ subscribed: !!data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 })

  const { productId, productTitle } = await req.json() as { productId: string; productTitle: string }
  if (!productId) return Response.json({ error: "Missing productId" }, { status: 400 })

  const { error } = await supabaseAdmin
    .from("restock_subscriptions")
    .upsert(
      { user_email: session.user.email, product_id: productId, product_title: productTitle ?? productId },
      { onConflict: "user_email,product_id" }
    )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) return new Response("Unauthorized", { status: 401 })

  const { productId } = await req.json() as { productId: string }
  await supabaseAdmin
    .from("restock_subscriptions")
    .delete()
    .eq("user_email", session.user.email)
    .eq("product_id", productId)

  return Response.json({ ok: true })
}
