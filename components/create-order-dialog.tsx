'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useSupabase } from '@/components/providers/supabase-provider'

interface Restaurant {
  id: string
  name: string
}

interface Order {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  restaurants: {
    name: string
  }
}

export function CreateOrderDialog({
  onSuccess,
  updateOrders,
}: {
  onSuccess: () => void
  updateOrders?: (orders: Order[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [autoCloseDate, setAutoCloseDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useSupabase()

  useEffect(() => {
    if (open) {
      fetchRestaurants()
    }
  }, [open])

  const fetchRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants')
      const data = await res.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRestaurant || !user) return

    setLoading(true)
    try {
      const selectedRestaurantData = restaurants.find((r) => r.id === selectedRestaurant)
      if (!selectedRestaurantData) return

      const body: any = {
        restaurant_id: selectedRestaurant,
      }

      if (autoCloseDate) {
        body.auto_close_at = new Date(autoCloseDate).toISOString()
      }

      // Create optimistic order
      const optimisticOrder: Order = {
        id: `temp_${Date.now()}`, // Temporary ID
        restaurant_id: selectedRestaurant,
        status: 'active',
        created_at: new Date().toISOString(),
        closed_at: null,
        restaurants: {
          name: selectedRestaurantData.name,
        },
      }

      // Get current orders from cache for optimistic update
      const { getCache } = await import('@/lib/utils/cache')
      const currentOrders = getCache<Order[]>('orders') || []

      // Optimistic update: immediately update UI
      const optimisticOrders = [optimisticOrder, ...currentOrders]
      updateOrders?.(optimisticOrders)

      try {
        // Sync with server
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!res.ok) {
          throw new Error('Failed to create order')
        }

        // Fetch fresh orders list to replace optimistic order
        const ordersRes = await fetch('/api/orders')
        if (!ordersRes.ok) {
          throw new Error('Failed to fetch orders')
        }
        const freshOrders = await ordersRes.json()

        // Update with server data
        updateOrders?.(freshOrders)

        setOpen(false)
        setSelectedRestaurant('')
        setAutoCloseDate('')
        onSuccess()
      } catch (error) {
        // Rollback on error
        updateOrders?.(currentOrders)
        const err = error instanceof Error ? error : new Error('Failed to create order')
        console.error('Error creating order:', err)
        alert(`建立訂單失敗: ${err.message}`)
      }
    } catch (error) {
      // Error already handled in onError callback
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增訂單</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增訂單</DialogTitle>
          <DialogDescription>選擇店家以建立新訂單</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">店家</Label>
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger id="restaurant">
                  <SelectValue placeholder="選擇店家" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="autoClose">自動關閉時間（選填）</Label>
              <Input
                id="autoClose"
                type="datetime-local"
                value={autoCloseDate}
                onChange={(e) => setAutoCloseDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !selectedRestaurant}>
              {loading ? '建立中...' : '建立'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

