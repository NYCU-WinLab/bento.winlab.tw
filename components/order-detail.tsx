'use client'

import { useEffect, useState } from 'react'
import { OrderDetailHeader } from './order-detail-header'
import { OrderSummary } from './order-summary'
import { OrderItemsList } from './order-items-list'
import { AddOrderItemDialog } from './add-order-item-dialog'
import { useSupabase } from '@/components/providers/supabase-provider'
import { isAdmin } from '@/lib/utils/admin-client'
import { OrderDetailSkeleton } from './skeletons/order-detail-skeleton'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'

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

export function OrderDetail({ orderId }: { orderId: string }) {
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const { user } = useSupabase()

  const { data: order, loading, refetch, invalidateCache, updateData } = useCachedFetch<Order>({
    cacheKey: `order_${orderId}`,
    fetchFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch order')
      }
      return res.json()
    },
    skipCache: !orderId,
  })

  useEffect(() => {
    if (user) {
      checkAdmin()
    } else {
      setAdminLoading(false)
    }
  }, [user])

  const checkAdmin = async () => {
    if (!user) {
      setAdminLoading(false)
      return
    }
    try {
      const admin = await isAdmin(user.id)
      setIsAdminUser(admin)
    } catch {
      setIsAdminUser(false)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleCloseOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/close`, {
        method: 'POST',
      })
      if (res.ok) {
        // Clear cache and force refresh
        invalidateCache()
        // Also clear orders list cache
        const { clearCache } = await import('@/lib/utils/cache')
        clearCache('orders')
        refetch()
      }
    } catch (error) {
      console.error('Error closing order:', error)
    }
  }

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return <div className="container mx-auto px-4 py-8">訂單不存在</div>
  }

  const isActive = order.status === 'active'

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderDetailHeader
        order={order}
        isAdmin={isAdminUser}
        adminLoading={adminLoading}
        onClose={handleCloseOrder}
      />

      {!isActive && <OrderSummary order={order} />}

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">訂單項目</h2>
          {isActive && user && !adminLoading && (
            <AddOrderItemDialog
              orderId={order.id}
              updateOrder={updateData}
              onSuccess={async () => {
                // Also clear orders list cache
                const { clearCache } = await import('@/lib/utils/cache')
                clearCache('orders')
              }}
            />
          )}
        </div>
        <OrderItemsList
          items={order.order_items}
          isActive={isActive}
          currentUserId={user?.id}
          orderId={orderId}
          updateOrder={updateData}
          onDelete={async () => {
            // Also clear orders list cache
            const { clearCache } = await import('@/lib/utils/cache')
            clearCache('orders')
          }}
        />
      </div>
    </div>
  )
}

