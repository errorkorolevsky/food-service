import { NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/magicTokens"
import { sendMagicLink } from "@/lib/email"

export const dynamic = "force-dynamic"

// ─── POST — request magic link ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 })
  }

  const token      = createToken(email.toLowerCase().trim())
  const baseUrl    = process.env.NEXTAUTH_URL ?? "https://nova-food.vercel.app"
  const magicUrl   = `${baseUrl}/api/auth/magic/verify?token=${token}`

  try {
    await sendMagicLink({ to: email, url: magicUrl })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Ошибка отправки письма" }, { status: 500 })
  }
}
