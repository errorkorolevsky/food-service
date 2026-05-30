"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import { useLang } from "@/locales"
import { useCartUI } from "@/store/cartUIStore"

const DISMISSED_KEY  = "fs-pwa-dismissed"
const DISMISS_DAYS   = 14

// Pages where a bottom banner would fight the purchase flow (sticky CTA / sheet)
const PURCHASE_PATHS = ["/product", "/checkout"]

type BeforeInstallPromptEvent = Event & {
  prompt:              () => Promise<void>
  userChoice:          Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible]               = useState(false)
  const { t }                               = useLang()
  const pathname                            = usePathname()
  const cartOpen                            = useCartUI((s) => s.isOpen)

  // Never compete with the purchase UI (product sticky CTA, checkout, open cart)
  const suppressed = cartOpen || PURCHASE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))

  useEffect(() => {
    // Don't show if recently dismissed
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 86_400_000) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
  }

  return (
    <AnimatePresence>
      {visible && !suppressed && (
        <motion.div
          key="pwa-prompt"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-[45]
                     bottom-[calc(env(safe-area-inset-bottom)+88px)] sm:bottom-6"
        >
          <div className="bg-fs-graphite border border-white/10 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-fs-primary flex items-center justify-center flex-shrink-0 text-white font-black text-base">
              FS
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-white leading-tight">{t.pwa.title}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{t.pwa.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                onClick={handleInstall}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fs-primary text-white text-[12px] font-bold hover:bg-fs-soft transition-colors"
              >
                <Download size={13} strokeWidth={2.5} />
                {t.pwa.install}
              </motion.button>

              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={t.close}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
