// In-memory token bucket rate limiter.
// For multi-instance deployments (Vercel, etc.), replace with Upstash Redis:
//   npm install @upstash/ratelimit @upstash/redis
//   import { Ratelimit } from '@upstash/ratelimit'
//   import { Redis } from '@upstash/redis'
//   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, '1 h') })

interface Bucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60 * 60 * 1000 // 1 hour

export interface RateLimitConfig {
  maxTokens: number
  windowMs?: number
}

export function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const windowMs = config.windowMs ?? WINDOW_MS
  let bucket = buckets.get(key)

  if (!bucket || now - bucket.lastRefill >= windowMs) {
    bucket = { tokens: config.maxTokens - 1, lastRefill: now }
    buckets.set(key, bucket)
    return { allowed: true, retryAfter: 0 }
  }

  if (bucket.tokens > 0) {
    bucket.tokens--
    return { allowed: true, retryAfter: 0 }
  }

  const retryAfter = Math.ceil((windowMs - (now - bucket.lastRefill)) / 1000)
  return { allowed: false, retryAfter }
}

// Periodic cleanup to prevent memory leaks (runs every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill >= WINDOW_MS * 2) {
        buckets.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}
