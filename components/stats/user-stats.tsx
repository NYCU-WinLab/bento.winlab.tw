"use client"

import { useAuth } from "@/contexts/auth-context"
import { useMyStats } from "@/hooks/use-stats"
import { UserOrderCount } from "./user-order-count"
import { UserTopItems } from "./user-top-items"
import { UserTotalSpending } from "./user-total-spending"

export function UserStats() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useMyStats()

  if (!user) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <UserOrderCount value={stats?.order_count || 0} loading={isLoading} />
        <UserTotalSpending
          value={stats?.total_spending || 0}
          loading={isLoading}
        />
      </div>
      <UserTopItems
        data={stats?.top_restaurant_items || []}
        loading={isLoading}
      />
    </div>
  )
}
