"use client";

import { parseOrderDate } from "@/lib/utils/date";
import type { OrderWithStats } from "@/types/database";
import Link from "next/link";
import { OrderStats } from "./order-stats";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export function OrderCard({ order }: { order: OrderWithStats }) {
  const orderDate = parseOrderDate(order.id);
  const orderItems = order.order_items || [];

  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="p-4 mb-3 hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-xl">
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
  );
}
