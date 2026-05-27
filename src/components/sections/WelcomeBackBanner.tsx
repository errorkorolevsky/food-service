"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw, X, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"

import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"
import Badge from "@/components/ui/Badge"

// ─── TYPES ───────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "processing" | "in_delivery" | "delivered" | "cancelled"
type OrderItem   = { id: string; title: string; emoji: string; price: number; quantity: number }
type DbOrder     = { id: string; created_at: string; items: OrderItem[]; total: number; status: OrderStatus }

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "processing", "in_delivery"]
const SESSION_KEY = "fs_welcome_dismissed"
const MAX_REORDER_AGE_MS = 7 * 24 * 60 * 60 * 1000

function formatOrderId(uuid: string) {
  return `#FS-${uuid.slice(-6).toUpperCase()}`
}

const STATUS_BADGE: Record<OrderStatus, "default" | "success" | "warning" | "ai" | "error"> = {
  pending:     "ai",
  processing:  "warning",
  in_delivery: "warning",
  delivered:   "success",
  cancelled:   "error",
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function WelcomeBackBanner() {
  const { data: session, status: sessionStatus } = useSession() ?? {}
  const { t }    = useLang()
  const addItem  = useCartStore((state) => state.addItem)
  const openCart = useCartUI((state) => state.openCart)

  const [order,     setOrder]     = useState<DbOrder | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true)
      return
    }
  }, [])

  // Fetch after session resolves (or immediately for guest with phone)
  useEffect(() => {
    if (!mounted) return
    if (sessionStorage.getItem(SESSION_KEY)) return
    if (sessionStatus === "loading") return

    const identifier = session?.user?.email ?? localStorage.getItem("fs_phone")
    if (!identifier) return

    fetch(`/api/orders/track?q=${encodeURIComponent(identifier)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOrder(data[0])
        }
      })
      .catch(() => {})
  }, [mounted, session, sessionStatus])

  const handleDismiss = () => {
    sessionStorage.setItem(SESSION_KEY, "1")
    setDismissed(true)
  }

  const handleReorder = () => {
    if (!order) return
    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({ id: item.id, title: item.title, price: item.price, emoji: item.emoji })
      }
    })
    openCart()
    handleDismiss()
  }

  if (!mounted || dismissed || !order) return null

  const isActive    = ACTIVE_STATUSES.includes(order.status)
  const isRecent    = Date.now() - new Date(order.created_at).getTime() < MAX_REORDER_AGE_MS
  const showReorder = !isActive && order.status === "delivered" && isRecent && order.items.length > 0

  if (!isActive && !showReorder) return null

  const orderId    = formatOrderId(order.id)
  const itemCount  = order.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <AnimatePresence>
      <motion.div
        key="welcome-banner"
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,   scale: 1    }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 360, damping: 34, delay: 0.4 }}
        className="fs-container mt-4"
      >
        <div className={`
          rounded-2xl border px-4 py-3 flex items-center gap-3
          ${isActive
            ? "bg-fs-primary/[0.06] border-fs-primary/25 dark:bg-fs-primary/10 dark:border-fs-primary/30"
            : "bg-fs-white border-fs-border"
          }
        `}>

          {/* ICON */}
          <div className={`
            w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            ${isActive ? "bg-fs-primary/10" : "bg-fs-offwhite border border-fs-border"}
          `}>
            {isActive
              ? <span className="text-lg select-none">🛵</span>
              : <RotateCcw size={15} strokeWidth={1.5} className="text-fs-gray" />
            }
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            {isActive ? (
              <>
                <span className="text-[13px] font-bold text-fs-graphite">{orderId}</span>
                <Badge variant={STATUS_BADGE[order.status]} dot>
                  {t.order.statuses[order.status]}
                </Badge>
              </>
            ) : (
              <>
                <span className="text-[13px] font-semibold text-fs-graphite">
                  {t.order.welcome.reorderTitle}
                </span>
                <span className="text-[12px] text-fs-gray">
                  {itemCount} {t.order.welcome.items} · ₸{order.total.toLocaleString()}
                </span>
              </>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isActive ? (
              <Link
                href={`/tracking?q=${encodeURIComponent(orderId)}`}
                className="flex items-center gap-1 text-[12px] font-semibold text-fs-primary hover:text-fs-soft transition-colors duration-200"
              >
                {t.order.welcome.trackBtn}
                <ChevronRight size={13} strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={handleReorder}
                className="
                  flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
                  bg-fs-primary text-white text-[12px] font-bold
                  hover:bg-fs-soft transition-colors duration-200
                "
              >
                <RotateCcw size={12} strokeWidth={2} />
                {t.order.welcome.reorderBtn}
              </button>
            )}
            <button
              onClick={handleDismiss}
              aria-label={t.close}
              className="
                w-6 h-6 rounded-lg flex items-center justify-center
                text-fs-muted hover:text-fs-gray hover:bg-fs-offwhite
                transition-colors duration-150
              "
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
