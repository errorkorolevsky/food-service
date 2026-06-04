import { NextRequest, NextResponse } from "next/server"
import { generateOtp, createOtpChallenge } from "@/lib/mobileAuth"
import { sendOtpCode } from "@/lib/email"
import { rateLimit } from "@/lib/rateLimiter"

export const dynamic = "force-dynamic"

// ─── POST — request a 6-digit login code for the mobile app ───────────────────
// Lives under /api/mobile/* (not /api/auth/*) so the NextAuth [...nextauth]
// catch-all never intercepts it.
export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 })
  }
  const normalized = email.toLowerCase().trim()

  // 3 codes per email per 5 minutes
  if (!rateLimit(`mobile-otp:${normalized}`, 3, 5 * 60_000)) {
    return NextResponse.json({ error: "Слишком много запросов. Попробуйте через 5 минут." }, { status: 429 })
  }

  const code = generateOtp()
  const { expires, signature } = createOtpChallenge(normalized, code)

  try {
    await sendOtpCode({ to: normalized, code })
  } catch {
    return NextResponse.json({ error: "Ошибка отправки письма" }, { status: 500 })
  }

  // Stateless challenge — the code itself is only in the email.
  return NextResponse.json({ email: normalized, expires, signature })
}
