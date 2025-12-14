'use client'

import { useEffect, useState } from 'react'
import { OrderCard } from './order-card'
import { CreateOrderDialog } from './create-order-dialog'
import { useSupabase } from '@/components/providers/supabase-provider'
import { isAdmin } from '@/lib/utils/admin-client'
import { OrderListSkeleton } from './skeletons/order-list-skeleton'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'

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

export function OrderList() {
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const { user } = useSupabase()

  const { data: orders = [], loading, refetch, invalidateCache, updateData } =
    useCachedFetch<Order[]>({
      cacheKey: 'orders',
      fetchFn: async () => {
        const res = await fetch('/api/orders')
        if (!res.ok) {
          throw new Error('Failed to fetch orders')
        }
        return res.json()
      },
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

  const handleOrderUpdate = () => {
    // Clear cache and force refresh when order is created/updated
    invalidateCache()
    refetch()
  }

  const activeOrders = (orders || []).filter((o) => o.status === 'active')
  const closedOrders = (orders || []).filter((o) => o.status === 'closed')

  if (loading) {
    return <OrderListSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">訂單列表</h1>
        {!adminLoading && isAdminUser && (
          <CreateOrderDialog onSuccess={handleOrderUpdate} updateOrders={updateData} />
        )}
      </div>

      {activeOrders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">進行中</h2>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {closedOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">已結束</h2>
          <div className="space-y-4">
            {closedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {(orders || []).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          尚無訂單
        </div>
      )}
    </div>
  )
}

