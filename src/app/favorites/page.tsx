"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ShoppingCart, Trash2, ArrowLeft, SlidersHorizontal } from "lucide-react"

import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/cards/ProductCard"
import FadeIn from "@/components/ui/FadeIn"
import PageHero from "@/components/ui/PageHero"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useLang } from "@/locales"

type SortKey = "added" | "price_asc" | "price_desc" | "name"

export default function FavoritesPage() {
  const products = useFavoritesStore((state) => state.products)
  const toggle   = useFavoritesStore((state) => state.toggle)
  const addItem  = useCartStore((state) => state.addItem)
  const openCart = useCartUI((state) => state.openCart)
  const { t }    = useLang()

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "added",      label: t.favorites.sortAdded     },
    { key: "price_asc",  label: t.favorites.sortPriceAsc  },
    { key: "price_desc", label: t.favorites.sortPriceDesc },
    { key: "name",       label: t.favorites.sortName      },
  ]

  const [sort, setSort] = useState<SortKey>("added")

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc")  return a.priceNum - b.priceNum
    if (sort === "price_desc") return b.priceNum - a.priceNum
    if (sort === "name")       return a.title.localeCompare(b.title, "ru")
    return 0 // added — original order
  })

  const handleAddAll = () => {
    products.forEach((item) => {
      addItem({ id: item.id, title: item.title, price: item.priceNum, emoji: item.emoji })
    })
    openCart()
  }

  const handleClearAll = () => {
    products.forEach((item) => toggle(item))
  }

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <PageHero
        badge={t.favorites.badge}
        title={<>{t.favorites.title} {products.length > 0 ? `· ${products.length}` : ""}</>}
        subtitle={t.empty.favorites}
        stats={products.length > 0 ? [
          { value: String(products.length), label: t.favorites.itemsLabel },
          { value: `₸${products.reduce((s, p) => s + p.priceNum, 0).toLocaleString()}`, label: t.favorites.totalLabel },
        ] : undefined}
      />
      <CartDrawer />

      <div className="fs-container py-16">

        {/* ACTIONS BAR */}
        {products.length > 0 && (
          <FadeIn>
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-fs-border">
              <Link href="/catalog" className="flex items-center gap-2 text-label text-fs-gray hover:text-fs-primary transition-colors duration-200">
                <ArrowLeft size={14} strokeWidth={1.5} />{t.nav.catalog}
              </Link>
              <div className="flex items-center gap-3">
                <button onClick={handleClearAll} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-fs-border text-fs-gray text-caption hover:border-fs-subtle hover:text-fs-primary transition-all duration-200">
                  <Trash2 size={14} strokeWidth={1.5} />{t.catalog.filter.clear}
                </button>
                <button onClick={handleAddAll} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fs-primary text-white text-caption font-bold hover:bg-fs-soft transition-colors duration-200">
                  <ShoppingCart size={14} strokeWidth={2} />{t.product.addToCart}
                </button>
              </div>
            </div>
          </FadeIn>
        )}

        {/* EMPTY STATE */}
        <AnimatePresence mode="wait">
          {products.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="
                w-24 h-24 rounded-3xl
                bg-fs-offwhite border border-fs-border
                flex items-center justify-center mb-8
              ">
                <Heart size={36} strokeWidth={1} className="text-fs-subtle" />
              </div>
              <h2 className="text-heading text-fs-graphite mb-3">{t.empty.favorites}</h2>
              <p className="text-body text-fs-gray max-w-sm leading-relaxed">
                {t.empty.hint}
              </p>
              <Link href="/catalog">
                <button className="
                  mt-8 px-6 py-3 rounded-xl
                  bg-fs-primary text-white text-caption font-bold
                  hover:bg-fs-soft transition-colors duration-200
                ">
                  {t.cart.goToCatalog}
                </button>
              </Link>
            </motion.div>
          )}

          {/* GRID */}
          {products.length > 0 && (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* SORT BAR */}
              <div className="flex items-center gap-2 mt-8 mb-8 flex-wrap">
                <SlidersHorizontal size={14} strokeWidth={1.5} className="text-fs-subtle mr-1" />
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSort(opt.key)}
                    className={`
                      px-3.5 py-1.5 rounded-xl text-label transition-all duration-200
                      ${sort === opt.key
                        ? "bg-fs-primary text-white font-bold"
                        : "bg-fs-offwhite border border-fs-border text-fs-gray hover:text-fs-graphite hover:border-fs-subtle"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                <AnimatePresence>
                  {sorted.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* TOTAL */}
              <div className="mt-10 pt-8 border-t border-fs-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-caption text-fs-gray">
                  {products.length} {t.favorites.itemsLabel} {t.favorites.countIn}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-body text-fs-gray">
                    {t.favorites.totalLabel}: <span className="text-fs-primary font-black">
                      ₸{products.reduce((sum, p) => sum + p.priceNum, 0).toLocaleString()}
                    </span>
                  </p>
                  <button
                    onClick={handleAddAll}
                    className="
                      flex items-center gap-2 px-5 py-2.5 rounded-xl
                      bg-fs-primary text-white text-caption font-bold
                      hover:bg-fs-soft transition-colors duration-200
                    "
                  >
                    <ShoppingCart size={14} strokeWidth={2} />
                    {t.product.addToCart}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <Footer />
    </main>
  )
}
