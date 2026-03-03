import type { RateLimitConfig } from '../config'

type WindowEntry = {
  count: number
  resetAt: number
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number }

export type RateLimiter = (ip: string) => RateLimitResult

export const createRateLimiter = (config: RateLimitConfig): RateLimiter => {
  const windows = new Map<string, WindowEntry>()

  return (ip: string): RateLimitResult => {
    const now = Date.now()
    const entry = windows.get(ip)

    if (!entry || now >= entry.resetAt) {
      windows.set(ip, { count: 1, resetAt: now + config.windowMs })
      return { allowed: true }
    }

    if (entry.count >= config.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    entry.count++
    return { allowed: true }
  }
}
