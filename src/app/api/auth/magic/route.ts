import { NextRequest, NextResponse } from "next/server"
import { createToken } from "@/lib/magicTokens"
import { sendMagicLink } from "@/lib/email"
import { rateLimit } from "@/lib/rateLimiter"

export const dynamic = "force-dynamic"

// ─── POST — request magic link ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 })
  }

  // 3 magic links per email per 5 minutes
  if (!rateLimit(`magic:${email.toLowerCase().trim()}`, 3, 5 * 60_000)) {
    return NextResponse.json({ error: "Слишком много запросов. Попробуйте через 5 минут." }, { status: 429 })
  }

  const token      = createToken(email.toLowerCase().trim())
  const baseUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "https://food-service-beta.vercel.app"
  const magicUrl   = `${baseUrl}/api/auth/magic/verify?token=${token}`

  try {
    await sendMagicLink({ to: email, url: magicUrl })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Ошибка отправки письма" }, { status: 500 })
  }
}
