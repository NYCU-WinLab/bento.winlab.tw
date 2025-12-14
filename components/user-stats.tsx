'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useSupabase } from '@/components/providers/supabase-provider'
import { UserStatsSkeleton } from './skeletons/user-stats-skeleton'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'

interface UserStatsData {
  order_count: number
  total_spending: number
  top_items: Array<{
    name: string
    count: number
  }>
  top_restaurants: Array<{
    name: string
    count: number
  }>
}

export function UserStats() {
  const { user } = useSupabase()

  const { data: stats, loading } = useCachedFetch<UserStatsData>({
    cacheKey: `user_stats_${user?.id || 'anonymous'}`,
    fetchFn: async () => {
      const res = await fetch('/api/me/stats')
      if (!res.ok) {
        throw new Error('Failed to fetch stats')
      }
      return res.json()
    },
    skipCache: !user, // Skip cache if user is not logged in
  })

  if (!user) {
    return null
  }

  if (loading) {
    return <UserStatsSkeleton />
  }

  if (!stats) {
    return <div>無法載入統計資料</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>個人統計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">參與訂單數</p>
            <p className="text-2xl font-bold">{stats.order_count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">總計消費</p>
            <p className="text-2xl font-bold">NT$ {stats.total_spending.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">最常吃的品項</h3>
            {stats.top_items.length > 0 ? (
              <ul className="space-y-1">
                {stats.top_items.map((item, index) => (
                  <li key={index} className="text-sm">
                    {index + 1}. {item.name} ({item.count} 次)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">最常吃的店</h3>
            {stats.top_restaurants.length > 0 ? (
              <ul className="space-y-1">
                {stats.top_restaurants.map((restaurant, index) => (
                  <li key={index} className="text-sm">
                    {index + 1}. {restaurant.name} ({restaurant.count} 次)
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

