"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, ShoppingBag, CircleDollarSign, RefreshCw,
  ChevronDown, Package, Phone, MapPin, MessageSquare,
  Wifi, BarChart2, Lock, Download, Search, X, Calendar,
  ArrowUpRight, Sparkles, Truck, Users, Clock, CheckCircle,
  AlertCircle, Star, Activity, WifiOff, Tag, Plus, ToggleLeft, ToggleRight,
} from "lucide-react"

import Navbar    from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import FadeIn    from "@/components/ui/FadeIn"
import MorphNumber from "@/components/ui/MorphNumber"
import { supabase } from "@/lib/supabase"
import { MOCK_ORDERS, MOCK_COURIERS, type MockOrder, type MockCourier, type CourierStatus } from "@/data/mock-orders"
import { useSession } from "next-auth/react"
import { useLang } from "@/locales"

// ─── PIN GUARD ────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = "artemfi435@gmail.com"
// Demo PIN for non-authenticated preview — real data requires admin session via API
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "2048"

function PinGuard({ onUnlock }: { onUnlock: () => void }) {
  const { t }             = useLang()
  const [pin,   setPin]   = useState("")
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)

  const handleKey = (k: string) => {
    if (pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        sessionStorage.setItem("fs_admin", "1")
        onUnlock()
      } else {
        setShake(true); setError(true)
        setTimeout(() => { setPin(""); setShake(false); setError(false) }, 700)
      }
    }
  }

  const keys = ["1","2","3","4","5","6","7","8","9","","0","⌫"]

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen flex items-center justify-center">
      <motion.div
        animate={shake ? { x: [-10, 10, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm px-6"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-fs-primary to-[#007A5A] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(0,91,70,0.3)]"
          >
            <Lock size={24} strokeWidth={1.5} className="text-white" />
          </motion.div>
          <h1 className="text-[24px] font-black text-fs-graphite">Admin Dashboard</h1>
          <p className="text-[14px] text-fs-gray mt-2">{t.admin.pinSubtitle}</p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              animate={i < pin.length ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-150
                ${i < pin.length
                  ? error ? "bg-red-500 border-red-500" : "bg-fs-primary border-fs-primary shadow-[0_0_8px_rgba(0,91,70,0.4)]"
                  : "bg-transparent border-fs-border"
                }
              `}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {keys.map((k, i) => (
            k === "" ? <div key={i} /> :
            k === "⌫" ? (
              <motion.button key={i} whileTap={{ scale: 0.93 }}
                onClick={() => setPin((p) => p.slice(0, -1))}
                aria-label={t.deleteChar}
                className="h-16 rounded-2xl bg-white border border-fs-border text-fs-gray text-xl flex items-center justify-center hover:border-fs-subtle hover:text-fs-primary transition-all shadow-sm"
              >{k}</motion.button>
            ) : (
              <motion.button key={i} whileTap={{ scale: 0.93 }}
                onClick={() => handleKey(k)}
                className="h-16 rounded-2xl bg-white border border-fs-border text-fs-graphite text-[22px] font-bold hover:bg-fs-light hover:border-fs-primary/30 transition-all shadow-sm"
              >{k}</motion.button>
            )
          ))}
        </div>
      </motion.div>
    </main>
  )
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"
type DbOrder = MockOrder

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, {
  label: string; badge: string; color: string; bg: string
}> = {
  pending:     { label: "Новый",      badge: "ai",      color: "#6366f1", bg: "#eef2ff" },
  processing:  { label: "Обработка",  badge: "warning", color: "#f59e0b", bg: "#fffbeb" },
  in_delivery: { label: "В доставке", badge: "warning", color: "#f97316", bg: "#fff7ed" },
  delivered:   { label: "Доставлен",  badge: "success", color: "#10b981", bg: "#ecfdf5" },
  cancelled:   { label: "Отменён",    badge: "error",   color: "#ef4444", bg: "#fef2f2" },
}

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "in_delivery", "delivered", "cancelled"]

const COURIER_STATUS_META: Record<CourierStatus, { label: string; color: string; bg: string }> = {
  active:  { label: "В доставке", color: "#10b981", bg: "#ecfdf5" },
  idle:    { label: "Свободен",   color: "#6366f1", bg: "#eef2ff" },
  offline: { label: "Офлайн",     color: "#9ca3af", bg: "#f3f4f6" },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string) { return `#FS-${uuid.slice(-6).toUpperCase()}` }

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, num, prefix, suffix, sub, color, bg, loading }: {
  icon: React.ElementType; label: string; num: number
  prefix?: string; suffix?: string; sub: string
  color: string; bg: string; loading: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-3xl p-6 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.07]"
        style={{ background: color }} />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
          <Icon size={18} strokeWidth={1.5} style={{ color }} />
        </div>
        <ArrowUpRight size={14} strokeWidth={2} className="text-fs-muted" />
      </div>
      <p className="text-[28px] font-black text-fs-graphite leading-none">
        {loading ? (
          <span className="inline-block w-16 h-7 skeleton-green rounded-lg" />
        ) : (
          <MorphNumber value={num} prefix={prefix} suffix={suffix} format={(n) => String(n)} />
        )}
      </p>
      <p className="text-[13px] font-semibold text-fs-graphite mt-1">{label}</p>
      <p className="text-[12px] mt-0.5" style={{ color }}>{sub}</p>
    </motion.div>
  )
}

// ─── REVENUE CHART ────────────────────────────────────────────────────────────

function RevenueChart({ orders, locale }: { orders: DbOrder[]; locale: string }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d
  })

  const data = days.map((day) => {
    const label = day.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" })
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.created_at)
        return od.getDate() === day.getDate() && od.getMonth() === day.getMonth() && od.getFullYear() === day.getFullYear()
      })
      .reduce((s, o) => s + o.total, 0)
    return { label, revenue }
  })

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const total7d    = data.reduce((s, d) => s + d.revenue, 0)

  const W = 600; const H = 160
  const PL = 8; const PR = 8; const PT = 20; const PB = 36
  const chartW = W - PL - PR; const chartH = H - PT - PB
  const step   = chartW / (data.length - 1)

  const points = data.map((d, i) => ({
    x: PL + i * step,
    y: PT + chartH - (d.revenue / maxRevenue) * chartH,
    ...d,
  }))

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = points[i - 1]; const cpx = (prev.x + p.x) / 2
    return acc + ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }, "")

  const fillD = `M ${PL} ${PT + chartH} ` + pathD.replace(/^M/, "L") + ` L ${points[points.length - 1].x.toFixed(1)} ${(PT + chartH).toFixed(1)} Z`

  return (
    <div className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-3xl p-7 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-fs-light rounded-xl flex items-center justify-center">
            <BarChart2 size={17} strokeWidth={1.5} className="text-fs-primary" />
          </div>
          <div>
            <h2 className="text-[16px] font-bold text-fs-graphite">Выручка</h2>
            <p className="text-[12px] text-fs-gray">Последние 7 дней</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[20px] font-black text-fs-graphite">₸{(total7d / 1000).toFixed(0)}K</p>
          <p className="text-[11px] text-fs-gray">за период</p>
        </div>
      </div>

      <div className="mt-4 relative" onMouseLeave={() => setHovered(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#005B46" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#005B46" stopOpacity="0"    />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line key={frac}
              x1={PL} y1={(PT + chartH * (1 - frac)).toFixed(1)}
              x2={W - PR} y2={(PT + chartH * (1 - frac)).toFixed(1)}
              stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}
          <path d={fillD} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke="#005B46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {hovered !== null && (
            <line
              x1={points[hovered].x} y1={PT}
              x2={points[hovered].x} y2={PT + chartH}
              stroke="#005B46" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.4"
            />
          )}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              <circle cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? "#005B46" : "#fff"} stroke="#005B46" strokeWidth="2"
                style={{ transition: "r 0.15s" }}
              />
              {hovered === i && p.revenue > 0 && (
                <g>
                  <rect x={p.x - 32} y={p.y - 30} width="64" height="22" rx="6" fill="#1e1e1e" />
                  <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
                    ₸{(p.revenue / 1000).toFixed(1)}K
                  </text>
                </g>
              )}
              <text x={p.x} y={H - 6} textAnchor="middle" fontSize="11" fill="#9ca3af">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

// ─── TOP PRODUCTS ─────────────────────────────────────────────────────────────

function TopProducts({ orders }: { orders: DbOrder[] }) {
  const counts: Record<string, { title: string; emoji: string; qty: number; revenue: number }> = {}
  for (const order of orders) {
    for (const item of order.items) {
      if (!counts[item.id]) counts[item.id] = { title: item.title, emoji: item.emoji, qty: 0, revenue: 0 }
      counts[item.id].qty     += item.quantity
      counts[item.id].revenue += item.quantity * item.price
    }
  }
  const top = Object.values(counts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const maxRevenue = top[0]?.revenue ?? 1

  return (
    <div className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-3xl p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
          <TrendingUp size={17} strokeWidth={1.5} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-fs-graphite">Топ товаров</h2>
          <p className="text-[12px] text-fs-gray">По выручке</p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-[14px] text-fs-gray text-center py-8">Нет данных</p>
      ) : (
        <div className="space-y-4">
          {top.map((item, i) => {
            const pct = (item.revenue / maxRevenue) * 100
            return (
              <div key={i}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 bg-fs-offwhite rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {item.emoji}
                  </div>
                  <span className="text-[13px] text-fs-graphite font-medium flex-1 truncate">{item.title}</span>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-bold text-fs-graphite">₸{(item.revenue / 1000).toFixed(1)}K</p>
                    <p className="text-[11px] text-fs-gray">{item.qty} шт</p>
                  </div>
                </div>
                <div className="h-1.5 bg-fs-offwhite rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #005B46, #22c55e)" }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── ORDER ROW ────────────────────────────────────────────────────────────────

function OrderRow({ order, onStatusChange, isDemo, locale }: {
  order: DbOrder
  onStatusChange: (id: string, status: OrderStatus) => void
  isDemo: boolean
  locale: string
}) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [flash,   setFlash]   = useState(false)
  const meta = STATUS_META[order.status]

  const handleStatus = async (status: OrderStatus) => {
    if (status === order.status) return
    setLoading(true)
    await onStatusChange(order.id, status)
    setLoading(false)
    setFlash(true)
    setTimeout(() => setFlash(false), 1200)
  }

  return (
    <motion.div layout
      className={`border rounded-2xl overflow-hidden transition-all duration-500 bg-white dark:bg-[#1a1a2e] ${
        flash ? "border-fs-primary shadow-[0_0_0_3px_rgba(0,91,70,0.1)]" : "border-fs-border hover:border-fs-subtle"
      }`}
    >
      <button onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-fs-offwhite/50 transition-colors duration-150"
      >
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[14px] font-bold text-fs-graphite">{formatOrderId(order.id)}</span>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            {order.items.some((i) => i.note) && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <MessageSquare size={10} strokeWidth={2} />
                Note
              </span>
            )}
            <span className="text-[12px] text-fs-muted">{formatDate(order.created_at, locale)}</span>
          </div>
          <p className="text-[12px] text-fs-gray mt-0.5 truncate">
            {order.company || order.phone} · {order.address}
          </p>
          {order.comment && (
            <p className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-0.5 mt-1 truncate max-w-xs">
              💬 {order.comment}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <span className="text-[16px] font-black text-fs-graphite">₸{order.total.toLocaleString()}</span>
            <span className="text-[11px] text-fs-muted">
              {order.items.reduce((s, i) => s + i.quantity, 0)} позиц.
            </span>
          </div>
          <span className="sm:hidden text-[16px] font-black text-fs-graphite">₸{order.total.toLocaleString()}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} strokeWidth={1.5} className="text-fs-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-fs-border"
          >
            <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {[
                    { icon: Phone,         text: order.phone   },
                    { icon: MapPin,        text: order.address },
                    ...(order.comment ? [{ icon: MessageSquare, text: order.comment }] : []),
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13px] text-fs-gray">
                      <Icon size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-fs-muted" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-fs-offwhite border border-fs-border rounded-2xl p-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-[13px] text-fs-graphite flex-1 truncate">{item.title}</span>
                        <span className="text-[12px] text-fs-gray whitespace-nowrap">
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
                  <div className="border-t border-fs-border pt-2 mt-2 flex justify-between text-[13px]">
                    <span className="text-fs-gray">Доставка</span>
                    <span className="text-fs-graphite">
                      {order.delivery === 0 ? "Бесплатно" : `₸${order.delivery.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold">
                    <span className="text-fs-graphite">Итого</span>
                    <span className="text-fs-primary">₸{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-fs-gray uppercase tracking-widest mb-3">
                  Изменить статус{isDemo && <span className="ml-2 normal-case text-amber-500">(демо)</span>}
                </p>
                <div className="space-y-2">
                  {STATUS_ORDER.map((s) => {
                    const m      = STATUS_META[s]
                    const active = s === order.status
                    return (
                      <motion.button key={s} whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatus(s)} disabled={loading}
                        className={`
                          w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium
                          border transition-all duration-150 flex items-center gap-3
                          ${active ? "border-transparent text-white shadow-sm"
                            : "border-fs-border bg-white dark:bg-[#1a1a2e] text-fs-gray hover:border-fs-subtle hover:text-fs-graphite"}
                          disabled:opacity-50 disabled:cursor-wait
                        `}
                        style={active ? { background: m.color, borderColor: m.color } : {}}
                      >
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: active ? "rgba(255,255,255,0.7)" : m.color }} />
                        {m.label}
                        {active && <span className="ml-auto text-[11px] opacity-70">Текущий</span>}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── COURIERS PANEL ───────────────────────────────────────────────────────────

function CouriersPanel({ orders }: { orders: DbOrder[] }) {
  const [couriers, setCouriers] = useState<MockCourier[]>(MOCK_COURIERS)

  const getOrder = (id: string | null) => id ? orders.find((o) => o.id === id) ?? null : null

  const statusCycle: CourierStatus[] = ["active", "idle", "offline"]

  const cycleStatus = (courierId: string) => {
    setCouriers((prev) => prev.map((c) => {
      if (c.id !== courierId) return c
      const nextIdx = (statusCycle.indexOf(c.status) + 1) % statusCycle.length
      return { ...c, status: statusCycle[nextIdx], orderId: statusCycle[nextIdx] === "active" ? c.orderId : null }
    }))
  }

  const activeCount  = couriers.filter((c) => c.status === "active").length
  const idleCount    = couriers.filter((c) => c.status === "idle").length
  const offlineCount = couriers.filter((c) => c.status === "offline").length

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "В доставке", count: activeCount,  color: "#10b981", bg: "#ecfdf5", icon: Truck },
          { label: "Свободны",   count: idleCount,    color: "#6366f1", bg: "#eef2ff", icon: CheckCircle },
          { label: "Офлайн",     count: offlineCount, color: "#9ca3af", bg: "#f3f4f6", icon: WifiOff },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-2xl p-4 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={15} strokeWidth={1.5} style={{ color }} />
            </div>
            <p className="text-[22px] font-black text-fs-graphite leading-none">{count}</p>
            <p className="text-[12px] text-fs-gray">{label}</p>
          </div>
        ))}
      </div>

      {/* Courier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {couriers.map((courier) => {
          const meta  = COURIER_STATUS_META[courier.status]
          const order = getOrder(courier.orderId)
          return (
            <motion.div key={courier.id} layout
              className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-2xl p-5 hover:border-fs-subtle transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0"
                  style={{ background: courier.color }}>
                  {courier.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-fs-graphite truncate">{courier.name}</span>
                    <button
                      onClick={() => cycleStatus(courier.id)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all"
                      style={{ background: meta.bg, color: meta.color }}
                      title="Нажмите для смены статуса (демо)"
                    >
                      {meta.label}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-[12px] text-fs-gray">
                    <Phone size={11} strokeWidth={1.5} />
                    <span>{courier.phone}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-fs-gray">
                    <MapPin size={11} strokeWidth={1.5} />
                    <span>{courier.zone}</span>
                  </div>
                </div>
              </div>

              {/* Active order */}
              {order && courier.status === "active" && (
                <div className="mt-4 bg-fs-offwhite border border-fs-border rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Truck size={12} strokeWidth={1.5} className="text-fs-primary flex-shrink-0" />
                      <span className="text-[13px] font-bold text-fs-graphite">{formatOrderId(order.id)}</span>
                      <span className="text-[12px] text-fs-gray truncate">→ {order.address}</span>
                    </div>
                    {courier.eta && (
                      <div className="flex items-center gap-1 text-[12px] text-fs-primary font-semibold flex-shrink-0">
                        <Clock size={11} strokeWidth={1.5} />
                        {courier.eta}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-fs-gray mt-1.5">
                    {order.items.slice(0, 2).map((i) => `${i.emoji} ${i.title}`).join(" · ")}
                    {order.items.length > 2 && ` +${order.items.length - 2}`}
                  </p>
                </div>
              )}

              {courier.status === "idle" && (
                <div className="mt-4 flex items-center gap-2 text-[12px] text-indigo-500">
                  <CheckCircle size={13} strokeWidth={1.5} />
                  <span>Готов принять новый заказ</span>
                </div>
              )}

              {courier.status === "offline" && (
                <div className="mt-4 flex items-center gap-2 text-[12px] text-fs-muted">
                  <WifiOff size={13} strokeWidth={1.5} />
                  <span>Не на связи</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="text-[12px] text-fs-muted text-center">
        Нажмите на статус курьера для его смены (демо-режим)
      </p>
    </div>
  )
}

// ─── ACTIVITY LOG ────────────────────────────────────────────────────────────

type ActivityItem = {
  id:   string
  icon: React.ElementType
  text: string
  sub:  string
  color: string
  bg:   string
}

function buildActivity(orders: DbOrder[], locale: string): ActivityItem[] {
  const items: ActivityItem[] = []
  const sorted = [...orders].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 8)

  for (const o of sorted) {
    const meta = STATUS_META[o.status]
    const icons: Record<OrderStatus, React.ElementType> = {
      pending:     ShoppingBag,
      processing:  RefreshCw,
      in_delivery: Truck,
      delivered:   CheckCircle,
      cancelled:   AlertCircle,
    }
    items.push({
      id:    o.id,
      icon:  icons[o.status],
      text:  `${formatOrderId(o.id)} — ${meta.label}`,
      sub:   formatDate(o.created_at, locale),
      color: meta.color,
      bg:    meta.bg,
    })
  }
  return items
}

function ActivityLog({ orders, locale }: { orders: DbOrder[]; locale: string }) {
  const items = buildActivity(orders, locale)

  return (
    <div className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-3xl p-7 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
          <Activity size={17} strokeWidth={1.5} className="text-violet-500" />
        </div>
        <div>
          <h2 className="text-[16px] font-bold text-fs-graphite">Активность</h2>
          <p className="text-[12px] text-fs-gray">Последние события</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.bg }}>
                <Icon size={14} strokeWidth={1.5} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-fs-graphite truncate">{item.text}</p>
                <p className="text-[11px] text-fs-muted">{item.sub}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────

type Tab = "orders" | "analytics" | "couriers" | "promos" | "products"

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "orders",    label: "Заказы",    icon: ShoppingBag },
  { value: "analytics", label: "Аналитика", icon: BarChart2   },
  { value: "couriers",  label: "Курьеры",   icon: Truck       },
  { value: "promos",    label: "Промокоды", icon: Tag         },
  { value: "products",  label: "Продукты",  icon: Package     },
]

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session } = useSession()
  const { t, lang }       = useLang()
  const locale             = lang === "kz" ? "kk-KZ" : "ru-RU"
  const isAdminSession = session?.user?.email === ADMIN_EMAIL

  const [pinUnlocked, setPinUnlocked] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("fs_admin") === "1"
  )
  const unlocked = pinUnlocked || isAdminSession

  const [orders,    setOrders]    = useState<DbOrder[]>([])
  const [loading,   setLoading]   = useState(true)
  const [isDemo,    setIsDemo]    = useState(false)
  const [filter,    setFilter]    = useState<OrderStatus | "all">("all")
  const [search,    setSearch]    = useState("")
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all")
  const [live,      setLive]      = useState(false)
  const [tab,       setTab]       = useState<Tab>("orders")

  type PromoCode = { code: string; discount_type: "percent" | "fixed"; discount_value: number; min_order: number; max_uses: number | null; uses: number; expires_at: string | null; is_active: boolean; created_at: string }
  const [promos,       setPromos]       = useState<PromoCode[]>([])
  const [promosLoading, setPromosLoading] = useState(false)
  const [promoForm, setPromoForm] = useState({ code: "", discount_type: "percent" as "percent" | "fixed", discount_value: 10, min_order: 0, max_uses: "", expires_at: "" })
  const [promoFormOpen, setPromoFormOpen] = useState(false)
  const [promoSaving, setPromoSaving] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  const fetchPromos = useCallback(async () => {
    setPromosLoading(true)
    const res = await fetch("/api/admin/promos")
    if (res.ok) {
      const data = await res.json()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPromos(data.promos ?? [])
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPromosLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (tab === "promos" && unlocked) fetchPromos() }, [tab, unlocked, fetchPromos])

  const handleCreatePromo = async () => {
    setPromoSaving(true)
    setPromoError(null)
    const res = await fetch("/api/admin/promos", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        code:           promoForm.code.toUpperCase(),
        discount_type:  promoForm.discount_type,
        discount_value: Number(promoForm.discount_value),
        min_order:      Number(promoForm.min_order) || 0,
        max_uses:       promoForm.max_uses ? Number(promoForm.max_uses) : null,
        expires_at:     promoForm.expires_at ? new Date(promoForm.expires_at).toISOString() : null,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setPromos((prev) => [data.promo, ...prev])
      setPromoFormOpen(false)
      setPromoForm({ code: "", discount_type: "percent", discount_value: 10, min_order: 0, max_uses: "", expires_at: "" })
    } else {
      setPromoError(data.error ?? "Ошибка")
    }
    setPromoSaving(false)
  }

  const handleTogglePromo = async (code: string, current: boolean) => {
    await fetch("/api/admin/promos", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code, is_active: !current }),
    })
    setPromos((prev) => prev.map((p) => p.code === code ? { ...p, is_active: !current } : p))
  }

  type AdminProduct = { id: string; emoji: string; image: string | null; category: string; title: string; price: string; price_num: number; in_stock: boolean; is_hit: boolean; is_new: boolean }
  const [adminProducts,        setAdminProducts]        = useState<AdminProduct[]>([])
  const [adminProductsLoading, setAdminProductsLoading] = useState(false)
  const [productSearch,        setProductSearch]        = useState("")
  const [editingPrice,         setEditingPrice]         = useState<{ id: string; val: string } | null>(null)

  const fetchAdminProducts = useCallback(async () => {
    setAdminProductsLoading(true)
    const res = await fetch("/api/admin/products")
    if (res.ok) {
      const data = await res.json()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminProducts(data.products ?? [])
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdminProductsLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (tab === "products" && unlocked) fetchAdminProducts() }, [tab, unlocked, fetchAdminProducts])

  const handleToggleStock = async (id: string, current: boolean) => {
    setAdminProducts((prev) => prev.map((p) => p.id === id ? { ...p, in_stock: !current } : p))
    await fetch("/api/admin/products", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, in_stock: !current }),
    })
  }

  const handleSavePrice = async (id: string, valStr: string) => {
    const num = parseInt(valStr.replace(/\D/g, ""), 10)
    if (!num || num <= 0) { setEditingPrice(null); return }
    setAdminProducts((prev) => prev.map((p) => p.id === id ? { ...p, price_num: num, price: `₸${num.toLocaleString("ru-RU")}` } : p))
    setEditingPrice(null)
    await fetch("/api/admin/products", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, price_num: num }),
    })
  }

  const filteredAdminProducts = adminProducts.filter((p) =>
    !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase())
  )

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/orders")
      if (!res.ok) throw new Error("not-ok")
      const data = await res.json()
      if (Array.isArray(data) && data.length >= 0) {
        setOrders(data)
        setIsDemo(false)
      } else {
        throw new Error("bad-data")
      }
    } catch {
      // Fall back to mock data for demo
      setOrders(MOCK_ORDERS as DbOrder[])
      setIsDemo(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (unlocked) fetchOrders() }, [unlocked, fetchOrders])

  useEffect(() => {
    if (!unlocked) return
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as DbOrder, ...prev])
          setIsDemo(false)
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map((o) => o.id === (payload.new as DbOrder).id ? payload.new as DbOrder : o))
        } else if (payload.eventType === "DELETE") {
          setOrders((prev) => prev.filter((o) => o.id !== (payload.old as DbOrder).id))
        }
      })
      .subscribe((state) => setLive(state === "SUBSCRIBED"))
    return () => { supabase.removeChannel(channel) }
  }, [unlocked])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    if (isDemo) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
      return
    }
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  // ─── METRICS ───────────────────────────────────────────────────────────────

  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0)
  const totalOrders  = orders.length
  const activeOrders = orders.filter((o) => o.status === "processing" || o.status === "in_delivery").length
  const newOrders    = orders.filter((o) => o.status === "pending").length

  const metrics = [
    { icon: CircleDollarSign, label: "Выручка",       num: Math.round(totalRevenue / 1000), prefix: "₸", suffix: "K", sub: "доставленные", color: "#005B46", bg: "#f0f7f4" },
    { icon: ShoppingBag,      label: "Всего заказов",  num: totalOrders,                                               sub: "за всё время",  color: "#6366f1", bg: "#eef2ff" },
    { icon: TrendingUp,       label: "В работе",       num: activeOrders,                                              sub: "обработка + в пути", color: "#f59e0b", bg: "#fffbeb" },
    { icon: Package,          label: "Новые",          num: newOrders,                                                 sub: "ожидают обработки", color: "#8b5cf6", bg: "#f5f3ff" },
  ]

  // ─── CSV EXPORT ────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = visible.map((o) => ({
      id:       formatOrderId(o.id),
      date:     formatDate(o.created_at, locale),
      company:  o.company ?? "",
      phone:    o.phone,
      address:  o.address,
      items:    o.items.map((i) => `${i.title} ×${i.quantity}`).join("; "),
      subtotal: o.subtotal,
      delivery: o.delivery,
      total:    o.total,
      payment:  o.payment,
      status:   STATUS_META[o.status].label,
    }))
    const headers = ["ID","Дата","Компания","Телефон","Адрес","Товары","Сумма","Доставка","Итого","Оплата","Статус"]
    const csv = [
      headers.join(","),
      ...rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url; a.download = `fs-orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // ─── FILTERS ───────────────────────────────────────────────────────────────

  const visible = (() => {
    let result = orders
    if (filter !== "all") result = result.filter((o) => o.status === filter)
    if (dateRange !== "all") {
      // eslint-disable-next-line react-hooks/purity
      const now  = Date.now()
      const cuts: Record<string, number> = { today: now - 86400000, week: now - 604800000, month: now - 2592000000 }
      result = result.filter((o) => new Date(o.created_at).getTime() >= cuts[dateRange])
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((o) =>
        formatOrderId(o.id).toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        (o.company ?? "").toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.items.some((i) => i.title.toLowerCase().includes(q))
      )
    }
    return result
  })()

  const visibleTotal = visible.reduce((s, o) => s + o.total, 0)

  const FILTER_TABS: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all",         label: "Все"        },
    { value: "pending",     label: "Новые"      },
    { value: "processing",  label: "Обработка"  },
    { value: "in_delivery", label: "В доставке" },
    { value: "delivered",   label: "Доставлены" },
    { value: "cancelled",   label: "Отменены"   },
  ]

  if (!unlocked) return <PinGuard onUnlock={() => setPinUnlocked(true)} />

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="fs-container py-16">

        {/* HEADER */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-fs-primary to-[#007A5A] rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(0,91,70,0.3)]">
                  <Sparkles size={18} strokeWidth={1.5} className="text-white" />
                </div>
                <div>
                  <h1 className="text-[24px] font-black text-fs-graphite leading-none">Dashboard</h1>
                  <p className="text-[12px] text-fs-gray mt-0.5">Food Service Kazakhstan</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {isDemo ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                    <Star size={11} strokeWidth={2} className="text-amber-500" />
                    <span className="text-[12px] font-semibold text-amber-600">Демо-режим</span>
                  </div>
                ) : live ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[12px] font-semibold text-emerald-600">Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-fs-offwhite border border-fs-border">
                    <Wifi size={12} strokeWidth={1.5} className="text-fs-muted" />
                    <span className="text-[12px] text-fs-gray">Connecting...</span>
                  </div>
                )}
                <span className="text-[12px] text-fs-muted">
                  {orders.length} заказов{isDemo ? " (mock data)" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDemo && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[12px] text-amber-700">
                  <AlertCircle size={13} strokeWidth={1.5} />
                  Суpabase не подключён
                </div>
              )}
              <button
                onClick={fetchOrders} disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-fs-border text-[13px] text-fs-gray hover:border-fs-subtle hover:text-fs-primary transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                <RefreshCw size={14} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
                Обновить
              </button>
            </div>
          </div>
        </FadeIn>

        {/* METRICS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {metrics.map(({ icon, label, num, prefix, suffix, sub, color, bg }, i) => (
            <FadeIn key={label} delay={0.06 * i}>
              <MetricCard icon={icon} label={label} num={num}
                prefix={prefix} suffix={suffix}
                sub={sub} color={color} bg={bg} loading={loading}
              />
            </FadeIn>
          ))}
        </div>

        {/* TAB NAV */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-1 bg-white border border-fs-border rounded-2xl p-1 mb-6 w-fit">
            {TABS.map(({ value, label, icon: Icon }) => {
              const active = tab === value
              return (
                <button key={value} onClick={() => setTab(value)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                    transition-all duration-200
                    ${active
                      ? "bg-fs-primary text-white shadow-sm"
                      : "text-fs-gray hover:text-fs-graphite hover:bg-fs-offwhite"}
                  `}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {label}
                </button>
              )
            })}
          </div>
        </FadeIn>

        {/* TAB: ORDERS */}
        {tab === "orders" && (
          <FadeIn delay={0.12}>
            <div className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-3xl shadow-sm overflow-hidden">
              <div className="px-7 py-5 border-b border-fs-border flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[18px] font-bold text-fs-graphite">Заказы</h2>
                  {!loading && visible.length > 0 && (
                    <p className="text-[12px] text-fs-gray mt-0.5">
                      {visible.length} из {orders.length} · итого{" "}
                      <span className="text-fs-graphite font-bold">₸{visibleTotal.toLocaleString()}</span>
                    </p>
                  )}
                </div>
                {visible.length > 0 && (
                  <button onClick={exportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-fs-offwhite border border-fs-border text-[12px] text-fs-gray hover:border-fs-subtle hover:text-fs-primary transition-all duration-200"
                  >
                    <Download size={13} strokeWidth={1.5} />
                    Экспорт CSV
                  </button>
                )}
              </div>

              <div className="px-7 py-5">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fs-subtle pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Поиск по номеру, телефону, адресу, товару..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-9 py-3 rounded-xl bg-fs-offwhite border border-fs-border text-[13px] text-fs-graphite placeholder:text-fs-muted focus:border-fs-subtle focus:outline-none focus:bg-white transition-all duration-200"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} aria-label={t.close} className="absolute right-3 top-1/2 -translate-y-1/2 text-fs-subtle hover:text-fs-gray transition-colors">
                        <X size={14} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-fs-offwhite border border-fs-border rounded-xl px-2 py-2 flex-shrink-0">
                    <Calendar size={13} strokeWidth={1.5} className="text-fs-muted ml-1 mr-1" />
                    {(["all", "today", "week", "month"] as const).map((range) => {
                      const labels = { all: "Всё", today: "День", week: "Неделя", month: "Месяц" }
                      const active = dateRange === range
                      return (
                        <button key={range} onClick={() => setDateRange(range)}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150
                            ${active ? "bg-white border border-fs-border text-fs-primary shadow-sm" : "text-fs-gray hover:text-fs-graphite"}`}
                        >
                          {labels[range]}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {FILTER_TABS.map((ftab) => {
                    const active = filter === ftab.value
                    const count  = ftab.value === "all" ? orders.length : orders.filter((o) => o.status === ftab.value).length
                    const meta   = ftab.value !== "all" ? STATUS_META[ftab.value] : null
                    return (
                      <button key={ftab.value} onClick={() => setFilter(ftab.value)}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 flex items-center gap-1.5
                          ${active ? "border-transparent text-white shadow-sm" : "border-fs-border bg-white dark:bg-[#1a1a2e] text-fs-gray hover:border-fs-subtle"}`}
                        style={active && meta ? { background: meta.color } : active ? { background: "#005B46" } : {}}
                      >
                        {ftab.label}
                        <span className={`text-[11px] ${active ? "opacity-70" : "opacity-50"}`}>{count}</span>
                      </button>
                    )
                  })}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 skeleton-green rounded-2xl" />
                    ))}
                  </div>
                ) : visible.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 bg-fs-offwhite rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package size={20} strokeWidth={1} className="text-fs-muted" />
                    </div>
                    <p className="text-[15px] text-fs-gray">
                      {search ? `Ничего не найдено по "${search}"` : "Заказов нет"}
                    </p>
                    {search && (
                      <button onClick={() => setSearch("")} className="mt-3 text-[13px] text-fs-gray hover:text-fs-primary transition-colors">
                        Сбросить →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {visible.map((order) => (
                      <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} isDemo={isDemo} locale={locale} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}

        {/* TAB: ANALYTICS */}
        {tab === "analytics" && (
          <FadeIn delay={0.1}>
            <div className="space-y-5">
              {loading ? (
                <div className="h-64 skeleton-green rounded-3xl" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <RevenueChart orders={orders} locale={locale} />
                  <TopProducts  orders={orders} />
                </div>
              )}
              {!loading && <ActivityLog orders={orders} locale={locale} />}

              {/* Stats row */}
              {!loading && orders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Средний чек",
                      value: `₸${Math.round(orders.reduce((s,o)=>s+o.total,0)/orders.length).toLocaleString()}`,
                      icon: CircleDollarSign, color: "#005B46", bg: "#f0f7f4",
                    },
                    {
                      label: "Доставлено",
                      value: `${Math.round(orders.filter(o=>o.status==="delivered").length/orders.length*100)}%`,
                      icon: CheckCircle, color: "#10b981", bg: "#ecfdf5",
                    },
                    {
                      label: "Курьеров активно",
                      value: `${MOCK_COURIERS.filter(c=>c.status==="active").length} из ${MOCK_COURIERS.length}`,
                      icon: Users, color: "#6366f1", bg: "#eef2ff",
                    },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#1a1a2e] border border-fs-border rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                        <Icon size={18} strokeWidth={1.5} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-[20px] font-black text-fs-graphite leading-none">{value}</p>
                        <p className="text-[12px] text-fs-gray mt-1">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {/* TAB: COURIERS */}
        {tab === "couriers" && (
          <FadeIn delay={0.1}>
            <CouriersPanel orders={orders} />
          </FadeIn>
        )}

        {/* TAB: PROMOS */}
        {tab === "promos" && (
          <FadeIn delay={0.1}>
            <div className="space-y-5">
              {/* CREATE BUTTON */}
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-fs-graphite">Промокоды</h2>
                <button
                  onClick={() => { setPromoFormOpen((v) => !v); setPromoError(null) }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-fs-primary text-white text-[13px] font-bold hover:bg-fs-soft transition-colors"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  Создать промокод
                </button>
              </div>

              {/* CREATE FORM */}
              <AnimatePresence>
                {promoFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-fs-white border border-fs-border rounded-2xl p-6">
                      <p className="text-[15px] font-bold text-fs-graphite mb-5">Новый промокод</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">Код</label>
                          <input
                            type="text"
                            value={promoForm.code}
                            onChange={(e) => setPromoForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                            placeholder="WELCOME10"
                            maxLength={30}
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite uppercase tracking-widest outline-none focus:border-fs-primary/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">Тип</label>
                          <select
                            value={promoForm.discount_type}
                            onChange={(e) => setPromoForm((f) => ({ ...f, discount_type: e.target.value as "percent" | "fixed" }))}
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                          >
                            <option value="percent">Процент %</option>
                            <option value="fixed">Фиксированная ₸</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">
                            {promoForm.discount_type === "percent" ? "Размер скидки %" : "Размер скидки ₸"}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={promoForm.discount_type === "percent" ? 100 : 1_000_000}
                            value={promoForm.discount_value}
                            onChange={(e) => setPromoForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">Минимальный заказ ₸</label>
                          <input
                            type="number"
                            min={0}
                            value={promoForm.min_order}
                            onChange={(e) => setPromoForm((f) => ({ ...f, min_order: Number(e.target.value) }))}
                            placeholder="0"
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">Макс. использований</label>
                          <input
                            type="number"
                            min={1}
                            value={promoForm.max_uses}
                            onChange={(e) => setPromoForm((f) => ({ ...f, max_uses: e.target.value }))}
                            placeholder="Без ограничений"
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] text-fs-gray mb-1.5 block uppercase tracking-wider">Срок действия</label>
                          <input
                            type="date"
                            value={promoForm.expires_at}
                            onChange={(e) => setPromoForm((f) => ({ ...f, expires_at: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                          />
                        </div>
                      </div>
                      {promoError && <p className="text-[12px] text-red-400 mb-3">{promoError}</p>}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleCreatePromo}
                          disabled={promoSaving || !promoForm.code.trim()}
                          className="px-5 py-2.5 rounded-xl bg-fs-primary text-white text-[13px] font-bold hover:bg-fs-soft transition-colors disabled:opacity-40"
                        >
                          {promoSaving ? "Сохраняем..." : "Создать"}
                        </button>
                        <button onClick={() => setPromoFormOpen(false)} className="text-[13px] text-fs-gray hover:text-fs-graphite transition-colors">
                          Отмена
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PROMO LIST */}
              {promosLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map((i) => <div key={i} className="h-16 skeleton-green rounded-xl animate-pulse" />)}
                </div>
              ) : promos.length === 0 ? (
                <div className="text-center py-16 text-[14px] text-fs-gray">
                  Промокодов пока нет. Создайте первый!
                </div>
              ) : (
                <div className="space-y-2">
                  {promos.map((p) => (
                    <div key={p.code} className={`bg-fs-white border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-colors duration-200 ${p.is_active ? "border-fs-border" : "border-fs-border opacity-50"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${p.is_active ? "bg-fs-primary/10" : "bg-fs-offwhite"}`}>
                          <Tag size={14} strokeWidth={1.5} className={p.is_active ? "text-fs-primary" : "text-fs-gray"} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-bold text-fs-graphite tracking-widest">{p.code}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-fs-offwhite border border-fs-border text-fs-gray">
                              {p.discount_type === "percent" ? `-${p.discount_value}%` : `-₸${p.discount_value.toLocaleString()}`}
                            </span>
                            {p.min_order > 0 && (
                              <span className="text-[11px] text-fs-gray">от ₸{p.min_order.toLocaleString()}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-fs-gray mt-0.5">
                            Использовано: {p.uses}{p.max_uses ? ` / ${p.max_uses}` : ""}
                            {p.expires_at && ` · до ${new Date(p.expires_at).toLocaleDateString("ru-RU")}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePromo(p.code, p.is_active)}
                        aria-label={p.is_active ? "Деактивировать" : "Активировать"}
                        className="flex items-center gap-1.5 text-[12px] text-fs-gray hover:text-fs-primary transition-colors flex-shrink-0"
                      >
                        {p.is_active ? <ToggleRight size={20} strokeWidth={1.5} className="text-fs-primary" /> : <ToggleLeft size={20} strokeWidth={1.5} />}
                        {p.is_active ? "Активен" : "Выкл"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        )}
        {/* TAB: PRODUCTS */}
        {tab === "products" && (
          <FadeIn delay={0.1}>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[18px] font-bold text-fs-graphite">Каталог продуктов</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-fs-gray">{filteredAdminProducts.length} из {adminProducts.length}</span>
                  <button onClick={fetchAdminProducts} className="w-8 h-8 rounded-xl bg-fs-offwhite border border-fs-border flex items-center justify-center text-fs-gray hover:text-fs-primary transition-colors">
                    <RefreshCw size={13} strokeWidth={1.5} className={adminProductsLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* SEARCH */}
              <div className="relative">
                <Search size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-fs-gray pointer-events-none" />
                <input
                  type="text"
                  placeholder="Поиск по названию или категории..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-fs-offwhite border border-fs-border rounded-xl text-[13px] text-fs-graphite outline-none focus:border-fs-primary/40 transition-colors"
                />
                {productSearch && (
                  <button onClick={() => setProductSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-fs-gray hover:text-fs-graphite">
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* LIST */}
              {adminProductsLoading ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map((i) => <div key={i} className="h-14 skeleton-green rounded-xl animate-pulse" />)}
                </div>
              ) : filteredAdminProducts.length === 0 ? (
                <div className="text-center py-12 text-[14px] text-fs-gray">Продукты не найдены</div>
              ) : (
                <div className="space-y-1.5">
                  {filteredAdminProducts.map((p) => (
                    <div key={p.id} className="bg-fs-white border border-fs-border rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-fs-offwhite flex items-center justify-center text-xl flex-shrink-0">
                        {p.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-fs-graphite truncate">{p.title}</p>
                        <p className="text-[11px] text-fs-gray">{p.category}</p>
                      </div>
                      {/* PRICE EDIT */}
                      <div className="flex-shrink-0">
                        {editingPrice?.id === p.id ? (
                          <input
                            type="number"
                            autoFocus
                            value={editingPrice.val}
                            onChange={(e) => setEditingPrice({ id: p.id, val: e.target.value })}
                            onBlur={() => handleSavePrice(p.id, editingPrice.val)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSavePrice(p.id, editingPrice.val); if (e.key === "Escape") setEditingPrice(null) }}
                            className="w-20 px-2 py-1 bg-fs-offwhite border border-fs-primary/40 rounded-lg text-[12px] text-fs-graphite outline-none text-right"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingPrice({ id: p.id, val: String(p.price_num) })}
                            className="text-[12px] font-bold text-fs-graphite hover:text-fs-primary transition-colors tabular-nums"
                          >
                            {p.price}
                          </button>
                        )}
                      </div>
                      {/* STOCK TOGGLE */}
                      <button
                        onClick={() => handleToggleStock(p.id, p.in_stock)}
                        aria-label={p.in_stock ? "Убрать из наличия" : "Вернуть в наличие"}
                        className="flex-shrink-0 flex items-center gap-1.5 text-[11px] transition-colors duration-200"
                      >
                        {p.in_stock
                          ? <ToggleRight size={20} strokeWidth={1.5} className="text-fs-primary" />
                          : <ToggleLeft  size={20} strokeWidth={1.5} className="text-fs-gray" />
                        }
                        <span className={p.in_stock ? "text-fs-primary font-medium" : "text-fs-gray"}>
                          {p.in_stock ? "В наличии" : "Нет"}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        )}

      </div>
    </main>
  )
}
