"use client"

import { parseOrderDate } from "@/lib/utils/date"
import { ExternalLink } from "lucide-react"
import { OrderStats } from "./order-stats"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  menu_item_id: string
  no_sauce?: boolean
  additional?: number | null
  menu_items: {
    name: string
    price: number
  }
  user_id: string | null
}

interface Order {
  id: string
  restaurant_id: string
  status: "active" | "closed"
  created_at: string
  closed_at: string | null
  restaurants: {
    id: string
    name: string
    phone: string
    google_map_link?: string | null
    additional?: string[] | null
  }
  order_items?: OrderItem[]
}

export function OrderDetailHeader({ order }: { order: Order }) {
  const orderDate = parseOrderDate(order.id)
  const orderItems = order.order_items || []

  return (
    <div className="mx-2 mb-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="mb-4 text-3xl font-bold">
              {order.restaurants.name}
            </h1>
            <Badge variant="default" className="text-sm">
              {orderDate}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            {order.restaurants.google_map_link && (
              <a
                href={order.restaurants.google_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Google 地圖
              </a>
            )}
            <p>
              電話：
              <a
                href={`tel:${order.restaurants.phone}`}
                className="text-primary hover:underline"
              >
                {order.restaurants.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
      <OrderStats
        orderItems={orderItems}
        restaurantAdditional={order.restaurants?.additional || null}
      />
    </div>
  )
}
