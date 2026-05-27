/**
 * Payment verification abstraction layer for Kazakhstan providers.
 *
 * Supported providers:
 *   "mock"    — auto-confirms, no real payment (default in dev)
 *   "kaspi"   — Kaspi Pay QR/deeplink
 *   "freedom" — Freedom Pay (Wooppay) card processing
 *
 * Required env vars:
 *   KASPI_SHOP_ID, KASPI_API_KEY
 *   FREEDOM_MERCHANT_ID, FREEDOM_SECRET_KEY
 *   PAYMENT_PROVIDER = "mock" | "kaspi" | "freedom"
 */

import crypto from "crypto"

const PROVIDER = process.env.PAYMENT_PROVIDER ?? "mock"

export type PaymentMethod = "kaspi" | "freedom" | "cash"

export type PaymentInitResult = {
  paymentUrl: string
  externalId: string
}

export type WebhookVerifyResult = {
  ok:      boolean
  orderId: string
  paid:    boolean
  amount?: number
}

// ─── INIT PAYMENT ─────────────────────────────────────────────────────────────

export async function initPayment(opts: {
  orderId:   string
  amount:    number
  method:    PaymentMethod
  phone?:    string
  returnUrl: string
}): Promise<PaymentInitResult | null> {
  if (opts.method === "cash") return null

  switch (PROVIDER) {
    case "kaspi":   return initKaspiPayment(opts)
    case "freedom": return initFreedomPayment(opts)
    default:        return initMockPayment(opts)
  }
}

// ─── VERIFY WEBHOOK ───────────────────────────────────────────────────────────

export function verifyKaspiWebhook(body: string, signature: string): WebhookVerifyResult | null {
  const apiKey = process.env.KASPI_API_KEY ?? ""
  const expected = crypto.createHmac("sha256", apiKey).update(body).digest("hex")
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null
  }

  const data = JSON.parse(body)
  return {
    ok:      true,
    orderId: data.merchantOrderId ?? data.order_id ?? "",
    paid:    data.status === "APPROVED" || data.status === "PAID",
    amount:  data.amount,
  }
}

export function verifyFreedomWebhook(body: string, signature: string): WebhookVerifyResult | null {
  const secretKey = process.env.FREEDOM_SECRET_KEY ?? ""
  const expected  = crypto.createHmac("sha256", secretKey).update(body).digest("hex")
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null
  }

  const data = JSON.parse(body)
  return {
    ok:      true,
    orderId: data.order_id ?? data.merchant_order_id ?? "",
    paid:    data.status === "success" || data.code === "0",
    amount:  data.amount,
  }
}

// ─── KASPI ────────────────────────────────────────────────────────────────────

async function initKaspiPayment(opts: Parameters<typeof initPayment>[0]): Promise<PaymentInitResult | null> {
  const shopId = process.env.KASPI_SHOP_ID
  const apiKey = process.env.KASPI_API_KEY
  if (!shopId || !apiKey) {
    console.warn("[Payment:kaspi] KASPI_SHOP_ID or KASPI_API_KEY not set — falling back to mock")
    return initMockPayment(opts)
  }

  try {
    const res = await fetch("https://kaspi.kz/online/api/payments/create", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        shopId,
        orderId:   opts.orderId,
        amount:    opts.amount * 100,
        returnUrl: opts.returnUrl,
        phone:     opts.phone,
      }),
    })

    if (!res.ok) throw new Error(`Kaspi HTTP ${res.status}`)
    const data = await res.json()
    return { paymentUrl: data.paymentUrl, externalId: data.paymentId ?? opts.orderId }
  } catch (err) {
    console.error("[Payment:kaspi]", err)
    return null
  }
}

// ─── FREEDOM PAY ─────────────────────────────────────────────────────────────

async function initFreedomPayment(opts: Parameters<typeof initPayment>[0]): Promise<PaymentInitResult | null> {
  const merchantId = process.env.FREEDOM_MERCHANT_ID
  const secretKey  = process.env.FREEDOM_SECRET_KEY
  if (!merchantId || !secretKey) {
    console.warn("[Payment:freedom] credentials not set — falling back to mock")
    return initMockPayment(opts)
  }

  const pg_salt      = crypto.randomBytes(8).toString("hex")
  const pg_order_id  = opts.orderId
  const pg_merchant_id = merchantId
  const pg_amount    = String(opts.amount)

  const sig = crypto
    .createHash("md5")
    .update(`${pg_merchant_id};${pg_order_id};${pg_amount};${pg_salt};${secretKey}`)
    .digest("hex")

  const url = new URL("https://api.freedompay.kz/payment.php")
  url.searchParams.set("pg_merchant_id", pg_merchant_id)
  url.searchParams.set("pg_order_id",    pg_order_id)
  url.searchParams.set("pg_amount",      pg_amount)
  url.searchParams.set("pg_currency",    "KZT")
  url.searchParams.set("pg_salt",        pg_salt)
  url.searchParams.set("pg_sig",         sig)
  url.searchParams.set("pg_success_url", opts.returnUrl)

  return { paymentUrl: url.toString(), externalId: pg_order_id }
}

// ─── MOCK ─────────────────────────────────────────────────────────────────────

async function initMockPayment(opts: Parameters<typeof initPayment>[0]): Promise<PaymentInitResult> {
  console.log(`[Payment:mock] Simulating payment for order ${opts.orderId}, ₸${opts.amount}`)
  return {
    paymentUrl: `/order/success?id=${opts.orderId}`,
    externalId: opts.orderId,
  }
}
