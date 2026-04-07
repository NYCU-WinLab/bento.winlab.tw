"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useAdmin } from "@/hooks/use-admin";
import { useOrder } from "@/hooks/use-orders";
import { useDeleteOrderItem } from "@/hooks/use-order-items";
import { OrderDetailHeader } from "./order-detail-header";
import { OrderItemsList } from "./order-items-list";

export function OrderDetail({ orderId }: { orderId: string }) {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { data: order } = useOrder(orderId);

  if (!order) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        <div className="space-y-4 mx-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  const isActive = order.status === "active";

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <OrderDetailHeader order={order} />
      <div>
        <h2 className="text-2xl font-semibold mb-4 mx-2">訂單項目</h2>
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
  );
}
