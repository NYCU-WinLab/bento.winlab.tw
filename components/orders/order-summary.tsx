"use client"

import { Card } from "@/components/ui/card"

interface OrderItem {
  id: string
  menu_item_id: string
  no_sauce: boolean
  additional?: number | null
  menu_items: {
    name: string
    price: number
  }
}

interface Order {
  order_items: OrderItem[]
}

export function OrderSummary({ order }: { order: Order }) {
  const totalItems = order.order_items.length
  const totalAmount = order.order_items.reduce(
    (sum, item) => sum + (item.menu_items?.price || 0),
    0
  )

  return (
    <Card className="mb-6 p-6">
      <h2 className="mb-4 text-2xl font-semibold">總覽</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-sm text-muted-foreground">品項總計</p>
          <p className="text-2xl font-bold">{totalItems}</p>
        </div>
        <div>
          <p className="mb-1 text-sm text-muted-foreground">金額總計</p>
          <p className="text-2xl font-bold">
            NT$ {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  )
}
