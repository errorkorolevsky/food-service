const PAYMENT_LABEL: Record<string, string> = {
  kaspi:   "Kaspi QR",
  freedom: "Freedom Pay",
  cash:    "Наличные",
}

type OrderItem = {
  title:    string
  emoji:    string
  price:    number
  quantity: number
}

type TelegramOrderParams = {
  orderId:   string
  phone:     string
  address:   string
  payment:   string
  items:     OrderItem[]
  total:     number
  comment?:  string | null
  company?:  string | null
  promoCode?: string | null
  discount?:  number
}

export async function notifyTelegramNewOrder(params: TelegramOrderParams): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const { orderId, phone, address, payment, items, total, comment, company, promoCode, discount } = params

  const shortId = `#FS-${orderId.slice(-6).toUpperCase()}`
  const itemLines = items
    .map((i) => `  ${i.emoji} ${i.title} × ${i.quantity} — ₸${(i.price * i.quantity).toLocaleString("ru-RU")}`)
    .join("\n")

  const lines: string[] = [
    `🛒 <b>Новый заказ ${shortId}</b>`,
    "",
    `📞 ${phone}`,
    `📍 ${address}`,
    ...(company ? [`🏢 ${company}`] : []),
    `💳 ${PAYMENT_LABEL[payment] ?? payment}`,
    "",
    itemLines,
    "",
    ...(promoCode && discount ? [`🎟 Промокод ${promoCode}: −₸${discount.toLocaleString("ru-RU")}`] : []),
    `💰 <b>Итого: ₸${total.toLocaleString("ru-RU")}</b>`,
    ...(comment ? [`💬 ${comment}`] : []),
  ]

  const text = lines.filter((l) => l !== undefined).join("\n")

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
}
