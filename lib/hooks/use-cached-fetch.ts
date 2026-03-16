import { useState, useEffect, useCallback, useRef } from 'react'

interface UseCachedFetchOptions<T> {
  cacheKey: string
  fetchFn: () => Promise<T>
  skipCache?: boolean
  onDataChange?: (data: T) => void
}

/**
 * Hook for data fetching with in-memory state.
 * Fetches on mount and when cacheKey changes.
 * No localStorage — data is always fresh from the server.
 */
export function useCachedFetch<T>({
  cacheKey,
  fetchFn,
  skipCache = false,
  onDataChange,
}: UseCachedFetchOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const fetchingRef = useRef(false)
  const fetchFnRef = useRef(fetchFn)
  const onDataChangeRef = useRef(onDataChange)

  // Keep refs updated
  useEffect(() => {
    fetchFnRef.current = fetchFn
    onDataChangeRef.current = onDataChange
  }, [fetchFn, onDataChange])

  const fetchFreshData = useCallback(async () => {
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const freshData = await fetchFnRef.current()
      setData(freshData as T)
      onDataChangeRef.current?.(freshData as T)
    } catch (error) {
      console.error(`Error fetching data for cache key:`, error)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [])

  const prevCacheKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevCacheKeyRef.current !== cacheKey) {
      prevCacheKeyRef.current = cacheKey
      if (!skipCache) {
        fetchFreshData()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  const invalidateCache = useCallback(() => {
    // No-op for in-memory (kept for API compatibility)
  }, [])

  const updateData = useCallback((newData: T) => {
    setData(newData)
  }, [])

  return {
    data,
    loading,
    refetch: fetchFreshData,
    invalidateCache,
    updateData,
  }
}
