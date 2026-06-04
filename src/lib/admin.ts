/**
 * Single source of truth for the store-operator (admin) identity.
 *
 * Configurable via the ADMIN_EMAIL env var so the operator can be changed at
 * deploy time without touching code. Falls back to the founding owner's email
 * for existing deployments. All admin-gated API routes and the web admin panel
 * compare against this value.
 */
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "artemfi435@gmail.com").toLowerCase()

/** True when `email` is the configured store operator (case-insensitive). */
export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL
}
