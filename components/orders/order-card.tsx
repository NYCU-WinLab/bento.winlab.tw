"use client"

import { parseOrderDate } from "@/lib/utils/date"
import type { OrderWithStats } from "@/types/database"
import Link from "next/link"
import { OrderStats } from "./order-stats"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export function OrderCard({ order }: { order: OrderWithStats }) {
  const orderDate = parseOrderDate(order.id)
  const orderItems = order.order_items || []

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="mb-3 cursor-pointer p-4 transition-colors hover:bg-accent">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-xl font-semibold">
                {order.restaurants.name}
              </h3>
              <Badge
                variant={order.status === "active" ? "default" : "outline"}
                className="text-sm"
              >
                {orderDate}
              </Badge>
            </div>
            <OrderStats
              orderItems={orderItems}
              restaurantAdditional={order.restaurants?.additional || null}
            />
          </div>
        </div>
      </Card>
    </Link>
  )
}
