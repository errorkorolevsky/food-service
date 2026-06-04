import { NextRequest, NextResponse } from "next/server"
import { verifyOtp, mintMobileToken } from "@/lib/mobileAuth"

export const dynamic = "force-dynamic"

// ─── POST — verify the code and issue a mobile session JWT ────────────────────
// Lives under /api/mobile/* (not /api/auth/*) so the NextAuth [...nextauth]
// catch-all never intercepts it.
export async function POST(req: NextRequest) {
  const { email, code, expires, signature } = await req.json()
  const normalized = String(email || "").toLowerCase().trim()

  if (!verifyOtp(normalized, String(code || ""), Number(expires), String(signature || ""))) {
    return NextResponse.json({ error: "Неверный или просроченный код" }, { status: 401 })
  }

  const token = await mintMobileToken(normalized)
  return NextResponse.json({
    token,
    user: { id: normalized, email: normalized, name: normalized.split("@")[0] },
  })
}
