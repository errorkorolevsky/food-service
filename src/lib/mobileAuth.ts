import { createHmac, timingSafeEqual } from "crypto"
import { encode, decode } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

/**
 * Mobile (Expo) authentication helpers.
 *
 * The Expo app can't use NextAuth's cookie session directly, so we:
 *  1) issue a **stateless** email-OTP challenge (HMAC-signed — no server storage,
 *     reliable on serverless) and
 *  2) mint a self-contained session JWT the app stores and sends as `Bearer`.
 *
 * Protected API routes call `getApiSession()` which accepts either the web
 * NextAuth cookie OR the mobile Bearer token — so the identity stays unified.
 */

const SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || ""
const OTP_TTL_MS = 10 * 60 * 1000           // 10 minutes to enter the code
const JWT_SALT = "fs-mobile-session"
const JWT_MAX_AGE = 60 * 60 * 24 * 30        // 30-day mobile session

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6 digits
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex")
}

/** Sign email+code+expiry so verify needs no server-side store (Vercel-safe). */
export function createOtpChallenge(email: string, code: string) {
  const expires = Date.now() + OTP_TTL_MS
  const signature = sign(`${email.toLowerCase()}.${code}.${expires}`)
  return { expires, signature }
}

export function verifyOtp(email: string, code: string, expires: number, signature: string): boolean {
  if (!email || !code || !expires || !signature) return false
  if (Date.now() > Number(expires)) return false
  const expected = sign(`${email.toLowerCase()}.${code}.${expires}`)
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function mintMobileToken(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim()
  return encode({
    token: { sub: normalized, email: normalized, name: normalized.split("@")[0] },
    secret: SECRET,
    salt: JWT_SALT,
    maxAge: JWT_MAX_AGE,
  })
}

/** Resolve the signed-in user from a web cookie OR a mobile Bearer JWT. */
export async function getApiSession(req: NextRequest): Promise<{ email: string } | null> {
  // 1) Web NextAuth cookie session
  try {
    const session = await auth()
    if (session?.user?.email) return { email: session.user.email }
  } catch {
    /* not in a cookie context */
  }
  // 2) Mobile Bearer token
  const header = req.headers.get("authorization") || ""
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : null
  if (bearer) {
    try {
      const decoded = await decode<{ email?: string }>({ token: bearer, secret: SECRET, salt: JWT_SALT })
      if (decoded?.email) return { email: decoded.email }
    } catch {
      /* invalid / expired token */
    }
  }
  return null
}
