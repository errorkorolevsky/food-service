"use client"

import { useState, useMemo, useTransition, useEffect, useRef, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

import SearchBar from "@/components/ui/SearchBar"
import FadeIn from "@/components/ui/FadeIn"
import ProductCard from "@/components/cards/ProductCard"
import { useLang } from "@/locales"
import type { Translations } from "@/locales/ru"

import { products } from "@/data/products"
import { plural } from "@/lib/utils"
import type { ProductCategory } from "@/types"

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const ALL       = "Все"
const PAGE_SIZE = 12

const CATEGORIES: (ProductCategory | typeof ALL)[] = [
  ALL,
  "Рыба и морепродукты",
  "Суши ингредиенты",
  "Пицца и итальянское",
  "Кондитерское",
  "Кофе и бар",
  "Сыры и молочное",
  "Птица и мясо",
  "Заморозка",
  "Соусы и специи",
  "Бакалея",
  "Овощи и фрукты",
  "Напитки",
  "Выпечка и снеки",
  "Упаковка HoReCa",
  "Наборы",
]

type SortKey = "default" | "price_asc" | "price_desc" | "rating"

// ─── SKELETON CARD ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-fs-border rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="h-48 skeleton-green border-b border-fs-border" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between">
          <div className="h-3 w-20 skeleton-green rounded-pill" />
          <div className="h-3 w-10 skeleton-green rounded-pill" />
        </div>
        <div className="h-5 w-3/4 skeleton-green rounded-lg" />
        <div className="h-3 w-full skeleton-green rounded-lg" />
        <div className="h-3 w-2/3 skeleton-green rounded-lg" />
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-fs-border">
          <div className="h-6 w-20 skeleton-green rounded-lg" />
          <div className="h-9 w-9 skeleton-green rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// ─── FILTER CHIPS (horizontal scroll) ───────────────────────────────────────

function FilterChips({
  categories,
  active,
  onSelect,
  labels,
}: {
  categories: string[]
  active: string
  onSelect: (cat: string) => void
  labels: Record<string, string>
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 8)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    el?.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el?.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [])

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const idx  = categories.indexOf(active)
    const chip = el.children[idx] as HTMLElement | undefined
    chip?.scrollIntoView({ inline: "nearest", behavior: "smooth", block: "nearest" })
  }, [active, categories])

  return (
    <div className="relative flex items-center">
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            onClick={() => scrollBy(-1)}
            className="absolute left-0 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-fs-border shadow-md text-fs-gray hover:text-fs-primary transition-colors"
          >
            <ChevronLeft size={14} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-none px-1 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((cat) => {
          const isActive = cat === active
          const display  = labels[cat] ?? cat
          return (
            <motion.button
              key={cat}
              onClick={() => onSelect(cat)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium
                border transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? "bg-fs-primary text-white border-fs-primary shadow-[0_0_0_4px_rgba(0,91,70,0.12)]"
                  : "bg-white text-fs-gray border-fs-border hover:border-fs-primary/40 hover:text-fs-graphite hover:shadow-sm"
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="filter-active-bg"
                  className="absolute inset-0 rounded-full bg-fs-primary"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              {display}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            onClick={() => scrollBy(1)}
            className="absolute right-0 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-fs-border shadow-md text-fs-gray hover:text-fs-primary transition-colors"
          >
            <ChevronRight size={14} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── STICKY FILTER BAR ────────────────────────────────────────────────────────

function StickyFilterBar({
  categories,
  category,
  sort,
  sortOpen,
  onlyNew,
  onlyStock,
  onlyDiscount,
  hasFilters,
  onCategory,
  onSortOpen,
  onSort,
  onNew,
  onStock,
  onDiscount,
  onClear,
  currentSortLabel,
  labels,
  t,
}: {
  categories: string[]
  category: string
  sort: string
  sortOpen: boolean
  onlyNew: boolean
  onlyStock: boolean
  onlyDiscount: boolean
  hasFilters: boolean
  onCategory: (c: string) => void
  onSortOpen: () => void
  onSort: (v: SortKey) => void
  onNew: () => void
  onStock: () => void
  onDiscount: () => void
  onClear: () => void
  currentSortLabel: string
  labels: Record<string, string>
  t: Translations
}) {
  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "default",    label: t.catalog.sort.default    },
    { value: "price_asc",  label: t.catalog.sort.price_asc  },
    { value: "price_desc", label: t.catalog.sort.price_desc },
    { value: "rating",     label: t.catalog.sort.rating     },
  ]

  return (
    <div className="flex flex-col gap-3">
      {/* ROW 1: chips + sort */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <FilterChips categories={categories} active={category} onSelect={onCategory} labels={labels} />
        </div>

        {/* SORT DROPDOWN */}
        <div className="relative flex-shrink-0">
          <button
            onClick={onSortOpen}
            className="
              flex items-center gap-2
              px-4 py-2.5 rounded-xl
              bg-white border border-fs-border
              text-[13px] text-fs-slate font-medium
              hover:border-fs-primary/30 transition-all duration-200
              whitespace-nowrap shadow-sm
            "
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <span className="sm:hidden">{t.catalog.sort.label}</span>
            <ChevronDown
              size={13}
              strokeWidth={1.5}
              className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{ opacity: 0, y: 8,  scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute right-0 top-full mt-2 z-50
                  w-64 bg-white border border-fs-border
                  rounded-xl overflow-hidden shadow-lg
                "
              >
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSort(opt.value)}
                    className={`
                      w-full text-left px-5 py-3.5
                      text-[13px] transition-colors duration-150
                      ${sort === opt.value
                        ? "text-fs-primary bg-fs-light font-semibold"
                        : "text-fs-gray hover:text-fs-graphite hover:bg-fs-offwhite"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ROW 2: toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onDiscount}
          className={`
            px-4 py-1.5 rounded-full text-[13px] font-medium
            border transition-all duration-200
            ${onlyDiscount
              ? "bg-red-50 text-red-600 border-red-300 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
              : "bg-white text-fs-gray border-fs-border hover:border-red-300/50 hover:text-red-600"
            }
          `}
        >
          {t.catalog.filter.sale}
        </button>

        <button
          onClick={onNew}
          className={`
            px-4 py-1.5 rounded-full text-[13px] font-medium
            border transition-all duration-200
            ${onlyNew
              ? "bg-amber-50 text-amber-700 border-amber-300 shadow-[0_0_0_3px_rgba(217,119,6,0.1)]"
              : "bg-white text-fs-gray border-fs-border hover:border-amber-300/50 hover:text-amber-700"
            }
          `}
        >
          {t.catalog.filter.new}
        </button>

        <button
          onClick={onStock}
          className={`
            px-4 py-1.5 rounded-full text-[13px] font-medium
            border transition-all duration-200
            ${onlyStock
              ? "bg-fs-primary/8 text-fs-primary border-fs-primary/30 shadow-[0_0_0_3px_rgba(0,91,70,0.08)]"
              : "bg-white text-fs-gray border-fs-border hover:border-fs-primary/30 hover:text-fs-primary"
            }
          `}
        >
          {t.catalog.filter.inStock}
        </button>

        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={onClear}
              className="
                flex items-center gap-1.5
                px-4 py-1.5 rounded-full text-[13px]
                text-fs-gray hover:text-red-400
                border border-fs-border hover:border-red-300/50
                transition-all duration-200 bg-white
              "
            >
              <X size={12} strokeWidth={2.5} />
              {t.catalog.filter.clear}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── INNER (нужен Suspense из-за useSearchParams) ────────────────────────────

function CatalogInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const { t }        = useLang()

  const [isPending, startTransition] = useTransition()

  const initialCategory = (() => {
    const param = searchParams.get("category")
    return CATEGORIES.includes(param as ProductCategory) ? (param as ProductCategory) : ALL
  })()
  const initialSearch = searchParams.get("search") ?? ""

  const [search,       setSearch]       = useState(initialSearch)
  const [category,     setCategory]     = useState<ProductCategory | typeof ALL>(initialCategory)
  const [sort,         setSort]         = useState<SortKey>("default")
  const [sortOpen,     setSortOpen]     = useState(false)
  const [onlyNew,      setOnlyNew]      = useState(false)
  const [onlyStock,    setOnlyStock]    = useState(false)
  const [onlyDiscount, setOnlyDiscount] = useState(() => searchParams.get("sale") === "true")
  const [page,         setPage]         = useState(1)

  useEffect(() => {
    const catParam    = searchParams.get("category")
    const searchParam = searchParams.get("search") ?? ""
    const saleParam   = searchParams.get("sale") === "true"
    const next = CATEGORIES.includes(catParam as ProductCategory) ? (catParam as ProductCategory) : ALL
    startTransition(() => {
      setCategory(next)
      if (searchParam) setSearch(searchParam)
      if (saleParam) setOnlyDiscount(true)
    })
  }, [searchParams])

  const handleDiscount = () => { setOnlyDiscount((p) => !p); setPage(1) }

  const handleCategory = (cat: ProductCategory | typeof ALL) => {
    startTransition(() => {
      setCategory(cat)
      setPage(1)
      const params = new URLSearchParams(searchParams.toString())
      if (cat === ALL) {
        params.delete("category")
      } else {
        params.set("category", cat)
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleSort   = (v: SortKey) => { setSort(v); setPage(1); setSortOpen(false) }
  const handleNew    = () => { setOnlyNew((p) => !p); setPage(1) }
  const handleStock  = () => { setOnlyStock((p) => !p); setPage(1) }

  const filtered = useMemo(() => {
    let list = [...products]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (category !== ALL)
      list = list.filter((p) => p.category === category)

    if (onlyNew)      list = list.filter((p) => p.isNew)
    if (onlyStock)    list = list.filter((p) => p.inStock)
    if (onlyDiscount) list = list.filter((p) => !!p.discountPercent)

    switch (sort) {
      case "price_asc":  list.sort((a, b) => a.priceNum - b.priceNum);              break
      case "price_desc": list.sort((a, b) => b.priceNum - a.priceNum);              break
      case "rating":     list.sort((a, b) => Number(b.rating) - Number(a.rating));  break
    }

    return list
  }, [search, category, sort, onlyNew, onlyStock, onlyDiscount])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = paginated.length < filtered.length
  const hasFilters = category !== ALL || onlyNew || onlyStock || onlyDiscount || sort !== "default"

  const clearFilters = () => {
    setSearch("")
    setOnlyNew(false)
    setOnlyStock(false)
    setOnlyDiscount(false)
    setSort("default")
    setPage(1)
    handleCategory(ALL)
  }

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: "default",    label: t.catalog.sort.default    },
    { value: "price_asc",  label: t.catalog.sort.price_asc  },
    { value: "price_desc", label: t.catalog.sort.price_desc },
    { value: "rating",     label: t.catalog.sort.rating     },
  ]
  const currentSortLabel = sortOptions.find((o) => o.value === sort)?.label ?? t.catalog.sort.default

  const countLabel = plural(filtered.length, [t.catalog.count_one, t.catalog.count_few, t.catalog.count_many])

  return (
    <section className="fs-section">
      <div className="fs-container py-8 sm:py-14 lg:py-20">

        {/* HEADER */}
        <FadeIn>
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div>
              <p className="text-label text-fs-gray uppercase tracking-widest mb-3">
                {t.catalog.subtitle}
              </p>
              <h2 className="text-heading text-fs-graphite">
                {t.catalog.title}
              </h2>
            </div>

            <p className="text-caption text-fs-gray">
              {filtered.length} {countLabel}
            </p>
          </div>
        </FadeIn>

        {/* SEARCH BAR */}
        <FadeIn delay={0.08}>
          <SearchBar value={search} onChange={handleSearch} />
        </FadeIn>

        {/* STICKY FILTER BAR */}
        <div className="sticky top-[72px] z-30 mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
          <motion.div
            className="
              bg-white/90 backdrop-blur-xl
              border-b border-fs-border/60
              py-3
            "
          >
            <StickyFilterBar
              categories={CATEGORIES}
              category={category}
              sort={sort}
              sortOpen={sortOpen}
              onlyNew={onlyNew}
              onlyStock={onlyStock}
              onlyDiscount={onlyDiscount}
              hasFilters={hasFilters}
              onCategory={handleCategory}
              onSortOpen={() => setSortOpen((v) => !v)}
              onSort={handleSort}
              onNew={handleNew}
              onStock={handleStock}
              onDiscount={handleDiscount}
              onClear={clearFilters}
              currentSortLabel={currentSortLabel}
              labels={t.categories.labels}
              t={t}
            />
          </motion.div>
        </div>

        {/* GRID */}
        <div className="mt-6 sm:mt-10">
          <AnimatePresence mode="wait">

            {isPending ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </motion.div>
            ) : filtered.length > 0 ? (
              <motion.div
                key={`grid-${category}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                  {paginated.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      category={product.category}
                      title={product.title}
                      description={product.description}
                      price={product.price}
                      priceNum={product.priceNum}
                      oldPriceNum={product.oldPriceNum}
                      discountPercent={product.discountPercent}
                      unit={product.unit}
                      rating={product.rating}
                      emoji={product.emoji}
                      image={product.image}
                      isNew={product.isNew}
                      isHit={product.isHit}
                      inStock={product.inStock}
                    />
                  ))}
                </div>

                {/* LOAD MORE / COLLAPSE */}
                <div className="flex items-center justify-center gap-4 mt-10">
                  {hasMore ? (
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="
                        flex items-center gap-2
                        px-8 py-3.5 rounded-xl
                        border border-fs-border text-caption text-fs-slate font-medium
                        bg-white shadow-sm
                        hover:border-fs-primary/30 hover:text-fs-primary
                        transition-all duration-200
                      "
                    >
                      <ChevronDown size={16} strokeWidth={1.5} />
                      {t.catalog.loadMore} ({filtered.length - paginated.length})
                    </button>
                  ) : page > 1 ? (
                    <button
                      onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                      className="
                        flex items-center gap-2
                        px-6 py-3 rounded-xl
                        text-caption text-fs-subtle
                        hover:text-fs-gray
                        transition-colors duration-200
                      "
                    >
                      <ChevronUp size={14} strokeWidth={1.5} />
                      {t.catalog.collapse}
                    </button>
                  ) : null}

                  {filtered.length > PAGE_SIZE && (
                    <p className="text-label text-fs-subtle">
                      {paginated.length} {t.catalog.of} {filtered.length}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-32"
              >
                <div className="
                  w-16 h-16 rounded-2xl
                  bg-fs-light border border-fs-border
                  flex items-center justify-center
                  text-3xl mx-auto mb-6
                ">
                  🔍
                </div>

                <h3 className="text-heading text-fs-graphite">
                  {t.empty.search}
                </h3>

                <p className="text-body text-fs-gray mt-4">
                  {t.empty.hint}
                </p>

                <button
                  onClick={clearFilters}
                  className="
                    mt-8 px-6 py-3 rounded-xl
                    border border-fs-border text-fs-slate text-caption font-medium bg-white
                    hover:border-fs-primary/30 hover:text-fs-primary
                    transition-all duration-200 shadow-sm
                  "
                >
                  {t.empty.clearFilters}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// ─── EXPORT (Suspense нужен для useSearchParams в Next.js) ───────────────────

export default function CatalogSection() {
  return (
    <Suspense fallback={
      <section className="fs-section">
        <div className="fs-container py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    }>
      <CatalogInner />
    </Suspense>
  )
}
