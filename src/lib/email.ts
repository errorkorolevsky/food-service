import { Resend } from "resend"
import { BASE_URL } from "@/lib/seo"

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

type OrderItem = { title: string; emoji: string; price: number; quantity: number; note?: string }
type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"

const STATUS_INFO: Record<OrderStatus, { subject: string; headline: string; desc: string; color: string }> = {
  pending:     { subject: "Заказ принят",         headline: "Заказ принят ✓",          desc: "Мы получили ваш заказ и приступаем к сборке.",           color: "#6366f1" },
  processing:  { subject: "Заказ готовится",       headline: "Заказ готовится 📦",       desc: "Ваш заказ комплектуется и скоро будет передан курьеру.", color: "#f59e0b" },
  in_delivery: { subject: "Курьер в пути",         headline: "Курьер в пути 🛵",         desc: "Курьер уже едет к вам. Ожидайте доставку.",             color: "#f59e0b" },
  delivered:   { subject: "Заказ доставлен",       headline: "Заказ доставлен ✅",       desc: "Ваш заказ успешно доставлен. Спасибо за покупку!",      color: "#22c55e" },
  cancelled:   { subject: "Заказ отменён",         headline: "Заказ отменён ✗",          desc: "К сожалению, ваш заказ был отменён.",                   color: "#ef4444" },
}

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

function buildEmailHtml({
  orderId,
  status,
  items,
  total,
  address,
  trackingUrl,
}: {
  orderId:     string
  status:      OrderStatus
  items:       OrderItem[]
  total:       number
  address:     string
  trackingUrl: string
}) {
  const info = STATUS_INFO[status]
  const shortId = formatOrderId(orderId)

  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1f2937;">
        <span style="font-size:20px;margin-right:10px;">${item.emoji}</span>
        <span style="color:#e5e7eb;font-size:14px;">${item.title}</span>
        ${item.note ? `<div style="display:inline-block;margin-top:4px;margin-left:30px;padding:3px 10px;background:#451a03;border:1px solid #78350f;border-radius:6px;color:#fbbf24;font-size:11px;">${item.note}</div>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1f2937;text-align:right;color:#9ca3af;font-size:14px;white-space:nowrap;vertical-align:top;">
        ${item.quantity} × ₸${item.price.toLocaleString("ru-RU")}
      </td>
    </tr>
  `).join("")

  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- LOGO -->
        <tr><td style="padding-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:#111827;border:1px solid #1f2937;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;color:#fff;">FS</div>
            <div>
              <div style="color:#fff;font-weight:800;font-size:14px;letter-spacing:0.05em;">FOOD SERVICE</div>
              <div style="color:#6b7280;font-size:11px;letter-spacing:0.1em;">AI ECOSYSTEM</div>
            </div>
          </div>
        </td></tr>

        <!-- STATUS CARD -->
        <tr><td style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:32px;margin-bottom:16px;">

          <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:${info.color}20;border:1px solid ${info.color}40;color:${info.color};font-size:12px;font-weight:600;margin-bottom:20px;">
            ${info.headline}
          </div>

          <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 8px;">${shortId}</h1>
          <p style="color:#9ca3af;font-size:15px;margin:0 0 28px;">${info.desc}</p>

          <!-- ITEMS -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            ${itemRows}
          </table>

          <!-- TOTAL -->
          <div style="display:flex;justify-content:space-between;padding:16px;background:#0a0a0a;border-radius:10px;margin-bottom:20px;">
            <span style="color:#9ca3af;font-size:14px;">Адрес доставки</span>
            <span style="color:#e5e7eb;font-size:14px;text-align:right;max-width:60%;">${address}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:16px;background:#0a0a0a;border-radius:10px;">
            <span style="color:#fff;font-weight:700;font-size:15px;">Итого</span>
            <span style="color:#fff;font-weight:900;font-size:18px;">₸${total.toLocaleString("ru-RU")}</span>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px;">
            <a href="${trackingUrl}" style="display:inline-block;padding:14px 32px;background:#fff;color:#0a0a0a;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">
              Отследить заказ →
            </a>
          </div>

        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding-top:24px;text-align:center;">
          <p style="color:#4b5563;font-size:12px;margin:0;">
            Food Service Kazakhstan · Шымкент<br>
            <a href="${trackingUrl}" style="color:#6b7280;">Отслеживание заказа</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── MAGIC LINK EMAIL ─────────────────────────────────────────────────────────

function buildMagicLinkHtml(url: string) {
  return `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td style="padding-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:#111827;border:1px solid #1f2937;border-radius:8px;font-weight:900;font-size:14px;color:#fff;text-align:center;line-height:36px;">FS</div>
            <div>
              <div style="color:#fff;font-weight:800;font-size:14px;letter-spacing:0.05em;">FOOD SERVICE</div>
              <div style="color:#6b7280;font-size:11px;letter-spacing:0.1em;">AI ECOSYSTEM</div>
            </div>
          </div>
        </td></tr>

        <tr><td style="background:#111827;border:1px solid #1f2937;border-radius:16px;padding:40px;">
          <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:#6366f120;border:1px solid #6366f140;color:#818cf8;font-size:12px;font-weight:600;margin-bottom:24px;">
            Вход в аккаунт
          </div>
          <h1 style="color:#fff;font-size:26px;font-weight:900;margin:0 0 12px;">Ваша ссылка для входа</h1>
          <p style="color:#9ca3af;font-size:15px;margin:0 0 32px;line-height:1.6;">
            Нажмите на кнопку ниже чтобы войти в Food Service. Ссылка действительна <strong style="color:#e5e7eb;">15 минут</strong>.
          </p>
          <div style="text-align:center;">
            <a href="${url}" style="display:inline-block;padding:16px 40px;background:#fff;color:#0a0a0a;border-radius:10px;font-weight:800;font-size:15px;text-decoration:none;">
              Войти в аккаунт →
            </a>
          </div>
          <p style="color:#4b5563;font-size:12px;margin:28px 0 0;text-align:center;">
            Если вы не запрашивали этот email — просто проигнорируйте его.
          </p>
        </td></tr>

        <tr><td style="padding-top:24px;text-align:center;">
          <p style="color:#4b5563;font-size:12px;margin:0;">Food Service Kazakhstan · Шымкент</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendMagicLink({ to, url }: { to: string; url: string }) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from:    "Food Service <onboarding@resend.dev>",
    to,
    subject: "Ссылка для входа в Food Service",
    html:    buildMagicLinkHtml(url),
  })
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export async function sendOrderEmail({
  to,
  orderId,
  status,
  items,
  total,
  address,
}: {
  to:      string
  orderId: string
  status:  OrderStatus
  items:   OrderItem[]
  total:   number
  address: string
}) {
  const resend = getResend()
  if (!resend) return

  const info        = STATUS_INFO[status]
  const shortId     = formatOrderId(orderId)
  const trackingUrl = `${BASE_URL}/tracking?q=${encodeURIComponent(shortId)}`

  await resend.emails.send({
    from:    "Food Service <onboarding@resend.dev>",
    to,
    subject: `${info.subject} ${shortId}`,
    html:    buildEmailHtml({ orderId, status, items, total, address, trackingUrl }),
  })
}
