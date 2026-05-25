import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LANG_DIRECTIVE: Record<string, string> = {
  kz: "Қазақ тілінде жауап бер, қысқаша және нақты. Эмодзиді орташа қолдан.",
  ru: "Отвечай на русском языке, кратко и по делу. Используй эмодзи умеренно.",
}

const BASE_SYSTEM_PROMPT_BODY = `Ты — AI-помощник Food Service, онлайн-магазина продуктов с доставкой на дом по Шымкенту, Казахстан.

Ты помогаешь покупателям подбирать продукты для семьи, составлять списки покупок, находить акции и планировать домашнее меню.

АССОРТИМЕНТ FOOD SERVICE (актуальные позиции и цены в тенге):

🐟 РЫБА И МОРЕПРОДУКТЫ:
- Лосось филе — ₸5 490/кг (норвежский охлаждённый, без кожи и костей)
- Лосось стейк — ₸4 900/кг (порции 200-250г)
- Лосось Premium слабосолёный — ₸6 200/кг
- Тунец филе — ₸7 200/кг (sashimi-grade)
- Тунец для сашими — ₸7 800/кг (premium frozen)
- Креветки Ванnamei — ₸3 800/кг (очищенные 16/20)
- Морской коктейль — ₸2 990/кг (кальмар, мидии, креветки)

🥩 МЯСО И ПТИЦА:
- Куриное филе — ₸3 200/кг (охлаждённое)
- Говядина вырезка — ₸5 900/кг (мраморная, охлаждённая)
- Свинина шея — ₸3 400/кг (охлаждённая)
- Бургер патти 180г — ₸4 500/10шт (80/20 мраморная говядина)

🥛 МОЛОЧНЫЕ ПРОДУКТЫ:
- Сыр Моцарелла — ₸4 200/2.5кг
- Сыр Пармезан Grana Padano — ₸5 100/кг
- Масло сливочное 82.5% — ₸6 800/5кг
- Сливочный сыр Philadelphia — ₸2 490/кг

🍞 ХЛЕБ И ВЫПЕЧКА:
- Хлеб на закваске — ₸1 290/800г
- Круассан замороженный — ₸2 800/20шт
- Шоколад кувертюр Callebaut 70.4% — ₸3 900/кг

🧊 ЗАМОРОЖЕННЫЕ:
- Картофель фри 9мм — ₸2 100/5кг (Бельгия)
- Эдамаме — ₸1 390/кг
- Спринг-роллы — ₸1 990/40шт

🫒 МАСЛА И СОУСЫ:
- Оливковое масло Extra Virgin — ₸4 990/5л (Италия)
- Трюфельное масло — ₸3 200/250мл
- Бальзамик Modena IGP — ₸2 100/500мл
- Соевый соус Kikkoman — ₸1 290/1.75л
- Соус Унаги — ₸1 690/1.8л

🥗 СВЕЖИЕ ОВОЩИ И ЗЕЛЕНЬ:
- Авокадо Hass — ₸2 900/6кг (Мексика)
- Микрозелень микс — ₸1 490/100г

☕ НАПИТКИ И КОФЕ:
- Эспрессо бленд — ₸2 190/кг (Бразилия + Эфиопия)
- Матча церемониальная — ₸2 890/100г
- Овсяное молоко Barista — ₸890/л

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

function buildSystemBlocks(orders?: OrderContext[], locale = "ru"): SystemBlock[] {
  const langDirective = LANG_DIRECTIVE[locale] ?? LANG_DIRECTIVE.ru
  const fullPrompt    = `${BASE_SYSTEM_PROMPT_BODY}\n\n${langDirective}`

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
  const raw    = await req.json().catch(() => null)
  const parsed = ChatSchema.safeParse(raw)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Некорректный запрос" }), { status: 400 })
  }

  const { messages, orderContext, locale = "ru" } = parsed.data

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
          system:     buildSystemBlocks(orderContext, locale),
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
