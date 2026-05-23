"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { motion, useScroll, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

import Logo from "@/components/ui/Logo"
import CartButton from "@/components/layout/CartButton"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { MagneticDiv } from "@/components/ui/MagneticButton"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useLang } from "@/locales"

const NAV_KEYS = [
  { href: "/",          key: "home" as const,      showFavBadge: false },
  { href: "/catalog",   key: "catalog" as const,   showFavBadge: false },
  { href: "/ai",        key: "ai" as const,        showFavBadge: false },
  { href: "/favorites", key: "favorites" as const, showFavBadge: true  },
  { href: "/tracking",  key: "delivery" as const,  showFavBadge: false },
  { href: "/admin",     key: "admin" as const,     showFavBadge: false },
]

export default function Navbar() {
  const pathname          = usePathname()
  const { data: session } = useSession()
  const favCount          = useFavoritesStore((state) => state.ids.length)
  const [scrolled, setScrolled] = useState(false)
  const { lang, setLang, t }    = useLang()

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={`
      sticky top-0 z-50
      transition-all duration-500
      ${scrolled
        ? "bg-fs-dark/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.28)]"
        : "bg-gradient-to-b from-black/30 to-transparent border-b border-transparent backdrop-blur-none"
      }
    `}>
      {/* SCROLL PROGRESS BAR */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fs-primary via-fs-accent to-fs-soft origin-left z-50"
        style={{ scaleX }}
      />

      <div className="fs-container py-4 flex items-center justify-between">

        {/* LOGO */}
        <Logo />

        {/* NAV */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_KEYS.map(({ href, key, showFavBadge }) => {
            const isActive = href === "/"
              ? pathname === "/"
              : pathname.startsWith(href)

            return (
              <MagneticDiv key={href} strength={0.22}>
                <Link
                  href={href}
                  className={`
                    relative px-4 py-2 rounded-lg text-caption font-medium
                    transition-all duration-200
                    ${isActive
                      ? "text-white"
                      : "text-white/60 hover:text-white/90"
                    }
                  `}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-lg bg-white/10 border border-white/[0.12]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{t.nav[key]}</span>
                  {showFavBadge && favCount > 0 && (
                    <span className="
                      absolute -top-1 -right-1 z-20
                      min-w-[16px] h-4 px-1
                      bg-fs-accent text-white
                      text-[9px] font-black leading-4
                      rounded-full flex items-center justify-center
                    ">
                      {favCount > 99 ? "99+" : favCount}
                    </span>
                  )}
                </Link>
              </MagneticDiv>
            )
          })}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">

          {/* LANGUAGE SWITCHER — animated active pill */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white/[0.06] border border-white/[0.10] rounded-lg p-0.5 relative">
            {(["ru", "kz"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="relative px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide transition-colors duration-150 z-10"
                style={{ color: lang === l ? "white" : "rgba(255,255,255,0.45)" }}
              >
                {lang === l && (
                  <motion.span
                    layoutId="lang-indicator"
                    className="absolute inset-0 rounded-md bg-white/[0.14]"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{t.language[l]}</span>
              </button>
            ))}
          </div>

          <ThemeToggle variant="navbar" />

          {session?.user ? (
            <Link href="/profile" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/50 transition-colors duration-200">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? ""}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-fs-primary flex items-center justify-center text-xs text-white font-bold">
                    {session.user.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
              </div>
              <span className="hidden xl:block text-caption text-white/60 group-hover:text-white transition-colors">
                {session.user.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/profile" })}
              className="
                px-4 py-2 rounded-lg
                text-caption font-medium
                text-white/70 border border-white/[0.12] bg-white/[0.06]
                hover:text-white hover:bg-white/[0.12] hover:border-white/20
                transition-all duration-200
              "
            >
              {t.nav.login}
            </button>
          )}

          <CartButton variant="navbar" />
        </div>
      </div>
    </header>
  )
}
