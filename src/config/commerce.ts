export const DELIVERY_FEE            = 1500
export const FREE_DELIVERY_THRESHOLD = 10_000

export const SUPPORT_PHONE    = "+77770000000"
export const SUPPORT_WHATSAPP = "77770000000"  // without + for wa.me link

export function calcDelivery(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
}
