import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import { z } from "zod"
import { rateLimit, getIp } from "@/lib/rateLimiter"
import { getProductsCatalogForAI } from "@/lib/db/products"

export const dynamic = "force-dynamic"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANG_DIRECTIVE: Record<string, string> = {
  kz: "Қазақ тілінде жауап бер, қысқаша және нақты. Эмодзиді орташа қолдан.",
  ru: "Отвечай на русском языке, кратко и по делу. Используй эмодзи умеренно.",
}

const SYSTEM_PROMPT_HEADER = `Ты — AI-помощник Food Service, онлайн-магазина продуктов с доставкой на дом по Шымкенту, Казахстан.

Ты помогаешь покупателям подбирать продукты для семьи, составлять списки покупок, находить акции и планировать домашнее меню.`

const SYSTEM_PROMPT_FOOTER = `
ДОСТАВКА:
- Бесплатно при заказе от ₸10 000
- При заказе до ₸10 000 — доставка ₸1 500
- Доставка по Шымкенту за 15-30 минут

ПРАВИЛА:
- Помогай составить список покупок для семьи, рецепта или недели
- Рекомендуй продукты из ассортимента под конкретные блюда и задачи
- Сообщай об акциях и скидках если есть
- Если продукта нет в списке — честно скажи, что нет в наличии, предложи альтернативу
- Давай советы по хранению, приготовлению и сочетаемости продуктов
- Будь дружелюбным и полезным помощником для домашней кухни`

const MessageSchema = z.object({
  role:    z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
})

const OrderItemSchema = z.object({
  id:       z.string(),
  title:    z.string(),
  emoji:    z.string(),
  price:    z.number(),
  quantity: z.number(),
})

const OrderContextSchema = z.object({
  id:         z.string(),
  created_at: z.string(),
  items:      z.array(OrderItemSchema),
  total:      z.number(),
  status:     z.string(),
})

const ChatSchema = z.object({
  messages:     z.array(MessageSchema).min(1).max(50),
  orderContext: z.array(OrderContextSchema).max(5).optional(),
  locale:       z.enum(["ru", "kz"]).optional(),
})

type Message      = z.infer<typeof MessageSchema>
type OrderItem    = z.infer<typeof OrderItemSchema>
type OrderContext = z.infer<typeof OrderContextSchema>

type SystemBlock = Anthropic.TextBlockParam & { cache_control?: { type: "ephemeral" } }

function buildSystemBlocks(catalog: string, orders?: OrderContext[], locale = "ru"): SystemBlock[] {
  const langDirective = LANG_DIRECTIVE[locale] ?? LANG_DIRECTIVE.ru
  const fullPrompt    = `${SYSTEM_PROMPT_HEADER}\n\nАССОРТИМЕНТ FOOD SERVICE (актуальные позиции и цены в тенге):\n\n${catalog}${SYSTEM_PROMPT_FOOTER}\n\n${langDirective}`

  const base: SystemBlock = {
    type:          "text",
    text:          fullPrompt,
    cache_control: { type: "ephemeral" },
  }

  if (!orders?.length) return [base]

  const ordersText = orders.slice(0, 5).map((o) => {
    const shortId  = `#FS-${o.id.slice(-6).toUpperCase()}`
    const date     = new Date(o.created_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
    const itemList = o.items.map((i) => `${i.emoji} ${i.title} ×${i.quantity}`).join(", ")
    return `${shortId} от ${date}: ${itemList} — итого ₸${o.total.toLocaleString()} (${o.status})`
  }).join("\n")

  return [
    base,
    {
      type: "text",
      text: `ИСТОРИЯ ЗАКАЗОВ ЭТОГО КЛИЕНТА (используй для персонализированных рекомендаций):\n${ordersText}\n\nЕсли клиент спрашивает про "мои заказы" или "что я заказывал" — отвечай на основе этих данных. Можешь предложить повторить заказ или порекомендовать похожие товары.`,
    },
  ]
}

export async function POST(req: NextRequest) {
  // 30 messages per IP per minute
  if (!rateLimit(getIp(req), 30, 60_000)) {
    const errMsg = req.headers.get("accept-language")?.includes("kk")
      ? "Өтінім шектеуі. 1 минуттан кейін қайталап көріңіз."
      : "Слишком много запросов. Попробуйте через минуту."
    return new Response(JSON.stringify({ error: errMsg }), { status: 429 })
  }

  const raw    = await req.json().catch(() => null)
  const parsed = ChatSchema.safeParse(raw)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Некорректный запрос" }), { status: 400 })
  }

  const { messages, orderContext, locale = "ru" } = parsed.data

  const catalog = await getProductsCatalogForAI()
  const encoder  = new TextEncoder()
  const errMsg   = locale === "kz"
    ? "\n\nAI қызметінде қате. Қайталап көріңіз."
    : "\n\nОшибка AI сервиса. Попробуйте снова."

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model:      "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system:     buildSystemBlocks(catalog, orderContext, locale),
          messages,
        })

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        console.error("Claude streaming error:", err)
        controller.enqueue(encoder.encode(errMsg))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
