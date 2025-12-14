'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { RestaurantStats } from './restaurant-stats'
import { EditRestaurantDialog } from './edit-restaurant-dialog'
import { RatingDialog } from './rating-dialog'
import { Trash2 } from 'lucide-react'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'

interface MenuItem {
  id: string
  name: string
  price: number
  order_count?: number
  average_rating?: number
}

interface Restaurant {
  id: string
  name: string
  phone: string
  created_at: string
}

interface RestaurantStatsItem {
  id: string
  name: string
  order_count: number
  total_revenue: number
  average_rating: number
}

interface RestaurantStatsData {
  order_count: number
  total_spending: number
  items: RestaurantStatsItem[]
}

export function RestaurantCard({
  restaurant,
  isAdmin,
  onUpdate,
}: {
  restaurant: Restaurant
  isAdmin: boolean
  onUpdate: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const {
    data: restaurantData,
    loading: menuLoading,
    refetch: refetchMenu,
    invalidateCache: invalidateMenuCache,
  } = useCachedFetch<{ menu_items: MenuItem[] }>({
    cacheKey: `restaurant_${restaurant.id}_menu`,
    fetchFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurant.id}`)
      if (!res.ok) {
        throw new Error('Failed to fetch restaurant')
      }
      return res.json()
    },
  })

  const {
    data: stats,
    loading: statsLoading,
    refetch: refetchStats,
    invalidateCache: invalidateStatsCache,
  } = useCachedFetch<RestaurantStatsData>({
    cacheKey: `restaurant_${restaurant.id}_stats`,
    fetchFn: async () => {
      const res = await fetch(`/api/restaurants/${restaurant.id}/stats`)
      if (!res.ok) {
        throw new Error('Failed to fetch restaurant stats')
      }
      return res.json()
    },
  })

  const menuItems = restaurantData?.menu_items || []
  const loading = menuLoading || statsLoading

  const handleRestaurantUpdate = () => {
    invalidateMenuCache()
    invalidateStatsCache()
    refetchMenu()
    refetchStats()
    onUpdate()
  }

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${restaurant.name}」嗎？\n\n此操作將刪除所有相關的品項和訂單記錄，且無法復原。`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete')
      }

      // Clear all related cache
      invalidateMenuCache()
      invalidateStatsCache()
      onUpdate()
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert(error instanceof Error ? error.message : '刪除店家失敗')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{restaurant.name}</CardTitle>
            <CardDescription>電話: {restaurant.phone}</CardDescription>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <EditRestaurantDialog
                restaurant={restaurant}
                menuItems={menuItems}
                onSuccess={handleRestaurantUpdate}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {deleting ? '刪除中...' : '刪除'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">結單次數</p>
                <Skeleton className="h-7 w-12" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">總消費</p>
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">品項</h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {stats && <RestaurantStats stats={stats} />}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">品項</h3>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          NT$ {item.price.toLocaleString()}
                        </span>
                      </div>
                      {stats && (
                        <div className="text-xs text-muted-foreground mt-1">
                          被點 {stats.items.find((i) => i.id === item.id)?.order_count || 0} 次
                          {stats.items.find((i) => i.id === item.id)?.average_rating && (
                            <span className="ml-2">
                              評分: {stats.items.find((i) => i.id === item.id)?.average_rating} 星
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <RatingDialog
                      menuItemId={item.id}
                      menuItemName={item.name}
                      onRatingSubmitted={() => {
                        // Clear stats cache when rating is submitted
                        invalidateStatsCache()
                        refetchStats()
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

