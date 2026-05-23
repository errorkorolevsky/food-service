"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Grid3x3, Package, User, Heart } from "lucide-react"

import { useFavoritesStore } from "@/store/favoritesStore"
import { useLang } from "@/locales"

export default function MobileNav() {
  const pathname  = usePathname()
  const favCount  = useFavoritesStore((state) => state.ids.length)
  const { t, lang, setLang } = useLang()

  const links = [
    { href: "/",          icon: Home,     label: t.nav.home,      showFavBadge: false },
    { href: "/catalog",   icon: Grid3x3,  label: t.nav.catalog,   showFavBadge: false },
    { href: "/favorites", icon: Heart,    label: t.nav.favorites, showFavBadge: true  },
    { href: "/tracking",  icon: Package,  label: t.nav.delivery,  showFavBadge: false },
    { href: "/profile",   icon: User,     label: t.nav.profile,   showFavBadge: false },
  ]

  return (
    <nav
      className="fixed left-1/2 -translate-x-1/2 z-50 lg:hidden"
      style={{ bottom: "max(env(safe-area-inset-bottom, 0px) + 8px, 16px)" }}
    >
      {/* GLOW SHADOW */}
      <div
        className="absolute -inset-2 rounded-[40px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(0,91,70,0.18) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 32, delay: 0.15 }}
        className="
          relative
          bg-white/90 backdrop-blur-2xl
          border border-white/60
          rounded-[32px] px-2 py-2
          flex items-center gap-0
          shadow-[0_8px_32px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,0.6)_inset]
        "
      >
        {/* LANG SWITCHER */}
        <div className="flex items-center gap-0.5 pl-1 pr-1 border-r border-black/10 mr-0.5">
          {(["ru", "kz"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`
                px-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide
                transition-all duration-150
                ${lang === l ? "text-fs-primary" : "text-fs-muted hover:text-fs-gray"}
              `}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {links.map(({ href, icon: Icon, label, showFavBadge }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-[24px] min-w-[56px]"
            >
              {/* ACTIVE PILL BG */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute inset-0 rounded-[24px] bg-fs-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}

              {/* ICON */}
              <motion.div
                className="relative z-10"
                animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? "text-white" : "text-fs-gray"}
                />

                {/* FAVORITES BADGE */}
                {showFavBadge && favCount > 0 && !isActive && (
                  <AnimatePresence>
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="
                        absolute -top-1.5 -right-1.5
                        min-w-[14px] h-3.5 px-1
                        bg-fs-primary text-white
                        text-[9px] font-black leading-3.5
                        rounded-full flex items-center justify-center
                      "
                    >
                      {favCount > 99 ? "99+" : favCount}
                    </motion.span>
                  </AnimatePresence>
                )}
              </motion.div>

              {/* LABEL */}
              <motion.span
                className={`relative z-10 text-[9px] font-semibold leading-none tracking-wide ${isActive ? "text-white" : "text-fs-muted"}`}
                animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
              >
                {label}
              </motion.span>
            </Link>
          )
        })}
      </motion.div>
    </nav>
  )
}
