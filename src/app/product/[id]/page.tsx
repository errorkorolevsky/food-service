"use client"

import { useState } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Star, ShoppingCart, Zap, Truck, Clock, Plus, Minus, Tag, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { products } from "@/data/products"
import { useLang } from "@/locales"
import { useCartStore } from "@/store/cartStore"
import { useCartUI } from "@/store/cartUIStore"
import { useToastStore } from "@/store/toastStore"
import { useFavoritesStore } from "@/store/favoritesStore"
import { useCursorAware } from "@/hooks/useCursorAware"
import Navbar from "@/components/layout/Navbar"
import CartDrawer from "@/components/layout/CartDrawer"
import CartButton from "@/components/layout/CartButton"
import Footer from "@/components/layout/Footer"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import FadeIn from "@/components/ui/FadeIn"
import MorphNumber from "@/components/ui/MorphNumber"
import ProductCard from "@/components/cards/ProductCard"

export default function ProductPage() {
  const params   = useParams()
  const router   = useRouter()
  const addItem          = useCartStore((state) => state.addItem)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const openCart         = useCartUI((state) => state.openCart)
  const showToast        = useToastStore((state) => state.show)
  const productId        = params.id as string
  const cartItem         = useCartStore((state) => state.items.find((i) => i.id === productId))
  const quantity         = cartItem?.quantity ?? 0

  const toggle    = useFavoritesStore((state) => state.toggle)
  const isFav     = useFavoritesStore((state) => state.isFav)
  const favorited = isFav(productId)

  const [imgError, setImgError] = useState(false)

  const { ref: imgRef, cursor } = useCursorAware<HTMLDivElement>()
  const { t } = useLang()

  const meta = [
    { icon: Clock, label: t.product.delivery,  value: t.product.deliveryTime },
    { icon: Truck, label: t.product.freeFrom,  value: t.product.freeFromVal  },
    { icon: Zap,   label: t.product.aiLabel,   value: t.product.aiActive     },
  ]

  const product = products.find((p) => p.id === productId)
  if (!product) notFound()

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAdd = () => {
    addItem({ id: product.id, title: product.title, price: product.priceNum, emoji: product.emoji, image: product.image })
    showToast(product.title, product.emoji)
  }

  const handleAI = () => {
    const q = `Расскажи подробнее о ${product.title} (${product.category}). Как использовать, с чем сочетается и сколько нужно для семьи?`
    router.push(`/ai?q=${encodeURIComponent(q)}`)
  }

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />
      <CartButton />

      <div className="fs-container py-12">

        {/* BACK */}
        <FadeIn>
          <Link
            href="/catalog"
            className="
              inline-flex items-center gap-2
              text-caption text-fs-gray
              hover:text-fs-primary
              transition-colors duration-200
              mb-10
            "
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            {t.catalog.title}
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* IMAGE */}
          <FadeIn>
            <motion.div
              ref={imgRef}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="
                relative bg-white border border-fs-border rounded-2xl
                flex items-center justify-center
                min-h-[280px] sm:min-h-[380px] lg:min-h-[560px]
                overflow-hidden
              "
              style={{
                boxShadow: cursor.active
                  ? `0 0 0 1px rgba(0,91,70,${0.08 + (1 - cursor.dist) * 0.18}), 0 8px 40px rgba(0,91,70,${0.04 + (1 - cursor.dist) * 0.10})`
                  : undefined,
              }}
            >
              {/* CURSOR-AWARE LIGHT */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-200"
                style={{
                  background: cursor.active
                    ? `radial-gradient(ellipse 70% 60% at ${cursor.x * 100}% ${cursor.y * 100}%, rgba(0,91,70,0.06) 0%, transparent 70%)`
                    : "none",
                }}
              />
              {product.image && !imgError ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    onError={() => setImgError(true)}
                  />
                </motion.div>
              ) : (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-[100px] sm:text-[140px] lg:text-[160px] leading-none select-none relative z-10"
                >
                  {product.emoji}
                </motion.span>
              )}
            </motion.div>
          </FadeIn>

          {/* INFO */}
          <FadeIn delay={0.15}>
            <div className="space-y-7">

              {/* CATEGORY + BADGES */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge>{product.category}</Badge>
                {product.isNew     && <Badge variant="warning">{t.product.new}</Badge>}
                {product.isPopular && <Badge variant="success">{t.sections.popular}</Badge>}
                <div className="flex items-center gap-1.5 text-fs-amber">
                  <Star size={14} fill="currentColor" strokeWidth={0} />
                  <span className="text-caption font-bold text-fs-graphite">
                    {product.rating}
                  </span>
                </div>
              </div>

              {/* TITLE */}
              <h1 className="text-heading text-fs-graphite">
                {product.title}
              </h1>

              {/* DESCRIPTION */}
              <p className="text-body-lg text-fs-gray leading-relaxed">
                {product.description}
              </p>

              {/* TAGS */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={13} strokeWidth={1.5} className="text-fs-subtle flex-shrink-0" />
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/catalog?search=${encodeURIComponent(tag)}`}
                      className="
                        px-3 py-1 rounded-full
                        bg-fs-offwhite border border-fs-border
                        text-label text-fs-gray
                        hover:border-fs-subtle hover:text-fs-primary
                        transition-all duration-200
                      "
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* PRICE */}
              <div className="flex items-baseline gap-3">
                <MorphNumber
                  value={product.priceNum}
                  prefix="₸"
                  className="text-hero font-black text-fs-graphite"
                />
                <span className="text-body text-fs-gray">{t.product.per} ед.</span>
              </div>

              {/* META */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {meta.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="
                      bg-white border border-fs-border rounded-xl
                      p-2.5 sm:p-4 text-center
                    "
                  >
                    <Icon size={16} strokeWidth={1.5} className="text-fs-gray mx-auto mb-1 sm:mb-2" />
                    <p className="text-[9px] sm:text-label text-fs-gray uppercase tracking-wide sm:tracking-wider leading-tight">{label}</p>
                    <p className="text-[11px] sm:text-caption font-bold text-fs-graphite mt-0.5 sm:mt-1">{value}</p>
                  </div>
                ))}
              </div>

              {/* DIVIDER */}
              <div className="border-t border-fs-border" />

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatePresence mode="wait">
                  {quantity === 0 ? (
                    <motion.div
                      key="add"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1"
                    >
                      <Button size="lg" onClick={handleAdd} className="w-full">
                        <ShoppingCart size={18} strokeWidth={1.5} />
                        {t.product.addToCart}
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="qty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex items-center justify-between gap-4 bg-white border border-fs-green rounded-xl px-5 py-3"
                    >
                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="w-9 h-9 rounded-xl bg-fs-offwhite border border-fs-border flex items-center justify-center text-fs-graphite hover:bg-fs-border transition-colors"
                      >
                        <Minus size={16} strokeWidth={2} />
                      </button>

                      <div className="text-center">
                        <MorphNumber value={quantity} className="text-title font-black text-fs-graphite" />
                        <p className="text-label text-fs-gray">
                          <MorphNumber value={product.priceNum * quantity} prefix="₸" />
                        </p>
                      </div>

                      <button
                        onClick={() => increaseQuantity(product.id)}
                        className="w-9 h-9 rounded-xl bg-fs-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      >
                        <Plus size={16} strokeWidth={2} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="secondary" size="lg" onClick={handleAI}>
                  <Zap size={18} strokeWidth={1.5} />
                  AI
                </Button>

                <motion.button
                  onClick={() => toggle(product!)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-xl
                    border flex items-center justify-center
                    transition-all duration-200
                    ${favorited
                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                      : "bg-white border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-primary"
                    }
                  `}
                >
                  <Heart size={20} strokeWidth={1.5} fill={favorited ? "currentColor" : "none"} />
                </motion.button>

                {quantity > 0 && (
                  <Button size="lg" onClick={openCart}>
                    <ShoppingCart size={18} strokeWidth={1.5} />
                    {t.nav.cart}
                  </Button>
                )}
              </div>

              {/* DELIVERY NOTE */}
              <div className="
                bg-fs-offwhite border border-fs-border rounded-xl
                px-5 py-4
                flex items-center gap-4
              ">
                <span className="text-2xl">🛵</span>
                <div>
                  <p className="text-caption font-bold text-fs-graphite">
                    {t.product.delivery} {t.product.deliveryTime}
                  </p>
                  <p className="text-label text-fs-gray mt-0.5">
                    {t.topbar.city} · {t.cart.freeDelivery} {t.product.freeFrom} {t.product.freeFromVal}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="mt-24">
            <FadeIn>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-3">
                    {product.category}
                  </p>
                  <h2 className="text-heading text-fs-graphite">
                    {t.sections.popular}
                  </h2>
                </div>
                <Link
                  href={`/catalog?category=${encodeURIComponent(product.category)}`}
                  className="text-caption text-fs-gray hover:text-fs-primary transition-colors duration-200"
                >
                  {t.categories.labels[product.category as keyof typeof t.categories.labels] ?? product.category} →
                </Link>
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              {related.map((p, i) => (
                <FadeIn key={p.id} delay={0.06 * i}>
                  <ProductCard
                    id={p.id}
                    category={p.category}
                    title={p.title}
                    description={p.description}
                    price={p.price}
                    priceNum={p.priceNum}
                    rating={p.rating}
                    emoji={p.emoji}
                    image={p.image}
                    isNew={p.isNew}
                    inStock={p.inStock}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
