import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const BASE_SYSTEM_PROMPT = `Ты — AI-ассистент Food Service, платформы B2B поставок продуктов для HoReCa бизнеса в Шымкенте, Казахстан.

Ты помогаешь ресторанам, кофейням, суши-барам и dark kitchen подбирать продукты, планировать закупки и оптимизировать расходы. Отвечай на русском языке, кратко и по делу. Используй эмодзи умеренно.

АССОРТИМЕНТ FOOD SERVICE (актуальные позиции и цены в тенге):

🐟 SEAFOOD:
- Salmon Fillet — ₸5 490/кг (норвежский лосось охлаждённый)
- Tuna Fillet — ₸7 200/кг (sashimi-grade, желтопёрый)
- Shrimp Vannamei — ₸3 800/кг (очищенные 16/20)
- Crab Meat Premium — ₸4 100/500г (пастеризованное)
- Scallop — ₸6 900/500г (U/10, Канада)
- Seafood Mix — ₸2 990/кг (кальмар, осьминог, мидии, креветки)

🍱 SUSHI SUPPLY:
- Sushi Rice Premium — ₸3 900/25кг (Koshihikari)
- Nori Roasted — ₸1 890/100 листов
- Cream Cheese Philadelphia — ₸2 490/кг
- Soy Sauce Kikkoman — ₸1 290/1.75л
- Unagi Sauce — ₸1 690/1.8л
- Spicy Mayo Sauce — ₸990/кг
- Tempura Batter — ₸890/кг
- Tobiko (икра летучей рыбы) — ₸3 200/500г

🍕 PIZZA SUPPLY:
- Mozzarella Shredded — ₸4 200/2.5кг (высокоплавкая)
- Pepperoni Salami — ₸3 500/кг (Испания)
- Pizza Tomato Sauce — ₸1 490/3кг
- Pizza Dough Ball — ₸1 800/10шт (заморозка)
- Parmesan Grana Padano — ₸5 100/кг

☕ COFFEE SUPPLY:
- Espresso Blend — ₸2 190/кг (Бразилия + Эфиопия)
- Specialty Single Origin — ₸3 490/кг (Эфиопия Йиргачефф 88+)
- Oat Milk Barista — ₸890/л (×12)
- Caramel Syrup Monin — ₸1 590/л
- Vanilla Syrup Monin — ₸1 590/л
- Matcha Ceremonial Grade — ₸2 890/100г

🥐 BAKERY:
- Butter 82.5% Professional — ₸6 800/5кг
- Croissant Dough Frozen — ₸2 800/20шт
- Dark Chocolate Couverture Callebaut 70.4% — ₸3 900/кг
- Pastry Cream Powder — ₸1 100/кг
- Sourdough Loaf Ready — ₸1 290/800г

🧊 FROZEN:
- Premium Fries 9mm — ₸2 100/5кг (Бельгия)
- Chicken Breast Fillet — ₸3 200/5кг
- Beef Burger Patty 180g — ₸4 500/10шт (80/20 мраморная)
- Edamame Frozen — ₸1 390/кг
- Spring Rolls Frozen — ₸1 990/40шт

🫒 HORECA ESSENTIALS:
- Extra Virgin Olive Oil — ₸4 990/5л (Италия, 0.3%)
- Black Truffle Oil — ₸3 200/250мл
- Balsamic Glaze Aged — ₸2 100/500мл (Модена IGP)
- Maldon Sea Salt Flakes — ₸1 890/250г
- Organic Avocado Hass — ₸2 900/6кг (Мексика)
- Microgreens Mix — ₸1 490/100г

ПРАВИЛА:
- Если спрашивают о закупках для конкретного заведения — составь конкретный список с расчётом суммы
- Если спрашивают про рецепты или меню — предлагай продукты из ассортимента
- Если продукта нет в списке — честно скажи, что нет в наличии
- Давай практические советы по хранению и использованию продуктов
- Предлагай похожие альтернативы если нужного нет
- Минимальная доставка по Шымкенту — ₸1 500`

type Message      = { role: "user" | "assistant"; content: string }
type OrderItem    = { id: string; title: string; emoji: string; price: number; quantity: number }
type OrderContext = { id: string; created_at: string; items: OrderItem[]; total: number; status: string }

type SystemBlock = Anthropic.TextBlockParam & { cache_control?: { type: "ephemeral" } }

function buildSystemBlocks(orders?: OrderContext[]): SystemBlock[] {
  const base: SystemBlock = {
    type:          "text",
    text:          BASE_SYSTEM_PROMPT,
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
  const { messages, orderContext }: { messages: Message[]; orderContext?: OrderContext[] } = await req.json()

  if (!messages?.length) {
    return NextResponse.json({ error: "Нет сообщений" }, { status: 400 })
  }

  try {
    const response = await client.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:     buildSystemBlocks(orderContext),
      messages,
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    return NextResponse.json({ message: text })
  } catch (err) {
    console.error("Claude API error:", err)
    return NextResponse.json({ error: "Ошибка AI сервиса" }, { status: 500 })
  }
}
