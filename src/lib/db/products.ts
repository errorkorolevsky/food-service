/**
 * Server-side data access layer for products.
 * Fetches from Supabase with in-memory fallback to local products.ts.
 *
 * All functions are server-only (no "use client").
 * Results are cached via Next.js unstable_cache with tag "products".
 */

import { unstable_cache } from "next/cache"
import { createClient }   from "@supabase/supabase-js"
import { products as localProducts } from "@/data/products"
import type { Product } from "@/types"

// ─── SUPABASE ROW TYPE ────────────────────────────────────────────────────────

type ProductRow = {
  id:               string
  emoji:            string
  image:            string | null
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

// ─── ROW → PRODUCT ────────────────────────────────────────────────────────────

function rowToProduct(row: ProductRow): Product {
  return {
    id:               row.id,
    emoji:            row.emoji,
    image:            row.image            ?? undefined,
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
