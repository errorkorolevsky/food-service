"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Package, MapPin, Phone, MessageSquare, RefreshCw, Wifi } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import PageHero from "@/components/ui/PageHero"
import { supabase } from "@/lib/supabase"

// ─── TYPES ───────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"

type DbOrder = {
  id:         string
  created_at: string
  company:    string | null
  phone:      string
  address:    string
  comment:    string | null
  payment:    string
  items:      { id: string; title: string; emoji: string; price: number; quantity: number }[]
  subtotal:   number
  delivery:   number
  total:      number
  status:     OrderStatus
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "pending",     label: "Заказ принят",          desc: "Ожидаем подтверждения"       },
  { status: "processing",  label: "Готовится к отправке",  desc: "Комплектуем ваш заказ"        },
  { status: "in_delivery", label: "Курьер в пути",         desc: "Заказ передан курьеру"        },
  { status: "delivered",   label: "Доставлен",             desc: "Заказ успешно доставлен"      },
]

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: "default" | "success" | "warning" | "ai" | "error" }> = {
  pending:     { label: "Принят",    variant: "ai"      },
  processing:  { label: "Обработка", variant: "warning" },
  in_delivery: { label: "В пути",    variant: "warning" },
  delivered:   { label: "Доставлен", variant: "success" },
  cancelled:   { label: "Отменён",   variant: "error"   },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

function getStepIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.status === status)
}

// ─── REALTIME HOOK ────────────────────────────────────────────────────────────

function useRealtimeOrder(
  orderId: string | null,
  onUpdate: (updated: Partial<DbOrder>) => void,
) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!orderId) return

    // Cleanup previous subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          onUpdate(payload.new as Partial<DbOrder>)
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, onUpdate])
}

// ─── ORDER CARD ───────────────────────────────────────────────────────────────

function OrderCard({ order: initial }: { order: DbOrder }) {
  const [order,   setOrder]   = useState<DbOrder>(initial)
  const [flash,   setFlash]   = useState(false)
  const [online,  setOnline]  = useState(false)

  // Subscribe to realtime updates for this order
  useRealtimeOrder(order.id, (updated) => {
    setOrder((prev) => ({ ...prev, ...updated }))
    setFlash(true)
    setTimeout(() => setFlash(false), 1500)
  })

  // Track Supabase channel state
  useEffect(() => {
    const channel = supabase
      .channel(`status-check-${order.id}`)
      .subscribe((state) => {
        setOnline(state === "SUBSCRIBED")
      })
    return () => { supabase.removeChannel(channel) }
  }, [order.id])

  const meta      = STATUS_BADGE[order.status]
  const stepIndex = getStepIndex(order.status)
  const isCancelled = order.status === "cancelled"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`
        bg-white border rounded-2xl overflow-hidden transition-colors duration-500
        ${flash ? "border-fs-green" : "border-fs-border"}
      `}
    >
      {/* HEADER */}
      <div className="px-7 py-6 border-b border-fs-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Package size={18} strokeWidth={1.5} className="text-fs-gray" />
          <span className="text-title font-black text-fs-graphite">{formatOrderId(order.id)}</span>
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {online && (
            <div className="flex items-center gap-1.5 text-label text-fs-green">
              <Wifi size={12} strokeWidth={1.5} />
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-title font-black text-fs-graphite">₸{order.total.toLocaleString()}</p>
          <p className="text-label text-fs-gray mt-1">{formatDate(order.created_at)}</p>
        </div>
      </div>

      <div className="p-7 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — STATUS STEPS */}
        <div>
          {isCancelled ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-body font-bold text-red-400">Заказ отменён</p>
            </div>
          ) : (
            <div className="space-y-5">
              {STATUS_STEPS.map((step, i) => {
                const done   = i < stepIndex
                const active = i === stepIndex
                return (
                  <motion.div
                    key={step.status}
                    animate={active && flash ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 ${!done && !active ? "opacity-35" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${active ? "bg-fs-green animate-pulse" : done ? "bg-fs-primary" : "bg-fs-border"}
                      `} />
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-px h-5 ${done ? "bg-fs-primary/30" : "bg-fs-border/60"}`} />
                      )}
                    </div>
                    <div className="pb-1">
                      <p className={`text-body ${active ? "font-bold text-fs-graphite" : "text-fs-gray"}`}>
                        {step.label}
                      </p>
                      {active && (
                        <p className="text-caption text-fs-gray mt-0.5">{step.desc}</p>
                      )}
                    </div>
                    {done && <span className="ml-auto text-label text-fs-green mt-0.5">✓</span>}
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* CONTACT INFO */}
          <div className="mt-6 pt-6 border-t border-fs-border space-y-2">
            <div className="flex items-center gap-2 text-caption text-fs-gray">
              <Phone size={13} strokeWidth={1.5} />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-caption text-fs-gray">
              <MapPin size={13} strokeWidth={1.5} />
              <span>{order.address}</span>
            </div>
            {order.comment && (
              <div className="flex items-start gap-2 text-caption text-fs-gray">
                <MessageSquare size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                <span>{order.comment}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — ITEMS */}
        <div>
          <p className="text-label text-fs-gray uppercase tracking-widest mb-4">Состав заказа</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span className="text-caption text-fs-gray flex-1 leading-snug">{item.title}</span>
                <span className="text-caption text-fs-gray whitespace-nowrap">
                  {item.quantity} × ₸{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-fs-border space-y-1.5 text-caption">
            <div className="flex justify-between text-fs-gray">
              <span>Товары</span><span>₸{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-fs-gray">
              <span>Доставка</span><span>₸{order.delivery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-fs-graphite pt-1">
              <span>Итого</span><span>₸{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── INNER ───────────────────────────────────────────────────────────────────

function TrackingInner() {
  const searchParams = useSearchParams()
  const [query,    setQuery]    = useState(searchParams.get("q") ?? "")
  const [orders,   setOrders]   = useState<DbOrder[]>([])
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const search = async (q?: string) => {
    const val = (q ?? query).trim()
    if (!val) return
    setLoading(true)
    setError(null)
    setSearched(true)

    const res  = await fetch(`/api/orders/track?q=${encodeURIComponent(val)}`)
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Заказ не найден")
      setOrders([])
    } else {
      setOrders(Array.isArray(data) ? data : [data])
    }
    setLoading(false)
  }

  // Auto-search if URL has ?q=
  useEffect(() => {
    const q = searchParams.get("q")
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) search(q)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search()
  }

  return (
    <div className="fs-container py-16">

      {/* SEARCH */}
      <FadeIn delay={0.05}>
        <div className="mt-10 flex gap-3 max-w-xl">
          <div className="flex-1 relative">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-fs-subtle"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="#FS-B7CD4B или +7999..."
              className="w-full fs-input pl-11 text-body text-fs-graphite placeholder:text-fs-subtle"
            />
          </div>
          <Button onClick={() => search()} disabled={!query.trim() || loading}>
            {loading
              ? <RefreshCw size={16} strokeWidth={1.5} className="animate-spin" />
              : "Найти"
            }
          </Button>
        </div>
      </FadeIn>

      {/* RESULTS */}
      <div className="mt-10 space-y-6">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-fs-offwhite border border-fs-border flex items-center justify-center text-3xl mx-auto mb-6">
                🔍
              </div>
              <p className="text-body text-fs-gray">{error}</p>
            </motion.div>
          ) : orders.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </motion.div>
          ) : !searched ? (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
            >
              {[
                { emoji: "📦", title: "Номер заказа",    desc: "Введите #FS-XXXXXX из письма или страницы успеха" },
                { emoji: "📱", title: "По телефону",      desc: "Введите номер телефона — покажем все ваши заказы" },
                { emoji: "⚡", title: "Реальный статус",  desc: "Статус обновляется в реальном времени без перезагрузки" },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-fs-border rounded-xl p-6">
                  <span className="text-3xl">{item.emoji}</span>
                  <p className="text-body font-bold text-fs-graphite mt-3">{item.title}</p>
                  <p className="text-caption text-fs-gray mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function TrackingPage() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <PageHero
        badge="Отслеживание заказа"
        title={<>Доставка<br />заказа</>}
        subtitle="Введите номер заказа (#FS-XXXXXX) или телефон чтобы узнать статус доставки."
        stats={[
          { value: "15 мин", label: "среднее время" },
          { value: "Live",   label: "обновление статуса" },
          { value: "SMS",    label: "уведомления" },
        ]}
      />
      <CartDrawer />
      <Suspense fallback={null}>
        <TrackingInner />
      </Suspense>
    </main>
  )
}
