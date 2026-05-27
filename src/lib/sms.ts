/**
 * SMS notification abstraction layer.
 *
 * Provider selection via SMS_PROVIDER env var:
 *   "mock"     — logs to console, no real SMS (default when not set)
 *   "mobizon"  — Mobizon Kazakhstan (https://mobizon.kz)
 *   "smsaero"  — SMS Aero
 *   "smsc"     — SMSC.ru / SMSC.kz
 *
 * Required env vars per provider:
 *   MOBIZON_API_KEY
 *   SMSAERO_EMAIL + SMSAERO_API_KEY
 *   SMSC_LOGIN + SMSC_PASSWORD
 */

const PROVIDER  = process.env.SMS_PROVIDER ?? "mock"
const SMS_FROM  = process.env.SMS_FROM     ?? "FoodServ"

export type SmsPayload = {
  to:      string  // E.164 or local KZ format, e.g. "+77001234567" or "87001234567"
  message: string
}

export async function sendSms(payload: SmsPayload): Promise<void> {
  const phone = normalizePhone(payload.to)
  if (!phone) {
    console.warn("[SMS] Invalid phone, skipping:", payload.to)
    return
  }

  switch (PROVIDER) {
    case "mobizon":  return sendMobizon(phone, payload.message)
    case "smsaero":  return sendSmsAero(phone, payload.message)
    case "smsc":     return sendSmsc(phone, payload.message)
    default:         return sendMock(phone, payload.message)
  }
}

// ─── MOCK ──────────────────────────────────────────────────────────────────────

async function sendMock(phone: string, message: string): Promise<void> {
  console.log(`[SMS:mock] → ${phone}: ${message}`)
}

// ─── MOBIZON (Kazakhstan) ──────────────────────────────────────────────────────

async function sendMobizon(phone: string, message: string): Promise<void> {
  const apiKey = process.env.MOBIZON_API_KEY
  if (!apiKey) { console.warn("[SMS:mobizon] MOBIZON_API_KEY not set"); return }

  const res = await fetch("https://api.mobizon.kz/service/message/sendsmsmessage", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      apiKey,
      recipient: phone,
      text:      message,
      from:      SMS_FROM,
    }),
  })
  if (!res.ok) console.error("[SMS:mobizon] HTTP", res.status, await res.text())
}

// ─── SMS AERO ─────────────────────────────────────────────────────────────────

async function sendSmsAero(phone: string, message: string): Promise<void> {
  const email  = process.env.SMSAERO_EMAIL
  const apiKey = process.env.SMSAERO_API_KEY
  if (!email || !apiKey) { console.warn("[SMS:smsaero] credentials not set"); return }

  const auth = Buffer.from(`${email}:${apiKey}`).toString("base64")
  const res  = await fetch(`https://gate.smsaero.ru/v2/sms/send?number=${phone}&text=${encodeURIComponent(message)}&sign=${SMS_FROM}`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  if (!res.ok) console.error("[SMS:smsaero] HTTP", res.status, await res.text())
}

// ─── SMSC ─────────────────────────────────────────────────────────────────────

async function sendSmsc(phone: string, message: string): Promise<void> {
  const login    = process.env.SMSC_LOGIN
  const password = process.env.SMSC_PASSWORD
  if (!login || !password) { console.warn("[SMS:smsc] credentials not set"); return }

  const url = new URL("https://smsc.kz/sys/send.php")
  url.searchParams.set("login",    login)
  url.searchParams.set("psw",      password)
  url.searchParams.set("phones",   phone)
  url.searchParams.set("mes",      message)
  url.searchParams.set("sender",   SMS_FROM)
  url.searchParams.set("charset",  "utf-8")
  url.searchParams.set("fmt",      "3")

  const res = await fetch(url.toString())
  if (!res.ok) console.error("[SMS:smsc] HTTP", res.status, await res.text())
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && digits.startsWith("8"))   return "7" + digits.slice(1)
  if (digits.length === 11 && digits.startsWith("7"))   return digits
  if (digits.length === 10 && digits.startsWith("7"))   return "7" + digits
  return null
}
