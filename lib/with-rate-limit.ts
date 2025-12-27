import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, RateLimitOptions } from './rate-limit'

/**
 * Higher-order function to wrap API routes with rate limiting
 *
 * Usage:
 * export const POST = withRateLimit(
 *   async (request) => {
 *     // your handler code
 *   },
 *   { limit: 10, window: 60 }
 * )
 */
export function withRateLimit(
  handler: (request: Request, ...args: any[]) => Promise<Response>,
  options: RateLimitOptions
) {
  return async (request: Request, ...args: any[]) => {
    const identifier = getClientIp(request)
    const result = rateLimit(identifier, options)

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    }

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: result.reset,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString(),
          },
        }
      )
    }

    // Execute handler and add rate limit headers to response
    const response = await handler(request, ...args)

    // Clone response to add headers
    const clonedResponse = new Response(response.body, response)
    Object.entries(headers).forEach(([key, value]) => {
      clonedResponse.headers.set(key, value)
    })

    return clonedResponse
  }
}
