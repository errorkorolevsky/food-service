import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export const dynamic = "force-dynamic"

// ─── GET — verify magic link token ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url))
  }

  try {
    await signIn("magic", { token, redirectTo: "/profile" })
  } catch (e) {
    // NextAuth throws a redirect — re-throw it so Next.js handles it
    throw e
  }
}
