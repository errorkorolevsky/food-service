// In-memory store for magic link tokens (TTL = 15 min)
// Tokens are lost on server restart — users simply request a new link.

type TokenEntry = { email: string; expires: number }

const store = new Map<string, TokenEntry>()

export function createToken(email: string): string {
  const token   = crypto.randomUUID() + crypto.randomUUID()
  const expires = Date.now() + 15 * 60 * 1000
  store.set(token, { email, expires })
  return token
}

export function consumeToken(token: string): string | null {
  const entry = store.get(token)
  if (!entry) return null
  if (Date.now() > entry.expires) { store.delete(token); return null }
  store.delete(token)
  return entry.email
}
