/**
 * Simple client-side cache utility with stale-while-revalidate support
 */

const CACHE_PREFIX = 'bento_cache_'
const CACHE_TIMESTAMP_PREFIX = 'bento_cache_ts_'

interface CacheOptions {
  maxAge?: number // Maximum age in milliseconds before data is considered stale, default 1 minute
}

/**
 * Set cache with timestamp
 */
export function setCache(key: string, data: any, options: CacheOptions = {}) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data))
    localStorage.setItem(`${CACHE_TIMESTAMP_PREFIX}${key}`, Date.now().toString())
  } catch (error) {
    console.warn('Failed to set cache:', error)
  }
}

/**
 * Get cache (even if stale) - for stale-while-revalidate pattern
 */
export function getCache<T>(key: string, options: CacheOptions = {}): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    return JSON.parse(cached) as T
  } catch (error) {
    console.warn('Failed to get cache:', error)
    return null
  }
}

/**
 * Check if cache is stale
 */
export function isCacheStale(key: string, maxAge?: number): boolean {
  const maxAgeMs = maxAge || 60 * 1000 // Default 1 minute
  try {
    const timestampStr = localStorage.getItem(`${CACHE_TIMESTAMP_PREFIX}${key}`)
    if (!timestampStr) return true

    const timestamp = parseInt(timestampStr, 10)
    return Date.now() - timestamp > maxAgeMs
  } catch (error) {
    return true
  }
}

/**
 * Compare two objects for deep equality (simple implementation)
 */
export function isDataChanged<T>(oldData: T, newData: T): boolean {
  return JSON.stringify(oldData) !== JSON.stringify(newData)
}

export function clearCache(key: string) {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`)
    localStorage.removeItem(`${CACHE_TIMESTAMP_PREFIX}${key}`)
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

export function clearAllCache() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear all cache:', error)
  }
}

