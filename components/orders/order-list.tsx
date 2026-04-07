"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useOrders } from "@/hooks/use-orders"
import { OrderCard } from "./order-card"

export function OrderList() {
  const { data: orders, isLoading } = useOrders()

  const activeOrders = (orders ?? []).filter((o) => o.status === "active")
  const closedOrders = (orders ?? []).filter((o) => o.status === "closed")

  if (isLoading && !orders) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
        <Skeleton className="mx-2 h-8 w-24 rounded-md" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      {activeOrders.length > 0 && (
        <div>
          <h1 className="mx-2 mb-4 text-2xl font-bold">進行中</h1>
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {closedOrders.length > 0 && (
        <div>
          <h2 className="mx-2 mb-4 text-xl font-semibold">已結束</h2>
          <div className="space-y-4">
            {closedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      )}

      {(orders ?? []).length === 0 && (
        <div className="py-12 text-center text-muted-foreground">尚無訂單</div>
      )}
    </div>
  )
}
