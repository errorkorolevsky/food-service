import type { Product } from "@/types"

/** Minimal product shape used across the presentation showcase. */
export type PresProduct = Pick<
  Product,
  | "id"
  | "title"
  | "price"
  | "priceNum"
  | "oldPriceNum"
  | "discountPercent"
  | "image"
  | "emoji"
  | "category"
  | "rating"
  | "unit"
  | "description"
>
