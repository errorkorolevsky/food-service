/**
 * Server-side data access layer for products.
 * Fetches from Supabase with in-memory fallback to local products.ts.
 *
 * All functions are server-only (no "use client").
 * Results are cached via Next.js unstable_cache with tag "products".
 */

import { unstable_cache } from "next/cache"
import { createClient }   from "@supabase/supabase-js"
import * as fs   from "fs"
import * as path from "path"
import { products as localProducts } from "@/data/products"
import type { Product, ImageStatus } from "@/types"

// ─── SUPABASE ROW TYPE ────────────────────────────────────────────────────────

type ProductRow = {
  id:               string
  emoji:            string
  image:            string | null
  image_status:     string | null
  category:         string
  title:            string
  description:      string
  price:            string
  price_num:        number
  old_price_num:    number | null
  discount_percent: number | null
  unit:             string | null
  rating:           string
  in_stock:         boolean
  is_popular:       boolean
  is_new:           boolean
  is_hit:           boolean
  tags:             string[]
}

// ─── VALID PRODUCT IMAGES ────────────────────────────────────────────────────
// Reads the actual filesystem to build a set of files that exist on disk.
// This ensures Supabase rows with stale/invalid image paths never reach the UI.

function buildValidImageSet(): Set<string> {
  try {
    const dir = path.join(process.cwd(), "public", "products")
    return new Set(fs.readdirSync(dir).map((f) => `/products/${f}`))
  } catch {
    return new Set()
  }
}

const _validImageSet = buildValidImageSet()

export const VALID_PRODUCT_IMAGES = {
  has(p: string | null | undefined): boolean {
    if (!p) return false
    return _validImageSet.has(p)
  },
}

// ─── ROW → PRODUCT ────────────────────────────────────────────────────────────

function rowToProduct(row: ProductRow): Product {
  return {
    id:               row.id,
    emoji:            row.emoji,
    image:            row.image && VALID_PRODUCT_IMAGES.has(row.image) ? row.image : undefined,
    imageStatus:      (row.image_status as ImageStatus) ?? undefined,
    category:         row.category         as Product["category"],
    title:            row.title,
    description:      row.description,
    price:            row.price,
    priceNum:         row.price_num,
    oldPriceNum:      row.old_price_num    ?? undefined,
    discountPercent:  row.discount_percent ?? undefined,
    unit:             row.unit             ?? undefined,
    rating:           row.rating,
    inStock:          row.in_stock,
    isPopular:        row.is_popular,
    isNew:            row.is_new,
    isHit:            row.is_hit,
    tags:             row.tags,
  }
}

// ─── CLIENT (server-side, anon key is fine for public SELECT) ────────────────

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes("placeholder")) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// ─── FETCH ALL (with ISR cache) ───────────────────────────────────────────────

async function _fetchAllProducts(): Promise<Product[]> {
  const client = getServerClient()
  if (!client) return localProducts

  const { data, error } = await client
    .from("products")
    .select("*")
    .order("created_at", { ascending: true })

  if (error || !data?.length) {
    console.warn("[products] Supabase unavailable, using local fallback:", error?.message)
    return localProducts
  }

  return data.map(rowToProduct)
}

export const getAllProducts = unstable_cache(
  _fetchAllProducts,
  ["products-all"],
  { tags: ["products"], revalidate: 3600 },
)

// ─── FETCH BY ID ─────────────────────────────────────────────────────────────

async function _fetchProductById(id: string): Promise<Product | null> {
  const client = getServerClient()
  if (!client) return localProducts.find((p) => p.id === id) ?? null

  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return localProducts.find((p) => p.id === id) ?? null
  }

  return rowToProduct(data as ProductRow)
}

export const getProductById = unstable_cache(
  _fetchProductById,
  ["product-by-id"],
  { tags: ["products"], revalidate: 3600 },
)

// ─── FETCH RELATED ────────────────────────────────────────────────────────────

async function _fetchRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const client = getServerClient()
  if (!client) {
    return localProducts
      .filter((p) => p.category === category && p.id !== excludeId)
      .slice(0, limit)
  }

  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit)

  if (error || !data) {
    return localProducts
      .filter((p) => p.category === category && p.id !== excludeId)
      .slice(0, limit)
  }

  return data.map(rowToProduct)
}

export const getRelatedProducts = unstable_cache(
  _fetchRelatedProducts,
  ["products-related"],
  { tags: ["products"], revalidate: 3600 },
)

// ─── AI CATALOG STRING (for system prompt) ───────────────────────────────────

async function _fetchCatalogForAI(): Promise<string> {
  const client = getServerClient()
  const source = client ? await (async () => {
    const { data, error } = await client
      .from("products")
      .select("emoji,title,price,unit,category,in_stock,discount_percent")
      .eq("in_stock", true)
      .order("category")
    return error || !data?.length ? localProducts : data
  })() : localProducts

  const byCat: Record<string, { emoji: string; title: string; price: string; unit?: string | null; discount_percent?: number | null }[]> = {}
  for (const p of source) {
    const cat = (p as { category: string }).category
    if (!byCat[cat]) byCat[cat] = []
    byCat[cat].push({
      emoji:            (p as { emoji: string }).emoji,
      title:            (p as { title: string }).title,
      price:            "price" in p && typeof (p as { price: string }).price === "string"
                          ? (p as { price: string }).price
                          : `₸${(p as { priceNum: number }).priceNum?.toLocaleString("ru-RU")}`,
      unit:             (p as { unit?: string | null }).unit,
      discount_percent: (p as { discount_percent?: number | null }).discount_percent
                          ?? (p as { discountPercent?: number }).discountPercent,
    })
  }

  return Object.entries(byCat)
    .map(([cat, items]) => {
      const lines = items.map((i) => {
        const sale = i.discount_percent ? ` (скидка ${i.discount_percent}%)` : ""
        return `  - ${i.emoji} ${i.title} — ${i.price}${i.unit ? `/${i.unit}` : ""}${sale}`
      }).join("\n")
      return `${cat}:\n${lines}`
    })
    .join("\n\n")
}

export const getProductsCatalogForAI = unstable_cache(
  _fetchCatalogForAI,
  ["products-ai-catalog"],
  { tags: ["products"], revalidate: 3600 },
)

// ─── FETCH ALL IDS (for generateStaticParams) ─────────────────────────────────

async function _fetchAllProductIds(): Promise<string[]> {
  const client = getServerClient()
  if (!client) return localProducts.map((p) => p.id)

  const { data, error } = await client
    .from("products")
    .select("id")

  if (error || !data?.length) return localProducts.map((p) => p.id)

  return data.map((row: { id: string }) => row.id)
}

export const getAllProductIds = unstable_cache(
  _fetchAllProductIds,
  ["products-ids"],
  { tags: ["products"], revalidate: 3600 },
)
