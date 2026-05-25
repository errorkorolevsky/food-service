"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight, Package, LogIn, MapPin, CreditCard, Smartphone } from "lucide-react"
import { useSession, signIn } from "next-auth/react"

import Navbar from "@/components/layout/Navbar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"

// ─── TYPES ────────────────────────────────────────────────────────────────────

type OrderItem = { id: string; title: string; emoji: string; price: number; quantity: number }

type OrderData = {
  id:         string
  address:    string
  phone:      string
  payment:    string
  items:      OrderItem[]
  subtotal:   number
  delivery:   number
  total:      number
  status:     string
  created_at: string
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string | null): string {
  if (!uuid) return "#FS-000"
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

const PAYMENT_ICON: Record<string, React.ElementType> = {
  kaspi:   Smartphone,
  freedom: CreditCard,
  cash:    CreditCard,
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

function SuccessContent() {
  const params             = useSearchParams()
  const rawId              = params.get("id")
  const orderId            = formatOrderId(rawId)
  const urlPayment         = params.get("payment") ?? ""
  const urlTotal           = Number(params.get("total") ?? 0)
  const { data: session }  = useSession()
  const { t }              = useLang()

  const [order, setOrder] = useState<OrderData | null>(null)

  const STATUS_STEPS = [
    { key: "pending",     label: t.order.statuses.pending     },
    { key: "processing",  label: t.order.statuses.processing  },
    { key: "in_delivery", label: t.order.statuses.in_delivery },
    { key: "delivered",   label: t.order.statuses.delivered   },
  ]

  useEffect(() => {
    if (!rawId) return

    const fetchOrder = async () => {
      try {
        const r = await fetch(`/api/orders/track?q=${encodeURIComponent(orderId)}`)
        if (!r.ok) return
        const data = await r.json()
        if (Array.isArray(data) && data.length > 0) setOrder(data[0])
      } catch {}
    }

    fetchOrder()

    // Poll every 15s while order is not yet delivered/cancelled
    const interval = setInterval(async () => {
      await fetchOrder()
      setOrder((prev) => {
        if (prev?.status === "delivered" || prev?.status === "cancelled") {
          clearInterval(interval)
        }
        return prev
      })
    }, 15_000)

    return () => clearInterval(interval)
  }, [rawId, orderId])

  const stepIndex    = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : 0
  const paymentKey   = order?.payment ?? urlPayment
  const PayIcon      = PAYMENT_ICON[paymentKey] ?? CreditCard
  const paymentLabel = paymentKey
    ? (t.order.payment[paymentKey as keyof typeof t.order.payment] ?? paymentKey)
    : "—"
  const displayTotal = order?.total ?? urlTotal

  return (
    <div className="max-w-2xl mx-auto">

      {/* SUCCESS ICON */}
      <FadeIn>
        <div className="text-center mb-14">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            className="
              w-24 h-24 rounded-3xl mx-auto mb-8
              bg-fs-green/10 border border-fs-green/20
              flex items-center justify-center
            "
          >
            <CheckCircle2 size={44} strokeWidth={1.5} className="text-fs-green" />
          </motion.div>

          <Badge variant="success" dot className="mb-6">
            {t.order.successBadge}
          </Badge>

          <h1 className="text-heading text-fs-graphite">{t.order.successTitle}</h1>

          <p className="text-body-lg text-fs-gray mt-4 max-w-md mx-auto">
            {t.order.successBody}
          </p>
        </div>
      </FadeIn>

      {/* ORDER INFO */}
      <FadeIn delay={0.1}>
        <div className="bg-fs-white border border-fs-border rounded-2xl p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Package size={18} strokeWidth={1.5} className="text-fs-gray" />
              <h2 className="text-title text-fs-graphite">{t.order.details}</h2>
            </div>
            <span className="text-title font-black text-fs-graphite">{orderId}</span>
          </div>

          {/* STATS GRID */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-fs-offwhite border border-fs-border rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-[9px] sm:text-label text-fs-gray uppercase tracking-wide sm:tracking-widest mb-1 sm:mb-2 leading-tight">{t.order.paymentLabel}</p>
              <div className="flex items-center justify-center gap-1">
                <PayIcon size={11} strokeWidth={1.5} className="text-fs-subtle flex-shrink-0" />
                <p className="text-[11px] sm:text-caption font-bold text-fs-graphite truncate">{paymentLabel}</p>
              </div>
            </div>
            <div className="bg-fs-offwhite border border-fs-border rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-[9px] sm:text-label text-fs-gray uppercase tracking-wide sm:tracking-widest mb-1 sm:mb-2 leading-tight">{t.order.deliveryTime}</p>
              <p className="text-[11px] sm:text-caption font-bold text-fs-graphite">{t.order.deliveryTimeValue}</p>
            </div>
            <div className="bg-fs-offwhite border border-fs-border rounded-xl p-2.5 sm:p-4 text-center">
              <p className="text-[9px] sm:text-label text-fs-gray uppercase tracking-wide sm:tracking-widest mb-1 sm:mb-2 leading-tight">{t.order.totalLabel}</p>
              <p className="text-[11px] sm:text-caption font-bold text-fs-graphite">
                {displayTotal ? `₸${displayTotal.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>

          {/* ADDRESS */}
          {order && (
            <div className="flex items-center gap-2 text-caption text-fs-gray bg-fs-offwhite border border-fs-border rounded-xl px-4 py-3">
              <MapPin size={13} strokeWidth={1.5} className="flex-shrink-0 text-fs-subtle" />
              <span>{order.address}</span>
            </div>
          )}

          {/* ITEMS */}
          {order && order.items.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <p className="text-label text-fs-gray uppercase tracking-widest mb-3">{t.order.composition}</p>
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
          )}
        </div>
      </FadeIn>

      {/* STATUS STEPS */}
      <FadeIn delay={0.15}>
        <div className="bg-fs-white border border-fs-border rounded-2xl p-8 mb-6">
          <h2 className="text-title text-fs-graphite mb-8">{t.order.statusTitle}</h2>
          <div className="space-y-5">
            {STATUS_STEPS.map((step, i) => {
              const done   = i < stepIndex
              const active = i === stepIndex
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 ${!done && !active ? "opacity-35" : ""}`}
                >
                  <div className={`
                    w-3 h-3 rounded-full flex-shrink-0
                    ${active ? "bg-fs-green animate-pulse" : done ? "bg-fs-primary" : "bg-fs-border"}
                  `} />
                  <p className={`text-body ${active ? "font-bold text-fs-graphite" : "text-fs-gray"}`}>
                    {step.label}
                  </p>
                  {(done || (active && i === 0)) && (
                    <span className="ml-auto text-label text-fs-green font-medium">{t.order.done}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* GOOGLE LOGIN PROMPT */}
      {!session && (
        <FadeIn delay={0.18}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-fs-white border border-fs-border rounded-2xl p-6 mb-6 flex items-center justify-between gap-6 flex-wrap"
          >
            <div>
              <p className="text-body font-bold text-fs-graphite">{t.order.loginTitle}</p>
              <p className="text-caption text-fs-gray mt-1">{t.order.loginDesc}</p>
            </div>
            <button
              onClick={() => signIn("google", { callbackUrl: "/profile" })}
              className="
                flex items-center gap-2.5 px-5 py-3 rounded-xl flex-shrink-0
                border border-fs-border bg-fs-offwhite
                text-caption font-medium text-fs-gray
                hover:border-fs-subtle hover:text-fs-primary
                transition-all duration-200
              "
            >
              <LogIn size={15} strokeWidth={1.5} />
              {t.profile.login}
            </button>
          </motion.div>
        </FadeIn>
      )}

      {/* ACTIONS */}
      <FadeIn delay={0.2}>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button href={`/tracking?q=${encodeURIComponent(orderId)}`} size="lg" className="flex-1">
            {t.order.trackBtn}
            <ArrowRight size={18} strokeWidth={1.5} />
          </Button>

          <Button href="/catalog" variant="secondary" size="lg" className="flex-1">
            {t.order.continueBtn}
          </Button>
        </div>
      </FadeIn>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function OrderSuccessPage() {
  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <div className="fs-container pt-10 pb-32 sm:py-20">
        <Suspense fallback={null}>
          <SuccessContent />
        </Suspense>
      </div>
    </main>
  )
}
