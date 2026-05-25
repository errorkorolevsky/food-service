"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Star, MapPin, Package, Heart, RefreshCw, Phone,
  LogIn, LogOut, RotateCcw, ChevronRight, Sparkles,
} from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"

// ─── TYPES ────────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"

type DbOrder = {
  id:         string
  created_at: string
  phone:      string
  address:    string
  items:      { id: string; title: string; emoji: string; price: number; quantity: number }[]
  total:      number
  status:     OrderStatus
}

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<OrderStatus, { variant: "default" | "success" | "warning" | "ai" | "error"; color: string }> = {
  pending:     { variant: "ai",      color: "#6366f1" },
  processing:  { variant: "warning", color: "#f59e0b" },
  in_delivery: { variant: "warning", color: "#f59e0b" },
  delivered:   { variant: "success", color: "#10b981" },
  cancelled:   { variant: "error",   color: "#ef4444" },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "kz" ? "kk-KZ" : "ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── ORDER ROW ────────────────────────────────────────────────────────────────

function OrderRow({ order, onRepeat, trackLabel, repeatLabel }: { order: DbOrder; onRepeat: (order: DbOrder) => void; trackLabel: string; repeatLabel: string }) {
  const { t, lang } = useLang()
  const style     = STATUS_STYLE[order.status]
  const label     = t.order.statuses[order.status] ?? order.status
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="border border-fs-border rounded-2xl overflow-hidden bg-fs-white hover:border-fs-subtle transition-colors duration-200"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${style.color}18` }}>
            <Package size={15} strokeWidth={1.5} style={{ color: style.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-fs-graphite">{formatOrderId(order.id)}</p>
            <p className="text-[12px] text-fs-gray mt-0.5">
              {itemCount} {t.profile.itemsCount} · {formatDate(order.created_at, lang)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[14px] font-bold text-fs-graphite">₸{order.total.toLocaleString()}</span>
          <Badge variant={style.variant} dot>{label}</Badge>
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={14} strokeWidth={2} className="text-fs-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-fs-border">
              <div className="flex flex-wrap gap-2 mb-3">
                {order.items.map((item) => (
                  <div key={item.id}
                    className="flex items-center gap-2 bg-fs-offwhite border border-fs-border rounded-xl px-3 py-2">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-fs-graphite">{item.title}</p>
                      <p className="text-[11px] text-fs-gray">{item.quantity} × ₸{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <Link href={`/tracking?q=${encodeURIComponent(formatOrderId(order.id))}`}>
                  <span className="text-[12px] text-fs-primary hover:underline">{trackLabel}</span>
                </Link>
                <button
                  onClick={() => onRepeat(order)}
                  className="flex items-center gap-1.5 text-[12px] text-fs-gray hover:text-fs-primary transition-colors"
                >
                  <RotateCcw size={12} strokeWidth={1.5} />
                  {repeatLabel}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ value, label, icon: Icon, color }: {
  value: string; label: string; icon: React.ElementType; color: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className="bg-fs-white border border-fs-border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
    >
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <Icon size={18} strokeWidth={1.5} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] sm:text-[22px] font-black text-fs-graphite leading-none truncate">{value}</p>
        <p className="text-[11px] sm:text-[12px] text-fs-gray mt-0.5 leading-tight">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="border border-fs-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 animate-pulse bg-fs-white">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-fs-border" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-fs-border rounded" />
          <div className="h-3 w-36 bg-fs-border rounded" />
        </div>
      </div>
      <div className="h-6 w-20 bg-fs-border rounded-full" />
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession()
  const { t }   = useLang()
  const favorites = useFavoritesStore((state) => state.products)
  const toggle    = useFavoritesStore((state) => state.toggle)
  const addItem   = useCartStore((state) => state.addItem)
  const openCart  = useCartUI((state) => state.openCart)

  const [orders,       setOrders]       = useState<DbOrder[]>([])
  const [loading,      setLoading]      = useState(false)
  const [phone,        setPhone]        = useState<string | null>(null)
  const [savedAddress, setSavedAddress] = useState<string | null>(null)

  const fetchOrders = async (ph: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/orders/track?q=${encodeURIComponent(ph)}`)
      const data = await res.json()
      if (res.ok && Array.isArray(data)) setOrders(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrders(session.user.email)
      return
    }
    const saved = localStorage.getItem("fs_phone")
    if (saved) {
      setPhone(saved)
      fetchOrders(saved)
    }
    const addr = localStorage.getItem("fs_address")
    if (addr) setSavedAddress(addr)
  }, [session])

  const handleRepeat = (order: DbOrder) => {
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({ id: item.id, title: item.title, price: item.price, emoji: item.emoji })
      }
    })
    openCart()
  }

  const displayName  = session?.user?.name  ?? t.profile.clientBadge
  const displayEmail = session?.user?.email ?? null
  const displayImage = session?.user?.image ?? null

  return (
    <main className="min-h-screen text-fs-graphite" style={{ background: "linear-gradient(160deg, var(--page-bg) 0%, rgb(var(--fs-light)) 60%, var(--page-bg) 100%)" }}>
      {/* AMBIENT BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #005B46 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #005B46 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <CartDrawer />

        {/* HERO SECTION */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-fs-primary/5 via-transparent to-transparent" />

          <div className="fs-container pt-12 pb-10">
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* AVATAR */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white shadow-[0_8px_32px_rgba(0,91,70,0.2)]">
                    {displayImage ? (
                      <Image src={displayImage} alt={displayName} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-fs-primary/20 to-fs-primary/5 flex items-center justify-center">
                        <span className="text-3xl">👨🏻</span>
                      </div>
                    )}
                  </div>
                  {/* ONLINE DOT */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                </motion.div>

                {/* INFO */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-[28px] font-black text-fs-graphite tracking-tight">{displayName}</h1>
                    <Badge variant="ai" dot><Sparkles size={10} className="mr-1" />{t.profile.clientBadge}</Badge>
                  </div>
                  {displayEmail && (
                    <p className="text-[14px] text-fs-gray mt-1">{displayEmail}</p>
                  )}
                  {phone && !displayEmail && (
                    <div className="flex items-center gap-2 mt-1 text-[14px] text-fs-gray">
                      <Phone size={13} strokeWidth={1.5} /><span>{phone}</span>
                    </div>
                  )}
                </div>

                {/* AUTH BUTTON */}
                <div className="flex-shrink-0">
                  {session ? (
                    <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>
                      <LogOut size={16} strokeWidth={1.5} />{t.profile.logout}
                    </Button>
                  ) : (
                    <Button onClick={() => signIn("google", { callbackUrl: "/profile" })}>
                      <LogIn size={16} strokeWidth={1.5} />{t.profile.login}
                    </Button>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* STATS ROW */}
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8">
                <StatCard value={String(orders.length || "0")} label={t.profile.statOrders}  icon={Package} color="#005B46" />
                <StatCard value={String(favorites.length || "0")} label={t.profile.inFavorites} icon={Heart}   color="#ef4444" />
                <StatCard value={t.profile.clientBadge} label={t.profile.clientLevel}         icon={Sparkles} color="#6366f1" />
              </div>
            </FadeIn>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="fs-container pb-24 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ORDERS PANEL */}
            <FadeIn delay={0.05} className="lg:col-span-2">
              <div className="bg-fs-white border border-fs-border rounded-3xl p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-fs-light rounded-xl flex items-center justify-center">
                      <Package size={17} strokeWidth={1.5} className="text-fs-primary" />
                    </div>
                    <h2 className="text-[18px] font-bold text-fs-graphite">{t.profile.orders}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {orders.length > 0 && (
                      <Link href={`/tracking?q=${encodeURIComponent(session?.user?.email ?? phone ?? "")}`}>
                        <span className="text-[12px] text-fs-gray hover:text-fs-primary transition-colors">
                          {t.profile.trackLink}
                        </span>
                      </Link>
                    )}
                    {(phone || session?.user?.email) && (
                      <button
                        onClick={() => fetchOrders(session?.user?.email ?? phone ?? "")}
                        aria-label={t.refresh}
                        className="w-8 h-8 rounded-xl bg-fs-offwhite border border-fs-border flex items-center justify-center text-fs-gray hover:text-fs-primary transition-colors"
                      >
                        <RefreshCw size={13} strokeWidth={1.5} className={loading ? "animate-spin" : ""} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {loading ? (
                    <><OrderSkeleton /><OrderSkeleton /><OrderSkeleton /></>
                  ) : orders.length > 0 ? (
                    orders.map((order) => <OrderRow key={order.id} order={order} onRepeat={handleRepeat} trackLabel={t.profile.trackLink} repeatLabel={t.profile.repeatOrder} />)
                  ) : (
                    <div className="text-center py-14">
                      <div className="w-14 h-14 bg-fs-light rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package size={24} strokeWidth={1} className="text-fs-primary/50" />
                      </div>
                      <p className="text-[15px] font-semibold text-fs-graphite">{t.profile.noOrders}</p>
                      <p className="text-[13px] text-fs-gray mt-2">
                        {!phone && !session ? t.profile.noOrdersAuth : t.profile.noOrdersHint}
                      </p>
                      <Link
                        href="/catalog"
                        className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-fs-primary text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                      >
                        {t.profile.toCatalog}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">

              {/* FAVORITES */}
              <FadeIn delay={0.1}>
                <div className="bg-fs-white border border-fs-border rounded-3xl p-7 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                        <Heart size={17} strokeWidth={1.5} className="text-red-400" />
                      </div>
                      <h2 className="text-[18px] font-bold text-fs-graphite">{t.profile.favorites}</h2>
                    </div>
                    {favorites.length > 0 && (
                      <Link href="/favorites">
                        <span className="text-[12px] text-fs-gray hover:text-fs-primary transition-colors">
                          {favorites.length} {t.profile.favAll}
                        </span>
                      </Link>
                    )}
                  </div>

                  {favorites.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart size={28} strokeWidth={1} className="text-fs-subtle mx-auto mb-3" />
                      <p className="text-[13px] text-fs-gray">{t.profile.noFavorites}</p>
                      <Link href="/catalog" className="mt-3 inline-block text-[12px] text-fs-gray hover:text-fs-primary transition-colors">
                        {t.profile.toCatalog} →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {favorites.slice(0, 4).map((item) => (
                        <div key={item.id}
                          className="bg-fs-offwhite border border-fs-border rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.emoji}</span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-fs-graphite truncate">{item.title}</p>
                              <p className="text-[11px] text-fs-gray mt-0.5">{item.category}</p>
                            </div>
                          </div>
                          <button onClick={() => toggle(item)} aria-label={t.product.removeFromFavorites} className="text-fs-gray hover:text-red-400 transition-colors flex-shrink-0">
                            <Star size={15} strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                      {favorites.length > 4 && (
                        <Link href="/favorites">
                          <p className="text-center text-[12px] text-fs-gray hover:text-fs-primary transition-colors pt-2">
                            {t.profile.favMore} {favorites.length - 4} →
                          </p>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* ADDRESSES */}
              <FadeIn delay={0.15}>
                <div className="bg-fs-white border border-fs-border rounded-3xl p-7 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <MapPin size={17} strokeWidth={1.5} className="text-blue-400" />
                    </div>
                    <h2 className="text-[18px] font-bold text-fs-graphite">{t.profile.addresses}</h2>
                  </div>

                  <div className="space-y-2.5">
                    {savedAddress && (
                      <div className="bg-fs-offwhite border border-fs-border rounded-2xl px-4 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-fs-primary" />
                          <p className="text-[12px] font-semibold text-fs-graphite">{t.profile.mainAddress}</p>
                        </div>
                        <p className="text-[13px] text-fs-gray leading-relaxed pl-3.5">{savedAddress}</p>
                      </div>
                    )}

                    <button className="
                      w-full border border-dashed border-fs-border rounded-2xl py-4
                      text-[13px] text-fs-gray
                      hover:border-fs-primary/40 hover:text-fs-primary hover:bg-fs-light/30
                      transition-all duration-200
                    ">
                      {t.profile.addAddress}
                    </button>
                  </div>
                </div>
              </FadeIn>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
