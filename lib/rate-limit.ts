/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis
 */

type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of store.entries()) {
    if (now > value.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number

  /**
   * Time window in seconds
   */
  window: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limiter function
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param options - Rate limit options
 * @returns RateLimitResult
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowMs = options.window * 1000

  const record = store.get(key)

  if (!record || now > record.resetAt) {
    // Create new window
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })

    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: Math.floor(resetAt / 1000),
    }
  }

  if (record.count >= options.limit) {
    // Rate limit exceeded
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: Math.floor(record.resetAt / 1000),
    }
  }

  // Increment count
  record.count++
  store.set(key, record)

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: Math.floor(record.resetAt / 1000),
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Predefined rate limit presets
 */
export const RateLimitPresets = {
  // General API endpoints - 100 requests per minute
  api: { limit: 100, window: 60 },

  // Search endpoints - more permissive
  search: { limit: 100, window: 60 },

  // Expensive operations (recommendations) - stricter
  expensive: { limit: 20, window: 60 },

  // YouTube import - very strict (API quota protection)
  youtubeImport: { limit: 10, window: 3600 }, // 10 per hour

  // Admin operations - moderate
  admin: { limit: 30, window: 3600 }, // 30 per hour

  // Authentication - prevent brute force
  auth: { limit: 5, window: 300 }, // 5 per 5 minutes
}
