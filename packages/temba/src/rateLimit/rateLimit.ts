import type { RateLimitConfig } from '../config'

type WindowEntry = {
  count: number
  resetAt: number
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number }

export type RateLimiter = {
  check: (ip: string) => RateLimitResult
  stop: () => void
}

export const createRateLimiter = (config: RateLimitConfig): RateLimiter => {
  const windows = new Map<string, WindowEntry>()

  const timer = setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of windows) {
      if (now >= entry.resetAt) windows.delete(ip)
    }
  }, config.windowMs).unref()

  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    clearInterval(timer)
  }

  const check = (ip: string): RateLimitResult => {
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

  return { check, stop }
}
