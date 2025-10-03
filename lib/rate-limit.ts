/**
 * Rate limiting utility for OTP requests
 * Prevents abuse by limiting OTP requests per phone number
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimit = new Map<string, RateLimitEntry>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (phone number)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 3,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  const now = Date.now()
  const key = `otp:${identifier}`
  
  if (rateLimit.has(key)) {
    const entry = rateLimit.get(key)!
    
    // Check if window has expired
    if (now >= entry.resetTime) {
      // Window expired, reset the counter
      rateLimit.delete(key)
    } else {
      // Window still active, check count
      if (entry.count >= maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime
        }
      }
    }
  }
  
  // Allow request - either new entry or under limit
  const resetTime = now + windowMs
  const currentEntry = rateLimit.get(key)
  
  if (currentEntry && now < currentEntry.resetTime) {
    // Increment existing counter
    currentEntry.count += 1
    rateLimit.set(key, currentEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - currentEntry.count,
      resetTime: currentEntry.resetTime
    }
  } else {
    // Create new entry
    rateLimit.set(key, { count: 1, resetTime })
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: resetTime
    }
  }
}

/**
 * Get remaining time until rate limit resets
 * @param resetTime - Reset time timestamp
 * @returns Formatted time string
 */
export function getResetTimeString(resetTime: number): string {
  const now = Date.now()
  const timeLeft = Math.ceil((resetTime - now) / (1000 * 60)) // minutes
  
  if (timeLeft <= 0) {
    return "now"
  } else if (timeLeft === 1) {
    return "1 minute"
  } else {
    return `${timeLeft} minutes`
  }
}

/**
 * Clear rate limit for a specific identifier (useful for testing)
 * @param identifier - Phone number to clear
 */
export function clearRateLimit(identifier: string): void {
  const key = `otp:${identifier}`
  rateLimit.delete(key)
}

/**
 * Get current rate limit status for debugging
 * @param identifier - Phone number to check
 * @returns Current rate limit entry or null
 */
export function getRateLimitStatus(identifier: string): RateLimitEntry | null {
  const key = `otp:${identifier}`
  return rateLimit.get(key) || null
}
