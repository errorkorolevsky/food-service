"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Smartphone, Truck, CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react"
import { useSession } from "next-auth/react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import Badge from "@/components/ui/Badge"
import FadeIn from "@/components/ui/FadeIn"

import { useCartStore } from "@/store/cartStore"
import { useLang } from "@/locales"

const DELIVERY_FEE = 1500

// ─── GLASS INPUT ─────────────────────────────────────────────────────────────

function GlassInput({
  as: As = "input",
  error,
  className = "",
  ...props
}: {
  as?: "input" | "textarea"
  error?: boolean
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative">
      <As
        {...(props as object)}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e as never) }}
        onBlur={(e)  => { setFocused(false); props.onBlur?.(e as never) }}
        className={`
          w-full px-5 py-4 rounded-2xl
          bg-white border text-fs-graphite placeholder-fs-muted
          text-[15px] outline-none
          transition-all duration-200
          ${error
            ? "border-red-400/60 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
            : focused
              ? "border-fs-primary/50 shadow-[0_0_0_3px_rgba(0,91,70,0.08),0_2px_8px_rgba(0,0,0,0.06)]"
              : "border-fs-border shadow-sm hover:border-fs-subtle"
          }
          ${className}
        `}
      />
    </div>
  )
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { t } = useLang()
  const [payment,    setPayment]    = useState("kaspi")
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // ─── FORM STATE ──────────────────────────────────────────────────────────────
  const [company,      setCompany]      = useState(() => typeof window !== "undefined" ? localStorage.getItem("fs_company") ?? "" : "")
  const [phone,        setPhone]        = useState(() => typeof window !== "undefined" ? localStorage.getItem("fs_phone")   ?? "" : "")
  const [address,      setAddress]      = useState(() => typeof window !== "undefined" ? localStorage.getItem("fs_address") ?? "" : "")
  const [comment,      setComment]      = useState("")
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [addrTouched,  setAddrTouched]  = useState(false)
  const [shakePhone,   setShakePhone]   = useState(false)
  const [shakeAddr,    setShakeAddr]    = useState(false)
  const [deliveryDate, setDeliveryDate] = useState("today")
  const [deliveryTime, setDeliveryTime] = useState(t.checkout.timeSlots[0])

  const router         = useRouter()
  const items          = useCartStore((state) => state.items)
  const getTotalPrice  = useCartStore((state) => state.getTotalPrice)
  const clearCart      = useCartStore((state) => state.clearCart)
  const subtotal       = getTotalPrice()
  const total          = subtotal + DELIVERY_FEE

  const handleSubmit = async () => {
    if (items.length === 0) return
    if (!phone.trim() || !address.trim()) {
      setError(t.checkout.requiredFields)
      setPhoneTouched(true)
      setAddrTouched(true)
      if (!phone.trim())   { setShakePhone(true); setTimeout(() => setShakePhone(false), 500) }
      if (!address.trim()) { setShakeAddr(true);  setTimeout(() => setShakeAddr(false),  500) }
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          company, phone, address, comment, payment,
          delivery_date: deliveryDate, delivery_time: deliveryTime,
          items, subtotal, delivery: DELIVERY_FEE, total,
          user_email: session?.user?.email ?? null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? t.checkout.errorSubmit)
        setSubmitting(false)
        return
      }

      localStorage.setItem("fs_phone",   phone.trim())
      if (address.trim()) localStorage.setItem("fs_address", address.trim())
      if (company.trim()) localStorage.setItem("fs_company", company.trim())
      clearCart()
      router.push(`/order/success?id=${data.id}&payment=${payment}&total=${total}`)
    } catch {
      setError(t.checkout.errorConn)
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen text-fs-graphite" style={{ background: "linear-gradient(135deg, #f8faf9 0%, #f0f7f4 50%, #f8faf9 100%)" }}>
      {/* AMBIENT BLOBS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #005B46 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #005B46 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10">
        <Navbar />
        <CartDrawer />

        <div className="fs-container pt-8 pb-44 sm:pt-16 sm:pb-16 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14 items-start">

            {/* LEFT — FORM */}
            <FadeIn>
              <div>
                <Badge variant="ai" dot className="mb-8">
                  {t.checkout.badge}
                </Badge>

                <h1 className="text-heading text-fs-graphite">
                  {t.checkout.title}
                </h1>

                <p className="text-body text-fs-gray mt-4">
                  {t.checkout.subtitle}
                </p>

                {/* CONTACT SECTION */}
                <motion.div
                  className="mt-12"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0, 0, 0.2, 1], delay: 0.1 }}
                >
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-5">
                    {t.checkout.contacts}
                  </p>

                  <div className="space-y-4">
                    <GlassInput
                      type="text"
                      placeholder={t.checkout.companyPlaceholder}
                      value={company}
                      onChange={(e) => setCompany((e.target as HTMLInputElement).value)}
                    />

                    <motion.div animate={shakePhone ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
                      <GlassInput
                        type="tel"
                        placeholder={t.checkout.phonePlaceholder}
                        value={phone}
                        error={phoneTouched && !phone.trim()}
                        onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                        onBlur={() => setPhoneTouched(true)}
                      />
                      {phoneTouched && !phone.trim() && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-label text-red-400 mt-1.5 ml-1">
                          {t.checkout.phoneMissing}
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div animate={shakeAddr ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.4 }}>
                      <GlassInput
                        type="text"
                        placeholder={t.checkout.addressPlaceholder}
                        value={address}
                        error={addrTouched && !address.trim()}
                        onChange={(e) => setAddress((e.target as HTMLInputElement).value)}
                        onBlur={() => setAddrTouched(true)}
                      />
                      {addrTouched && !address.trim() && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                          className="text-label text-red-400 mt-1.5 ml-1">
                          {t.checkout.addressMissing}
                        </motion.p>
                      )}
                    </motion.div>

                    <GlassInput
                      as="textarea"
                      placeholder={t.checkout.commentPlaceholder}
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment((e.target as HTMLTextAreaElement).value)}
                      className="resize-none"
                    />
                  </div>
                </motion.div>

                {/* DELIVERY DATE / TIME */}
                <div className="mt-12">
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-5">
                    {t.checkout.date}
                  </p>
                  <div className="flex gap-2 flex-wrap mb-6">
                    {[
                      { key: "today",    label: t.checkout.dateToday    },
                      { key: "tomorrow", label: t.checkout.dateTomorrow },
                    ].map(({ key, label }) => (
                      <motion.button
                        key={key}
                        onClick={() => setDeliveryDate(key)}
                        whileTap={{ scale: 0.97 }}
                        className={`
                          px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-all duration-200
                          ${deliveryDate === key
                            ? "bg-fs-primary text-white border-fs-primary shadow-[0_0_0_3px_rgba(0,91,70,0.12)]"
                            : "bg-white text-fs-gray border-fs-border hover:border-fs-primary/30 hover:text-fs-graphite"
                          }
                        `}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>

                  <p className="text-label text-fs-gray uppercase tracking-widest mb-4">
                    {t.checkout.time}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {t.checkout.timeSlots.map((slot) => (
                      <motion.button
                        key={slot}
                        onClick={() => setDeliveryTime(slot)}
                        whileTap={{ scale: 0.97 }}
                        className={`
                          px-4 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200
                          ${deliveryTime === slot
                            ? "bg-fs-primary text-white border-fs-primary shadow-[0_0_0_3px_rgba(0,91,70,0.12)]"
                            : "bg-white text-fs-gray border-fs-border hover:border-fs-primary/30 hover:text-fs-graphite"
                          }
                        `}
                      >
                        {slot}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* PAYMENT SECTION */}
                <div className="mt-12">
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-5">
                    {t.checkout.payment}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { id: "kaspi",   icon: Smartphone, label: t.checkout.payKaspi,   desc: t.checkout.descKaspi   },
                      { id: "freedom", icon: CreditCard, label: t.checkout.payFreedom, desc: t.checkout.descFreedom },
                      { id: "cash",    icon: CreditCard, label: t.checkout.payCash,    desc: t.checkout.descCash    },
                    ] as const).map(({ id, icon: Icon, label, desc }) => (
                      <motion.button
                        key={id}
                        onClick={() => setPayment(id)}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        className={`
                          relative text-left
                          border rounded-2xl p-5
                          transition-all duration-200
                          ${payment === id
                            ? "border-fs-primary bg-gradient-to-br from-fs-light to-white shadow-[0_0_0_3px_rgba(0,91,70,0.1)]"
                            : "border-fs-border bg-white hover:border-fs-subtle hover:shadow-sm"
                          }
                        `}
                      >
                        {payment === id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3.5 right-3.5"
                          >
                            <CheckCircle2 size={16} className="text-fs-primary" strokeWidth={2} />
                          </motion.div>
                        )}

                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
                          payment === id ? "bg-fs-primary/10" : "bg-fs-offwhite"
                        }`}>
                          <Icon size={18} strokeWidth={1.5} className={payment === id ? "text-fs-primary" : "text-fs-gray"} />
                        </div>

                        <h3 className="text-[14px] font-bold text-fs-graphite">{label}</h3>
                        <p className="text-[12px] text-fs-gray mt-0.5">{desc}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* RIGHT — ORDER SUMMARY */}
            <FadeIn delay={0.15}>
              <div className="
                sticky top-24
                bg-white border border-fs-border rounded-3xl
                overflow-hidden
                shadow-[0_4px_40px_rgba(0,0,0,0.07)]
              ">
                {/* SUMMARY HEADER */}
                <div className="
                  px-7 py-5
                  bg-gradient-to-br from-fs-primary to-[#007A5A]
                  flex items-center gap-3
                ">
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} strokeWidth={1.5} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-white">{t.checkout.summary}</h2>
                    <p className="text-[12px] text-white/70 mt-0.5">
                      {items.length > 0 ? `${items.reduce((s, i) => s + i.quantity, 0)} ${t.catalog.count_many}` : t.checkout.cartEmpty}
                    </p>
                  </div>
                </div>

                <div className="px-7 py-6">
                  {/* ITEMS */}
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag size={28} strokeWidth={1} className="text-fs-subtle mx-auto mb-3" />
                      <p className="text-body text-fs-gray">{t.checkout.cartEmpty}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-none pr-1">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="
                            bg-fs-offwhite border border-fs-border rounded-2xl
                            px-4 py-3
                            flex items-center justify-between gap-3
                          "
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                              {item.emoji}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-fs-graphite leading-tight truncate">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-fs-gray mt-0.5">
                                {item.quantity} × ₸{item.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-[13px] font-bold text-fs-graphite flex-shrink-0">
                            ₸{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* TOTALS */}
                  <div className="mt-5 pt-5 border-t border-fs-border space-y-3">
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="text-fs-gray">{t.cart.subtotal}</span>
                      <span className="text-fs-graphite font-medium">₸{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[14px]">
                      <div className="flex items-center gap-2 text-fs-gray">
                        <Truck size={13} strokeWidth={1.5} />
                        {t.cart.delivery}
                      </div>
                      <span className="text-fs-graphite font-medium">₸{DELIVERY_FEE.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-fs-border flex items-center justify-between">
                      <span className="text-[15px] font-bold text-fs-graphite">{t.cart.total}</span>
                      <span className="text-[22px] font-black text-fs-graphite">
                        ₸{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ERROR */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[13px] text-red-400 mt-4 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* SUBMIT */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={submitting || items.length === 0}
                    whileHover={!submitting && items.length > 0 ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!submitting && items.length > 0 ? { scale: 0.98 } : {}}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    className="
                      w-full mt-5 flex items-center justify-center gap-3
                      py-4 px-6 rounded-2xl
                      bg-gradient-to-r from-fs-primary to-[#007A5A]
                      text-white text-[15px] font-bold
                      shadow-[0_4px_20px_rgba(0,91,70,0.35)]
                      disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                      transition-opacity duration-200
                    "
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        {t.checkout.submitting}
                      </>
                    ) : (
                      <>
                        {t.checkout.pay}
                        <ArrowRight size={16} strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>

                  {/* DELIVERY INFO */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-fs-gray">
                    <Truck size={13} strokeWidth={1.5} />
                    <span>{t.checkout.deliveryNote}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY CHECKOUT BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[998] bg-white/95 backdrop-blur-md border-t border-fs-border shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 76px, 80px)" }}>
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm text-fs-gray">{t.cart.total}</span>
            <span className="text-xl font-black text-fs-graphite">₸{total.toLocaleString()}</span>
          </div>
          <motion.button
            onClick={handleSubmit}
            disabled={submitting || items.length === 0}
            whileTap={!submitting && items.length > 0 ? { scale: 0.98 } : {}}
            className="
              w-full flex items-center justify-center gap-2
              py-4 rounded-2xl
              bg-gradient-to-r from-fs-primary to-[#007A5A]
              text-white text-[15px] font-bold
              shadow-[0_4px_20px_rgba(0,91,70,0.35)]
              disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
              transition-opacity duration-200
            "
          >
            {submitting ? t.checkout.submitting : t.checkout.pay}
          </motion.button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
