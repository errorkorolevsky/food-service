"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ShoppingCart, Zap, Truck, Clock, Plus, Minus, Tag, Heart, Share2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { useLang } from "@/locales"
import { CATEGORY_COLORS_BY_NAME } from "@/data/categories"
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed"
import { syncFavoriteToggle } from "@/hooks/useFavoritesSync"
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
import type { Product } from "@/types"

export default function ProductClient({
  product,
  related,
}: {
  product: Product
  related: Product[]
}) {
  const router           = useRouter()
  const addItem          = useCartStore((state) => state.addItem)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const openCart         = useCartUI((state) => state.openCart)
  const showToast        = useToastStore((state) => state.show)
  const cartItem         = useCartStore((state) => state.items.find((i) => i.id === product.id))
  const quantity         = cartItem?.quantity ?? 0

  const toggle    = useFavoritesStore((state) => state.toggle)
  const isFav     = useFavoritesStore((state) => state.isFav)
  const favorited = isFav(product.id)

  const [imgError,       setImgError]       = useState(false)
  const [shareCopied,    setShareCopied]    = useState(false)
  const [showStickyBar,  setShowStickyBar]  = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = actionsRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { ref: imgRef, cursor } = useCursorAware<HTMLDivElement>()
  const { t, lang } = useLang()
  const { data: session } = useSession()

  type Review = { id: string; user_email: string; user_name: string | null; rating: number; text: string | null; created_at: string }
  const [reviews,          setReviews]          = useState<Review[]>([])
  const [reviewsLoading,   setReviewsLoading]   = useState(true)
  const [reviewStars,      setReviewStars]       = useState(5)
  const [reviewHover,      setReviewHover]       = useState(0)
  const [reviewText,       setReviewText]        = useState("")
  const [reviewSubmitting, setReviewSubmitting]  = useState(false)
  const [reviewDone,       setReviewDone]        = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?product_id=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReviews(data.reviews ?? [])
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReviewsLoading(false)
      })
      .catch(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReviewsLoading(false)
      })
  }, [product.id])

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const handleReviewSubmit = async () => {
    setReviewSubmitting(true)
    const res = await fetch("/api/reviews", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ product_id: product.id, rating: reviewStars, text: reviewText.trim() || undefined }),
    })
    if (res.ok) {
      const body = await res.json()
      setReviews((prev) => [body.review, ...prev.filter((r: Review) => r.user_email !== body.review.user_email)])
      setReviewDone(true)
      setReviewText("")
    }
    setReviewSubmitting(false)
  }

  const recentlyViewed = useRecentlyViewed({
    id:       product.id,
    title:    product.title,
    emoji:    product.emoji,
    price:    product.price,
    category: product.category,
    image:    product.image,
  })

  const meta = [
    { icon: Clock, label: t.product.delivery,  value: t.product.deliveryTime },
    { icon: Truck, label: t.product.freeFrom,  value: t.product.freeFromVal  },
    { icon: Zap,   label: t.product.aiLabel,   value: t.product.aiActive     },
  ]

  const handleAdd = () => {
    addItem({ id: product.id, title: product.title, price: product.priceNum, emoji: product.emoji, image: product.image })
    showToast(product.title, product.emoji)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (typeof navigator.share === "function") {
      await navigator.share({ title: product.title, text: product.description, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url).catch(() => {})
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const handleAI = () => {
    const q = t.product.aiQuery(product.title, product.category)
    router.push(`/ai?q=${encodeURIComponent(q)}`)
  }

  return (
    <main className="fs-page-bg text-fs-graphite min-h-screen">
      <Navbar />
      <CartDrawer />
      <CartButton />

      <div className="fs-container py-12">

        {/* BREADCRUMB */}
        <FadeIn>
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-caption text-fs-gray mb-10 flex-wrap">
            <Link href="/" className="hover:text-fs-primary transition-colors duration-150">{t.nav.home}</Link>
            <span className="text-fs-border">/</span>
            <Link href="/catalog" className="hover:text-fs-primary transition-colors duration-150">{t.catalog.title}</Link>
            {product.category && (
              <>
                <span className="text-fs-border">/</span>
                <Link
                  href={`/catalog?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-fs-primary transition-colors duration-150"
                  style={{ color: CATEGORY_COLORS_BY_NAME[product.category] ?? undefined }}
                >
                  {product.category}
                </Link>
              </>
            )}
            <span className="text-fs-border">/</span>
            <span className="text-fs-graphite font-medium truncate max-w-[180px]">{product.title}</span>
          </nav>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* IMAGE */}
          <FadeIn>
            <motion.div
              ref={imgRef}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="
                relative bg-fs-white border border-fs-border rounded-2xl
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
                <span className="text-body text-fs-gray">{t.product.per} {product.unit}</span>
              </div>

              {/* META */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {meta.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="
                      bg-fs-white border border-fs-border rounded-xl
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
              <div ref={actionsRef} className="flex flex-col sm:flex-row gap-4">
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
                      className="flex-1 flex items-center justify-between gap-4 bg-fs-white border border-fs-green rounded-xl px-5 py-3"
                    >
                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        aria-label={t.cart.decrease}
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
                        aria-label={t.cart.increase}
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
                  onClick={() => { toggle(product); syncFavoriteToggle(product, favorited) }}
                  aria-label={favorited ? t.product.removeFromFavorites : t.product.addToFavorites}
                  aria-pressed={favorited}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-xl
                    border flex items-center justify-center
                    transition-all duration-200
                    ${favorited
                      ? "bg-red-500/10 border-red-500/40 text-red-400"
                      : "bg-fs-white border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-primary"
                    }
                  `}
                >
                  <Heart size={20} strokeWidth={1.5} fill={favorited ? "currentColor" : "none"} />
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  aria-label={t.product.share}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-xl
                    border flex items-center justify-center
                    transition-all duration-200
                    ${shareCopied
                      ? "bg-fs-primary/10 border-fs-primary/40 text-fs-primary"
                      : "bg-fs-white border-fs-border text-fs-gray hover:border-fs-subtle hover:text-fs-primary"
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {shareCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="text-[10px] font-bold leading-none text-center"
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                      >
                        <Share2 size={18} strokeWidth={1.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
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
                    oldPriceNum={p.oldPriceNum}
                    discountPercent={p.discountPercent}
                    unit={p.unit}
                    rating={p.rating}
                    emoji={p.emoji}
                    image={p.image}
                    isNew={p.isNew}
                    isHit={p.isHit}
                    inStock={p.inStock}
                  />
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        <div className="mt-24">
          <FadeIn>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-label text-fs-gray uppercase tracking-widest mb-3">{t.product.reviews}</p>
                <h2 className="text-heading text-fs-graphite">{t.product.reviewsTitle}</h2>
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={13} fill={s <= Math.round(avgRating) ? "currentColor" : "none"} strokeWidth={1.5} className="text-amber-400" />
                    ))}
                  </div>
                  <span className="text-caption text-fs-gray">
                    {avgRating.toFixed(1)} · {t.product.reviewCount(reviews.length)}
                  </span>
                </div>
              )}
            </div>
          </FadeIn>

          {/* SUBMIT FORM — logged-in users */}
          {session?.user && !reviewDone && (
            <FadeIn>
              <div className="bg-fs-white border border-fs-border rounded-2xl p-6 mb-8">
                <p className="text-caption font-bold text-fs-graphite mb-4">{t.product.reviewSubmit}</p>
                <div className="flex gap-1.5 mb-4">
                  {[1,2,3,4,5].map((s) => (
                    <motion.button
                      key={s}
                      onClick={() => setReviewStars(s)}
                      onMouseEnter={() => setReviewHover(s)}
                      onMouseLeave={() => setReviewHover(0)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.1 }}
                      aria-label={`${s}`}
                    >
                      <Star
                        size={22}
                        fill={s <= (reviewHover || reviewStars) ? "currentColor" : "none"}
                        strokeWidth={1.5}
                        className="text-amber-400"
                      />
                    </motion.button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t.product.reviewPlaceholder}
                  maxLength={500}
                  rows={3}
                  className="w-full bg-fs-offwhite border border-fs-border rounded-xl px-4 py-3 text-caption text-fs-graphite placeholder:text-fs-subtle resize-none focus:outline-none focus:border-fs-primary/40 transition-colors duration-200 mb-4"
                />
                <Button size="sm" onClick={handleReviewSubmit} disabled={reviewSubmitting}>
                  {reviewSubmitting ? "..." : t.product.reviewSubmit}
                </Button>
              </div>
            </FadeIn>
          )}

          {session?.user && reviewDone && (
            <FadeIn>
              <div className="bg-fs-offwhite border border-fs-border rounded-2xl px-6 py-4 mb-8 flex items-center gap-3">
                <span className="text-lg">✓</span>
                <p className="text-caption text-fs-gray">{t.product.reviewSuccess}</p>
              </div>
            </FadeIn>
          )}

          {!session?.user && (
            <FadeIn>
              <div className="bg-fs-offwhite border border-fs-border rounded-2xl px-6 py-4 mb-8">
                <Link href="/login" className="text-caption text-fs-primary hover:underline transition-colors duration-200">
                  {t.product.reviewLoginPrompt} →
                </Link>
              </div>
            </FadeIn>
          )}

          {/* LIST */}
          {reviewsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-20 bg-fs-offwhite border border-fs-border rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <FadeIn>
              <p className="text-caption text-fs-gray py-10 text-center">{t.product.reviewsEmpty}</p>
            </FadeIn>
          ) : (
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <FadeIn key={r.id} delay={0.05 * i}>
                  <div className="bg-fs-white border border-fs-border rounded-2xl px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-fs-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-fs-primary">
                            {(r.user_name ?? r.user_email)[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-caption font-bold text-fs-graphite">
                            {r.user_name ?? r.user_email.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-fs-gray">
                            {new Date(r.created_at).toLocaleDateString(lang === "kz" ? "kk-KZ" : "ru-RU")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={11} fill={s <= r.rating ? "currentColor" : "none"} strokeWidth={1.5} className="text-amber-400" />
                        ))}
                      </div>
                    </div>
                    {r.text && (
                      <p className="text-caption text-fs-gray leading-relaxed">{r.text}</p>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>

        {/* RECENTLY VIEWED */}
        {recentlyViewed.length > 0 && (
          <div className="mt-24">
            <FadeIn>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-label text-fs-gray uppercase tracking-widest mb-3">{t.product.recentlyViewed}</p>
                  <h2 className="text-heading text-fs-graphite">{t.product.recentlyViewedTitle}</h2>
                </div>
              </div>
            </FadeIn>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {recentlyViewed.map((item, i) => (
                <FadeIn key={item.id} delay={0.05 * i}>
                  <Link href={`/product/${item.id}`} className="flex-shrink-0 w-40 sm:w-48 group">
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                      className="bg-fs-white border border-fs-border rounded-2xl p-4 flex flex-col gap-3 hover:border-fs-subtle transition-colors duration-200"
                    >
                      {item.image ? (
                        <div className="w-full h-20 rounded-xl overflow-hidden bg-fs-offwhite">
                          <Image src={item.image} alt={item.title} width={192} height={80}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded-xl bg-fs-offwhite flex items-center justify-center text-3xl">
                          {item.emoji}
                        </div>
                      )}
                      <div>
                        <p className="text-[12px] font-semibold text-fs-graphite leading-tight line-clamp-2">{item.title}</p>
                        <p className="text-[13px] font-bold text-fs-primary mt-1">{item.price}</p>
                      </div>
                    </motion.div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />

      {/* STICKY BUY BAR — mobile only, appears when main CTA scrolls out of view */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            key="sticky-bar"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="fixed bottom-20 left-4 right-4 z-40 lg:hidden"
          >
            <div className="
              bg-white/95 dark:bg-[#1C2128]/95 backdrop-blur-xl
              border border-white/60 dark:border-white/10
              rounded-2xl px-4 py-3
              shadow-[0_8px_32px_rgba(0,0,0,0.14)]
              flex items-center gap-3
            ">
              <span className="text-2xl flex-shrink-0">{product.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-fs-graphite dark:text-white truncate leading-tight">
                  {product.title}
                </p>
                <p className="text-[12px] font-black text-fs-primary mt-0.5">{product.price}</p>
              </div>

              {quantity === 0 ? (
                <Button size="sm" onClick={handleAdd} className="flex-shrink-0">
                  <ShoppingCart size={15} strokeWidth={1.5} />
                  {t.product.addToCart}
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => decreaseQuantity(product.id)}
                    aria-label={t.cart.decrease}
                    className="w-8 h-8 rounded-lg bg-fs-offwhite border border-fs-border flex items-center justify-center text-fs-graphite"
                  >
                    <Minus size={14} strokeWidth={2} />
                  </button>
                  <span className="w-5 text-center text-[14px] font-black text-fs-graphite dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => increaseQuantity(product.id)}
                    aria-label={t.cart.increase}
                    className="w-8 h-8 rounded-lg bg-fs-primary text-white flex items-center justify-center"
                  >
                    <Plus size={14} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
