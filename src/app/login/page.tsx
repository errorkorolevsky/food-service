"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ShieldCheck, Package, Sparkles, Mail, CheckCircle2, ArrowLeft } from "lucide-react"
import { signIn } from "next-auth/react"

import Navbar from "@/components/layout/Navbar"
import Badge from "@/components/ui/Badge"
import FadeIn from "@/components/ui/FadeIn"
import { useLang } from "@/locales"

const PERK_ICONS = [Package, ShieldCheck, Sparkles]

type View = "default" | "email" | "sent"

export default function LoginPage() {
  const { t }                         = useLang()
  const [view,    setView]    = useState<View>("default")
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleGoogle = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/profile" })
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) { setError(t.login.emailError); return }
    setLoading(true)
    setError("")
    try {
      const res  = await fetch("/api/auth/magic", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t.login.networkError); setLoading(false); return }
      setView("sent")
    } catch {
      setError(t.login.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />

      <div className="fs-container py-20">
        <div className="max-w-md mx-auto">
          <FadeIn>
            <div className="bg-fs-white border border-fs-border rounded-2xl p-10">

              <AnimatePresence mode="wait">

                {/* ── DEFAULT VIEW ─────────────────────────────────────────── */}
                {view === "default" && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-10">
                      <Badge variant="ai" dot className="mb-8">
                        {t.login.badge}
                      </Badge>
                      <h1 className="text-heading text-fs-graphite whitespace-pre-line">
                        {t.login.title}
                      </h1>
                      <p className="text-body text-fs-gray mt-4">
                        {t.login.subtitle}
                      </p>
                    </div>

                    <div className="space-y-3 mb-10">
                      {t.login.perks.map((text, i) => {
                        const Icon = PERK_ICONS[i]
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-fs-offwhite border border-fs-border flex items-center justify-center flex-shrink-0">
                              <Icon size={13} strokeWidth={1.5} className="text-fs-gray" />
                            </div>
                            <span className="text-caption text-fs-gray">{text}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* GOOGLE */}
                    <motion.button
                      onClick={handleGoogle}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="
                        w-full flex items-center justify-center gap-3
                        px-4 py-4 rounded-xl
                        bg-fs-primary text-white
                        text-body font-bold
                        hover:bg-fs-soft transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-wait
                        mb-3
                      "
                    >
                      {loading ? (
                        <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                      )}
                      {loading ? t.login.googleLoading : t.login.google}
                    </motion.button>

                    {/* EMAIL DIVIDER */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-fs-border" />
                      <span className="text-label text-fs-subtle">{t.login.orDivider}</span>
                      <div className="flex-1 h-px bg-fs-border" />
                    </div>

                    <button
                      onClick={() => setView("email")}
                      className="
                        w-full flex items-center justify-center gap-2
                        px-4 py-4 rounded-xl
                        border border-fs-border text-fs-gray text-body font-medium
                        hover:border-fs-subtle hover:text-fs-primary
                        transition-all duration-200
                      "
                    >
                      <Mail size={17} strokeWidth={1.5} />
                      {t.login.emailBtn}
                    </button>
                  </motion.div>
                )}

                {/* ── EMAIL VIEW ───────────────────────────────────────────── */}
                {view === "email" && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => { setView("default"); setError("") }}
                      className="flex items-center gap-1.5 text-label text-fs-gray hover:text-fs-primary transition-colors mb-8"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      {t.login.back}
                    </button>

                    <div className="mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-fs-offwhite border border-fs-border flex items-center justify-center mb-6">
                        <Mail size={20} strokeWidth={1.5} className="text-fs-gray" />
                      </div>
                      <h2 className="text-title font-black text-fs-graphite mb-2">{t.login.emailTitle}</h2>
                      <p className="text-caption text-fs-gray leading-relaxed">
                        {t.login.emailSubtitle}
                      </p>
                    </div>

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError("") }}
                          autoFocus
                          className={`
                            w-full px-4 py-4 rounded-xl
                            bg-fs-offwhite text-fs-graphite placeholder-fs-subtle
                            border transition-colors duration-200 outline-none text-body
                            ${error ? "border-red-500" : "border-fs-border focus:border-fs-subtle"}
                          `}
                        />
                        {error && (
                          <p className="text-label text-red-400 mt-2">{error}</p>
                        )}
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading || !email}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="
                          w-full flex items-center justify-center gap-2
                          px-4 py-4 rounded-xl
                          bg-fs-primary text-white text-body font-bold
                          hover:bg-fs-soft transition-colors duration-200
                          disabled:opacity-40 disabled:cursor-not-allowed
                        "
                      >
                        {loading ? (
                          <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                        ) : (
                          <Mail size={17} strokeWidth={2} />
                        )}
                        {loading ? t.login.emailSending : t.login.emailSend}
                      </motion.button>
                    </form>
                  </motion.div>
                )}

                {/* ── SENT VIEW ────────────────────────────────────────────── */}
                {view === "sent" && (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-fs-green/10 border border-fs-green/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 size={28} strokeWidth={1.5} className="text-fs-green" />
                    </motion.div>

                    <h2 className="text-title font-black text-fs-graphite mb-3">{t.login.sentTitle}</h2>
                    <p className="text-body text-fs-gray leading-relaxed mb-2">
                      {t.login.sentBody} <span className="text-fs-graphite font-medium">{email}</span>
                    </p>
                    <p className="text-caption text-fs-subtle">
                      {t.login.sentHint}
                    </p>

                    <button
                      onClick={() => { setView("email"); setLoading(false) }}
                      className="mt-8 text-label text-fs-gray hover:text-fs-primary transition-colors"
                    >
                      {t.login.sentResend}
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </FadeIn>
        </div>
      </div>
    </main>
  )
}
