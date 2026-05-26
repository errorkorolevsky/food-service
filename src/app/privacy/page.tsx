import type { Metadata } from "next"
import Link from "next/link"

import Navbar    from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer    from "@/components/layout/Footer"

export const metadata: Metadata = {
  title:       "Политика конфиденциальности — Food Service",
  description: "Политика обработки персональных данных Food Service Kazakhstan",
  robots:      { index: true, follow: true },
}

const SECTIONS = [
  {
    title: "1. Общие положения",
    body: `Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок сбора, хранения и обработки персональных данных пользователей платформы Food Service Kazakhstan (далее — «Платформа», «мы»).

Использование Платформы означает безоговорочное согласие Пользователя с настоящей Политикой. Если вы не согласны с условиями Политики, пожалуйста, воздержитесь от использования Платформы.

Оператор персональных данных: Food Service Kazakhstan, г. Шымкент, Казахстан.
Контакт: foodservice.kz@gmail.com`,
  },
  {
    title: "2. Собираемые данные",
    body: `При использовании Платформы мы можем собирать следующие персональные данные:

— Имя и фамилия (при авторизации через Google)
— Адрес электронной почты
— Номер телефона
— Адрес доставки
— История заказов
— Технические данные (IP-адрес, тип браузера, устройство) — в обезличенном виде`,
  },
  {
    title: "3. Цели обработки данных",
    body: `Персональные данные обрабатываются исключительно в следующих целях:

— Оформление и исполнение заказов
— Доставка товаров по указанному адресу
— Уведомление об изменении статуса заказа по электронной почте
— Идентификация пользователя при авторизации
— Улучшение качества сервиса`,
  },
  {
    title: "4. Хранение данных",
    body: `Данные хранятся в защищённой базе данных Supabase (инфраструктура EU/US). Мы применяем технические и организационные меры для защиты данных от несанкционированного доступа, изменения, раскрытия или уничтожения.

Данные хранятся в течение срока, необходимого для выполнения целей обработки, или в соответствии с требованиями законодательства Республики Казахстан.`,
  },
  {
    title: "5. Передача данных третьим лицам",
    body: `Мы не продаём и не передаём персональные данные третьим лицам, за исключением случаев, необходимых для выполнения заказа:

— Resend (Resend Inc.) — для отправки транзакционных email-уведомлений
— Telegram (Telegram Messenger LLP) — для уведомлений о новых заказах в служебных целях

Все субподрядчики связаны обязательствами конфиденциальности.`,
  },
  {
    title: "6. Права пользователя",
    body: `В соответствии с Законом Республики Казахстан «О персональных данных и их защите» вы имеете право:

— Получить информацию о хранящихся персональных данных
— Потребовать исправления неточных данных
— Потребовать удаления персональных данных
— Отозвать согласие на обработку данных

Для реализации прав обратитесь по адресу: foodservice.kz@gmail.com`,
  },
  {
    title: "7. Cookies и локальное хранилище",
    body: `Платформа использует localStorage браузера для хранения:

— Предпочтений языка интерфейса
— Содержимого корзины
— Избранных товаров
— Данных последнего заказа (телефон, адрес) для удобства повторного оформления

Эти данные хранятся только на вашем устройстве и не передаются на серверы.`,
  },
  {
    title: "8. Изменения политики",
    body: `Мы оставляем за собой право изменять настоящую Политику. Актуальная версия всегда доступна по адресу /privacy. О существенных изменениях мы уведомим пользователей по электронной почте.

Последнее обновление: май 2026 г.`,
  },
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-fs-graphite bg-[var(--page-bg)]">
      <Navbar />
      <CartDrawer />

      <div className="fs-container pt-14 pb-24 lg:py-20 max-w-3xl">

        {/* HEADER */}
        <div className="mb-12">
          <Link href="/" className="text-[13px] text-fs-gray hover:text-fs-primary transition-colors mb-6 inline-block">
            ← На главную
          </Link>
          <h1 className="text-[32px] sm:text-[40px] font-black text-fs-graphite tracking-tight leading-tight">
            Политика конфиденциальности
          </h1>
          <p className="text-[15px] text-fs-gray mt-3">
            Food Service Kazakhstan · г. Шымкент
          </p>
        </div>

        {/* SECTIONS */}
        <div className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title} className="border-t border-fs-border pt-8">
              <h2 className="text-[18px] font-bold text-fs-graphite mb-4">{s.title}</h2>
              <div className="text-[15px] text-fs-gray leading-relaxed whitespace-pre-line">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        {/* CONTACT */}
        <div className="mt-14 p-6 rounded-2xl border border-fs-border bg-fs-white">
          <p className="text-[14px] text-fs-gray">
            По вопросам обработки персональных данных:{" "}
            <a href="mailto:foodservice.kz@gmail.com" className="text-fs-primary hover:underline">
              foodservice.kz@gmail.com
            </a>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
