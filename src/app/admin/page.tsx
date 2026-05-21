"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, ShoppingBag, CircleDollarSign, RefreshCw,
  ChevronDown, Package, Phone, MapPin, MessageSquare,
  Wifi, BarChart2, Lock, Download, Search, X, Calendar,
  ArrowUpRight, Sparkles,
} from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import FadeIn from "@/components/ui/FadeIn"
import MorphNumber from "@/components/ui/MorphNumber"
import { supabase } from "@/lib/supabase"

// ─── PIN GUARD ────────────────────────────────────────────────────────────────

const ADMIN_PIN = "2048"

function PinGuard({ onUnlock }: { onUnlock: () => void }) {
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
        setShake(true)
        setError(true)
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
          <p className="text-[14px] text-fs-gray mt-2">Введите PIN-код для входа</p>
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
              <motion.button
                key={i}
                whileTap={{ scale: 0.93 }}
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="h-16 rounded-2xl bg-white border border-fs-border text-fs-gray text-xl flex items-center justify-center hover:border-fs-subtle hover:text-fs-primary transition-all shadow-sm"
              >
                {k}
              </motion.button>
            ) : (
              <motion.button
                key={i}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleKey(k)}
                className="h-16 rounded-2xl bg-white border border-fs-border text-fs-graphite text-[22px] font-bold hover:bg-fs-light hover:border-fs-primary/30 transition-all shadow-sm"
              >
                {k}
              </motion.button>
            )
          ))}
        </div>
      </motion.div>
    </main>
  )
}

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

const STATUS_META: Record<OrderStatus, {
  label: string
  badge: "success" | "warning" | "ai" | "default" | "error"
  color: string
  bg: string
}> = {
  pending:     { label: "Новый",      badge: "ai",      color: "#6366f1", bg: "#eef2ff" },
  processing:  { label: "Обработка",  badge: "warning", color: "#f59e0b", bg: "#fffbeb" },
  in_delivery: { label: "В доставке", badge: "warning", color: "#f97316", bg: "#fff7ed" },
  delivered:   { label: "Доставлен",  badge: "success", color: "#10b981", bg: "#ecfdf5" },
  cancelled:   { label: "Отменён",    badge: "error",   color: "#ef4444", bg: "#fef2f2" },
}

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "in_delivery", "delivered", "cancelled"]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, num, prefix, suffix, sub, color, bg, loading }: {
  icon: React.ElementType
  label: string
  num: number
  prefix?: string
  suffix?: string
  sub: string
  color: string
  bg: string
  loading: boolean
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="bg-white border border-fs-border rounded-3xl p-6 shadow-sm relative overflow-hidden"
    >
      {/* BG ACCENT */}
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

function RevenueChart({ orders }: { orders: DbOrder[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const data = days.map((day) => {
    const label = day.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
    const revenue = orders
      .filter((o) => {
        const od = new Date(o.created_at)
        return od.getDate() === day.getDate() && od.getMonth() === day.getMonth() && od.getFullYear() === day.getFullYear()
      })
      .reduce((s, o) => s + o.total, 0)
    return { label, revenue }
  })

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const total7d = data.reduce((s, d) => s + d.revenue, 0)

  const W = 600; const H = 160
  const PL = 8;  const PR = 8; const PT = 20; const PB = 36
  const chartW = W - PL - PR
  const chartH = H - PT - PB
  const step   = chartW / (data.length - 1)

  const points = data.map((d, i) => ({
    x: PL + i * step,
    y: PT + chartH - (d.revenue / maxRevenue) * chartH,
    ...d,
  }))

  // Smooth bezier path
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = points[i - 1]
    const cpx = (prev.x + p.x) / 2
    return acc + ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }, "")

  const fillD = `M ${PL} ${PT + chartH} ` + pathD.replace(/^M/, "L") + ` L ${points[points.length - 1].x.toFixed(1)} ${(PT + chartH).toFixed(1)} Z`

  return (
    <div className="bg-white border border-fs-border rounded-3xl p-7 shadow-sm">
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

          {/* GRID LINES */}
          {[0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={frac}
              x1={PL} y1={(PT + chartH * (1 - frac)).toFixed(1)}
              x2={W - PR} y2={(PT + chartH * (1 - frac)).toFixed(1)}
              stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 4"
            />
          ))}

          {/* FILL */}
          <path d={fillD} fill="url(#chartGrad)" />

          {/* LINE */}
          <path d={pathD} fill="none" stroke="#005B46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* HOVER LINE */}
          {hovered !== null && (
            <line
              x1={points[hovered].x} y1={PT}
              x2={points[hovered].x} y2={PT + chartH}
              stroke="#005B46" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.4"
            />
          )}

          {/* POINTS */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
              <circle
                cx={p.x} cy={p.y} r={hovered === i ? 5 : 3.5}
                fill={hovered === i ? "#005B46" : "#fff"}
                stroke="#005B46" strokeWidth="2"
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
    <div className="bg-white border border-fs-border rounded-3xl p-7 shadow-sm">
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
                    style={{ background: `linear-gradient(90deg, #005B46, #22c55e)` }}
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

function OrderRow({ order, onStatusChange }: {
  order: DbOrder
  onStatusChange: (id: string, status: OrderStatus) => void
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
    <motion.div
      layout
      className={`border rounded-2xl overflow-hidden transition-all duration-500 bg-white ${
        flash ? "border-fs-primary shadow-[0_0_0_3px_rgba(0,91,70,0.1)]" : "border-fs-border hover:border-fs-subtle"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-fs-offwhite/50 transition-colors duration-150"
      >
        {/* STATUS DOT */}
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[14px] font-bold text-fs-graphite">{formatOrderId(order.id)}</span>
            <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
            <span className="text-[12px] text-fs-muted">{formatDate(order.created_at)}</span>
          </div>
          <p className="text-[12px] text-fs-gray mt-0.5 truncate">
            {order.company || order.phone} · {order.address}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[16px] font-black text-fs-graphite">₸{order.total.toLocaleString()}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={15} strokeWidth={1.5} className="text-fs-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-fs-border"
          >
            <div className="px-5 py-5 grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT — DETAILS */}
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {[
                    { icon: Phone,       text: order.phone   },
                    { icon: MapPin,      text: order.address },
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
                    <div key={item.id} className="flex items-center gap-3">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[13px] text-fs-graphite flex-1 truncate">{item.title}</span>
                      <span className="text-[12px] text-fs-gray whitespace-nowrap">
                        {item.quantity} × ₸{item.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-fs-border pt-2 mt-2 flex justify-between text-[13px]">
                    <span className="text-fs-gray">Доставка</span>
                    <span className="text-fs-graphite">₸{order.delivery.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold">
                    <span className="text-fs-graphite">Итого</span>
                    <span className="text-fs-primary">₸{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — STATUS SWITCHER */}
              <div>
                <p className="text-[11px] text-fs-gray uppercase tracking-widest mb-3">
                  Изменить статус
                </p>
                <div className="space-y-2">
                  {STATUS_ORDER.map((s) => {
                    const m      = STATUS_META[s]
                    const active = s === order.status
                    return (
                      <motion.button
                        key={s}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatus(s)}
                        disabled={loading}
                        className={`
                          w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium
                          border transition-all duration-150 flex items-center gap-3
                          ${active
                            ? "border-transparent text-white shadow-sm"
                            : "border-fs-border bg-white text-fs-gray hover:border-fs-subtle hover:text-fs-graphite"
                          }
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem("fs_admin") === "1"
  )
  const [orders,  setOrders]  = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,   setFilter]   = useState<OrderStatus | "all">("all")
  const [search,   setSearch]   = useState("")
  const [dateRange, setDateRange] = useState<"all" | "today" | "week" | "month">("all")
  const [live,     setLive]     = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res  = await fetch("/api/orders")
    const data = await res.json()
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as DbOrder, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => prev.map((o) => o.id === (payload.new as DbOrder).id ? payload.new as DbOrder : o))
        } else if (payload.eventType === "DELETE") {
          setOrders((prev) => prev.filter((o) => o.id !== (payload.old as DbOrder).id))
        }
      })
      .subscribe((state) => setLive(state === "SUBSCRIBED"))
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleStatusChange = async (id: string, status: OrderStatus) => {
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
      date:     formatDate(o.created_at),
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

  if (!unlocked) return <PinGuard onUnlock={() => setUnlocked(true)} />

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />

      <div className="fs-container py-16">

        {/* HEADER */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12">
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
              <div className="flex items-center gap-3">
                {live ? (
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
                <span className="text-[12px] text-fs-muted">{orders.length} заказов загружено</span>
              </div>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-white border border-fs-border text-[13px] text-fs-gray
                hover:border-fs-subtle hover:text-fs-primary
                transition-all duration-200 disabled:opacity-50 shadow-sm
              "
            >
              <RefreshCw size={14} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
              Обновить
            </button>
          </div>
        </FadeIn>

        {/* METRICS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {metrics.map(({ icon, label, num, prefix, suffix, sub, color, bg }, i) => (
            <FadeIn key={label} delay={0.06 * i}>
              <MetricCard
                icon={icon} label={label} num={num}
                prefix={prefix} suffix={suffix}
                sub={sub} color={color} bg={bg} loading={loading}
              />
            </FadeIn>
          ))}
        </div>

        {/* ANALYTICS CHARTS */}
        {!loading && orders.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
              <RevenueChart orders={orders} />
              <TopProducts  orders={orders} />
            </div>
          </FadeIn>
        )}

        {/* ORDERS TABLE */}
        <FadeIn delay={0.15}>
          <div className="bg-white border border-fs-border rounded-3xl shadow-sm overflow-hidden">

            {/* TABLE HEADER */}
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
                <button
                  onClick={exportCSV}
                  className="
                    flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                    bg-fs-offwhite border border-fs-border text-[12px] text-fs-gray
                    hover:border-fs-subtle hover:text-fs-primary
                    transition-all duration-200
                  "
                >
                  <Download size={13} strokeWidth={1.5} />
                  Экспорт CSV
                </button>
              )}
            </div>

            <div className="px-7 py-5">
              {/* SEARCH + DATE */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fs-subtle pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск по номеру, телефону, компании..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      w-full pl-9 pr-9 py-3 rounded-xl
                      bg-fs-offwhite border border-fs-border
                      text-[13px] text-fs-graphite placeholder:text-fs-muted
                      focus:border-fs-subtle focus:outline-none focus:bg-white
                      transition-all duration-200
                    "
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-fs-subtle hover:text-fs-gray transition-colors">
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
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`
                          px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150
                          ${active ? "bg-white border border-fs-border text-fs-primary shadow-sm" : "text-fs-gray hover:text-fs-graphite"}
                        `}
                      >
                        {labels[range]}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* STATUS TABS */}
              <div className="flex flex-wrap gap-2 mb-5">
                {FILTER_TABS.map((tab) => {
                  const active = filter === tab.value
                  const count  = tab.value === "all" ? orders.length : orders.filter((o) => o.status === tab.value).length
                  const meta   = tab.value !== "all" ? STATUS_META[tab.value] : null
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setFilter(tab.value)}
                      className={`
                        px-3.5 py-1.5 rounded-full text-[12px] font-semibold
                        border transition-all duration-200 flex items-center gap-1.5
                        ${active
                          ? "border-transparent text-white shadow-sm"
                          : "border-fs-border bg-white text-fs-gray hover:border-fs-subtle"
                        }
                      `}
                      style={active && meta ? { background: meta.color } : active ? { background: "#005B46" } : {}}
                    >
                      {tab.label}
                      <span className={`text-[11px] ${active ? "opacity-70" : "opacity-50"}`}>{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* LIST */}
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
                    <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
