"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { useOrder } from "@/hooks/use-orders"
import { OrderDetailHeader } from "./order-detail-header"
import { OrderItemsList } from "./order-items-list"

export function OrderDetail({ orderId }: { orderId: string }) {
  const { isAdmin } = useAdmin()
  const { user } = useAuth()
  const { data: order } = useOrder(orderId)

  if (!order) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
        <div className="mx-2 space-y-3">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-5 w-32 rounded-md" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  const isActive = order.status === "active"

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <OrderDetailHeader order={order} />
      <div>
        <h2 className="mx-2 mb-4 text-2xl font-semibold">訂單項目</h2>
        <OrderItemsList
          items={order.order_items}
          isActive={isActive}
          currentUserId={user?.id}
          currentUserName={user?.user_metadata?.name || user?.email || null}
          isAdmin={isAdmin}
          orderId={orderId}
          restaurantAdditional={order.restaurants?.additional || null}
        />
      </div>
    </div>
  )
}
