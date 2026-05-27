"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ArrowRight, Clock, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useLang } from "@/locales"

// Shared with CatalogSection
const HISTORY_KEY = "fs-search-history"

type SearchProduct = {
  id:        string
  emoji:     string
  image?:    string
  title:     string
  price:     string
  price_num: number
  category:  string
}

export default function GlobalSearch() {
  const { t } = useLang()
  const router = useRouter()

  const [open,    setOpen]    = useState(false)
  const [query,   setQuery]   = useState("")
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])

  const inputRef  = useRef<HTMLInputElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load history from localStorage when overlay opens
  useEffect(() => {
    if (!open) return
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]")
      setHistory(Array.isArray(h) ? h.slice(0, 8) : [])
    } catch { setHistory([]) }
  }, [open])

  // Focus input + reset state on open/close
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    } else {
      setQuery("")
      setResults([])
      setLoading(false)
    }
  }, [open])

  // Escape key closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Debounced product search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) { setResults([]); return }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
        if (res.ok) setResults(await res.json())
      } catch { /* silent */ } finally {
        setLoading(false)
      }
    }, 220)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  const saveHistory = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const next = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 8)
    setHistory(next)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  }

  const navigateToSearch = (term: string) => {
    saveHistory(term)
    setOpen(false)
    router.push(`/catalog?search=${encodeURIComponent(term)}`)
  }

  const navigateToProduct = (productId: string) => {
    saveHistory(query)
    setOpen(false)
    router.push(`/product/${productId}`)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
  }

  const trendingTerms = t.catalog.searchTrendingTerms as string[]
  const showResults   = query.length >= 2
  const showEmpty     = !showResults && (history.length > 0 || trendingTerms.length > 0)

  return (
    <>
      {/* SEARCH TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        aria-label={t.catalog.searchOpen}
        className="
          w-8 h-8 rounded-lg flex items-center justify-center
          text-white/60 hover:text-white hover:bg-white/[0.08]
          transition-all duration-150
        "
      >
        <Search size={18} strokeWidth={1.5} />
      </button>

      {/* OVERLAY */}
      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              key="gs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[60]"
            />

            {/* PANEL */}
            <motion.div
              key="gs-panel"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="
                fixed top-0 left-0 right-0 z-[61]
                bg-fs-white border-b border-fs-border
                shadow-[0_20px_60px_rgba(0,0,0,0.2)]
              "
            >
              {/* INPUT ROW */}
              <div className="fs-container py-4 flex items-center gap-4">
                <motion.div
                  animate={{ color: "#005B46" }}
                  className="flex-shrink-0"
                >
                  <Search size={20} strokeWidth={1.5} />
                </motion.div>

                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && query.trim()) navigateToSearch(query.trim())
                  }}
                  placeholder={t.catalog.searchPlaceholder}
                  className="
                    flex-1 bg-transparent
                    text-[17px] text-fs-graphite placeholder:text-fs-gray
                    outline-none
                  "
                />

                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={t.close}
                    className="flex-shrink-0 text-fs-gray hover:text-fs-graphite transition-colors"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  aria-label={t.close}
                  className="flex-shrink-0 text-fs-gray hover:text-fs-graphite transition-colors ml-1"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* RESULTS AREA */}
              <div className="fs-container pb-5 max-h-[60vh] overflow-y-auto">

                {/* PRODUCT RESULTS */}
                {showResults && (
                  loading ? (
                    <div className="py-6 text-center text-[14px] text-fs-gray">...</div>
                  ) : results.length > 0 ? (
                    <div className="space-y-1">
                      {results.map((p, i) => (
                        <motion.button
                          key={p.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.12, delay: i * 0.03 }}
                          onClick={() => navigateToProduct(p.id)}
                          className="
                            w-full flex items-center gap-3
                            px-4 py-3 rounded-xl
                            hover:bg-fs-offwhite transition-colors duration-150
                            text-left
                          "
                        >
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.title}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-fs-offwhite"
                            />
                          ) : (
                            <span className="w-10 h-10 flex items-center justify-center text-2xl flex-shrink-0 bg-fs-offwhite rounded-xl">
                              {p.emoji}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-fs-graphite truncate">{p.title}</p>
                            <p className="text-[12px] text-fs-gray">{p.category}</p>
                          </div>
                          <span className="text-[14px] font-bold text-fs-primary flex-shrink-0">
                            {p.price ?? `₸${p.price_num.toLocaleString()}`}
                          </span>
                        </motion.button>
                      ))}

                      {/* GO TO CATALOG BUTTON */}
                      <button
                        onClick={() => navigateToSearch(query)}
                        className="
                          w-full flex items-center gap-3
                          px-4 py-3 mt-1 rounded-xl
                          text-fs-primary hover:bg-fs-light
                          transition-colors duration-150
                        "
                      >
                        <ArrowRight size={16} strokeWidth={2} className="flex-shrink-0" />
                        <span className="text-[13px] font-semibold">
                          {t.catalog.searchAll} «{query}»
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Search size={28} strokeWidth={1} className="text-fs-subtle mx-auto mb-3" />
                      <p className="text-[14px] text-fs-gray">{t.catalog.searchNoResults}</p>
                    </div>
                  )
                )}

                {/* HISTORY + TRENDING */}
                {showEmpty && (
                  <div className="space-y-5 pt-1">
                    {history.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-semibold text-fs-gray uppercase tracking-widest">
                            {t.catalog.searchRecent}
                          </span>
                          <button
                            onClick={clearHistory}
                            className="text-[11px] text-fs-subtle hover:text-red-400 transition-colors"
                          >
                            {t.catalog.searchClearHist}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {history.map((term) => (
                            <button
                              key={term}
                              onClick={() => navigateToSearch(term)}
                              className="
                                flex items-center gap-1.5
                                px-3 py-1.5 rounded-full
                                bg-fs-offwhite border border-fs-border
                                text-[12px] text-fs-gray
                                hover:border-fs-primary/40 hover:text-fs-primary
                                transition-all duration-150
                              "
                            >
                              <Clock size={11} strokeWidth={1.5} />
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[11px] font-semibold text-fs-gray uppercase tracking-widest mb-3">
                        {t.catalog.searchTrending}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trendingTerms.map((term, i) => (
                          <button
                            key={term}
                            onClick={() => navigateToSearch(term)}
                            className={`
                              flex items-center gap-1.5
                              px-3 py-1.5 rounded-full
                              text-[12px] border
                              hover:border-fs-primary/40 hover:text-fs-primary
                              transition-all duration-150
                              ${i < 3
                                ? "bg-fs-light border-fs-primary/20 text-fs-slate"
                                : "bg-fs-offwhite border-fs-border text-fs-gray"
                              }
                            `}
                          >
                            <TrendingUp
                              size={11}
                              strokeWidth={1.5}
                              className={i < 3 ? "text-fs-primary" : "text-fs-subtle"}
                            />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
