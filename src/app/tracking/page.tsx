"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Package, MapPin, Phone, MessageSquare, RefreshCw, Wifi, RotateCcw, PhoneCall } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import PageHero from "@/components/ui/PageHero"
import { supabase } from "@/lib/supabase"
import { useLang } from "@/locales"
import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/config/commerce"

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
  items:      { id: string; title: string; emoji: string; price: number; quantity: number; note?: string }[]
  subtotal:   number
  delivery:   number
  total:      number
  status:     OrderStatus
}

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_STEP_ORDER: OrderStatus[] = ["pending", "processing", "in_delivery", "delivered"]

const STATUS_BADGE_VARIANT: Record<OrderStatus, "default" | "success" | "warning" | "ai" | "error"> = {
  pending:     "ai",
  processing:  "warning",
  in_delivery: "warning",
  delivered:   "success",
  cancelled:   "error",
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "kz" ? "kk-KZ" : "ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

function getStepIndex(status: OrderStatus) {
  return STATUS_STEP_ORDER.indexOf(status)
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
  const { t, lang } = useLang()
  const addItem  = useCartStore((state) => state.addItem)
  const openCart = useCartUI((state) => state.openCart)
  const [order,   setOrder]   = useState<DbOrder>(initial)
  const [flash,   setFlash]   = useState(false)
  const [online,  setOnline]  = useState(false)

  const handleRepeat = () => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({ id: item.id, title: item.title, price: item.price, emoji: item.emoji })
      }
    })
    openCart()
  }

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

  const badgeVariant = STATUS_BADGE_VARIANT[order.status]
  const badgeLabel   = t.tracking.statuses[order.status]
  const stepIndex    = getStepIndex(order.status)
  const isCancelled  = order.status === "cancelled"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`
        bg-fs-white border rounded-2xl overflow-hidden transition-colors duration-500
        ${flash ? "border-fs-green" : "border-fs-border"}
      `}
    >
      {/* HEADER */}
      <div className="px-7 py-6 border-b border-fs-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Package size={18} strokeWidth={1.5} className="text-fs-gray" />
          <span className="text-title font-black text-fs-graphite">{formatOrderId(order.id)}</span>
          <Badge variant={badgeVariant}>{badgeLabel}</Badge>
          {online && (
            <div className="flex items-center gap-1.5 text-label text-fs-green">
              <Wifi size={12} strokeWidth={1.5} />
              <span>Live</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {order.status === "delivered" && (
            <button
              onClick={handleRepeat}
              className="flex items-center gap-1.5 text-caption text-fs-gray hover:text-fs-primary transition-colors"
            >
              <RotateCcw size={13} strokeWidth={1.5} />
              {t.profile.repeatOrder}
            </button>
          )}
          <div className="text-right">
            <p className="text-title font-black text-fs-graphite">₸{order.total.toLocaleString()}</p>
            <p className="text-label text-fs-gray mt-1">{formatDate(order.created_at, lang)}</p>
          </div>
        </div>
      </div>

      <div className="p-7 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — STATUS STEPS */}
        <div>
          {isCancelled ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
              <p className="text-body font-bold text-red-400">{t.tracking.statuses.cancelled}</p>
            </div>
          ) : (
            <div className="space-y-5">
              {STATUS_STEP_ORDER.map((status, i) => {
                const done   = i < stepIndex
                const active = i === stepIndex
                const step   = t.tracking.steps[status]
                return (
                  <motion.div
                    key={status}
                    animate={active && flash ? { x: [0, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 ${!done && !active ? "opacity-35" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                      <div className={`
                        w-3 h-3 rounded-full
                        ${active ? "bg-fs-green animate-pulse" : done ? "bg-fs-primary" : "bg-fs-border"}
                      `} />
                      {i < STATUS_STEP_ORDER.length - 1 && (
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

          {/* SUPPORT */}
          <div className="mt-4 pt-4 border-t border-fs-border">
            <p className="text-label text-fs-gray uppercase tracking-widest mb-3">{t.tracking.support}</p>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(t.tracking.whatsappMsg(formatOrderId(order.id)))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-caption font-medium hover:bg-emerald-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t.tracking.whatsapp}
              </a>
              <a
                href={`tel:${SUPPORT_PHONE}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fs-offwhite border border-fs-border text-fs-gray text-caption font-medium hover:border-fs-subtle hover:text-fs-graphite transition-colors"
              >
                <PhoneCall size={13} strokeWidth={1.5} />
                {t.tracking.callSupport}
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT — ITEMS */}
        <div>
          <p className="text-label text-fs-gray uppercase tracking-widest mb-4">{t.tracking.orderItems}</p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <span className="text-caption text-fs-gray flex-1 leading-snug">{item.title}</span>
                  <span className="text-caption text-fs-gray whitespace-nowrap">
                    {item.quantity} × ₸{item.price.toLocaleString()}
                  </span>
                </div>
                {item.note && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1 ml-8">
                    {item.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-fs-border space-y-1.5 text-caption">
            <div className="flex justify-between text-fs-gray">
              <span>{t.cart.subtotal}</span><span>₸{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-fs-gray">
              <span>{t.cart.delivery}</span><span>₸{order.delivery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-fs-graphite pt-1">
              <span>{t.tracking.orderTotal}</span><span>₸{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── INNER ───────────────────────────────────────────────────────────────────

function TrackingInner() {
  const { t }    = useLang()
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
      setError(data.error ?? t.tracking.notFound)
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
              type="search"
              aria-label={t.tracking.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t.tracking.placeholder}
              className="w-full fs-input pl-11 text-body text-fs-graphite placeholder:text-fs-subtle"
            />
          </div>
          <Button onClick={() => search()} disabled={!query.trim() || loading}>
            {loading
              ? <RefreshCw size={16} strokeWidth={1.5} className="animate-spin" />
              : t.tracking.search
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
              {t.tracking.hints.map((item) => (
                <div key={item.title} className="bg-fs-white border border-fs-border rounded-xl p-6">
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

function TrackingPageInner() {
  const { t } = useLang()
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <PageHero
        badge={t.tracking.badge}
        title={<>{t.tracking.title.split(" ")[0]}<br />{t.tracking.title.split(" ").slice(1).join(" ")}</>}
        subtitle={t.tracking.subtitle}
        stats={[
          { value: "15",      label: t.tracking.statAvgTime },
          { value: "Live",   label: t.tracking.statLive    },
          { value: "SMS",    label: t.tracking.statSms     },
        ]}
      />
      <CartDrawer />
      <Suspense fallback={null}>
        <TrackingInner />
      </Suspense>
      <Footer />
    </main>
  )
}

export default function TrackingPage() {
  return <TrackingPageInner />
}
