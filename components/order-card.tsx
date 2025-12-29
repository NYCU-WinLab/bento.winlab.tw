"use client";

import Link from "next/link";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
// @ts-ignore - date-fns locale type definition issue
import { zhTW } from "date-fns/locale/zh-TW";

interface Order {
  id: string;
  restaurant_id: string;
  status: "active" | "closed";
  created_at: string;
  closed_at: string | null;
  restaurants: {
    name: string;
  };
  created_by_user?: {
    name: string;
    email: string;
  } | null;
}

export function OrderCard({ order }: { order: Order }) {
  return (
    <Link href={`/orders/${order.id}`}>
      <Card className="p-4 mb-4 hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">
                {order.restaurants.name}
              </h3>
              <Badge
                variant={order.status === "active" ? "default" : "secondary"}
              >
                {order.status === "active" ? "進行中" : "已結束"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              建立時間:{" "}
              {format(new Date(order.created_at), "yyyy/MM/dd HH:mm", {
                locale: zhTW,
              })}
            </p>
            {order.closed_at && (
              <p className="text-sm text-muted-foreground">
                結束時間:{" "}
                {format(new Date(order.closed_at), "yyyy/MM/dd HH:mm", {
                  locale: zhTW,
                })}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
