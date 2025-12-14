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
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { useSupabase } from '@/components/providers/supabase-provider'

interface MenuItem {
  id: string
  name: string
  price: number
}

interface OrderItem {
  id: string
  menu_item_id: string
  no_sauce: boolean
  user_id: string
  menu_items: {
    name: string
    price: number
  }
  user: {
    name: string
    email: string
  }
}

interface Order {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  restaurants: {
    id: string
    name: string
    phone: string
  }
  order_items: OrderItem[]
}

export function AddOrderItemDialog({
  orderId,
  onSuccess,
  updateOrder,
}: {
  orderId: string
  onSuccess: () => void
  updateOrder?: (order: Order) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState('')
  const [noSauce, setNoSauce] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const { user } = useSupabase()

  useEffect(() => {
    if (open) {
      fetchOrderAndMenu()
    }
  }, [open, orderId])

  const fetchOrderAndMenu = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      setRestaurantId(data.restaurant_id)

      if (data.restaurants?.id) {
        const menuRes = await fetch(`/api/restaurants/${data.restaurants.id}`)
        const menuData = await menuRes.json()
        setMenuItems(menuData.menu_items || [])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem || !user) return

    setLoading(true)
    try {
      const selectedMenuItem = menuItems.find((item) => item.id === selectedItem)
      if (!selectedMenuItem) return

      // Create optimistic order item
      const optimisticItem: OrderItem = {
        id: `temp_${Date.now()}`,
        menu_item_id: selectedItem,
        no_sauce: noSauce,
        user_id: user.id,
        menu_items: {
          name: selectedMenuItem.name,
          price: selectedMenuItem.price,
        },
        user: {
          name: user.user_metadata?.name || user.email || '',
          email: user.email || '',
        },
      }

      // Get current order from cache for optimistic update
      const { getCache } = await import('@/lib/utils/cache')
      const currentOrder = getCache<Order>(`order_${orderId}`)
      if (!currentOrder) {
        throw new Error('Order not found in cache')
      }

      // Optimistic update: immediately update UI
      const optimisticOrder: Order = {
        ...currentOrder,
        order_items: [...currentOrder.order_items, optimisticItem],
      }
      updateOrder?.(optimisticOrder)

      try {
        // Sync with server
        const res = await fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            menu_item_id: selectedItem,
            no_sauce: noSauce,
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to add order item')
        }

        // Fetch fresh order to replace optimistic item
        const orderRes = await fetch(`/api/orders/${orderId}`)
        if (!orderRes.ok) {
          throw new Error('Failed to fetch order')
        }
        const freshOrder = await orderRes.json()

        // Update with server data
        updateOrder?.(freshOrder)

        setOpen(false)
        setSelectedItem('')
        setNoSauce(false)
        onSuccess()
      } catch (error) {
        // Rollback on error
        updateOrder?.(currentOrder)
        const err = error instanceof Error ? error : new Error('Failed to add item')
        console.error('Error adding order item:', err)
        alert(`新增訂餐失敗: ${err.message}`)
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
        <Button>新增訂餐</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增訂餐</DialogTitle>
          <DialogDescription>選擇品項並確認選項</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="menuItem">品項</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="menuItem">
                  <SelectValue placeholder="選擇品項" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - NT$ {item.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noSauce"
                checked={noSauce}
                onCheckedChange={(checked) => setNoSauce(checked === true)}
              />
              <Label htmlFor="noSauce" className="cursor-pointer">
                不醬
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !selectedItem}>
              {loading ? '新增中...' : '新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

