"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useAdminCheck } from "@/lib/hooks/use-admin-check";
import { useCachedFetch } from "@/lib/hooks/use-cached-fetch";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { OrderDetailHeader } from "./order-detail-header";
import { OrderItemsList } from "./order-items-list";

interface OrderItem {
  id: string;
  menu_item_id: string;
  no_sauce: boolean;
  additional: number | null;
  user_id: string | null;
  anonymous_name?: string | null;
  menu_items: {
    name: string;
    price: number;
  };
  user: {
    name: string | null;
    email?: string;
  } | null;
}

interface Order {
  id: string;
  restaurant_id: string;
  status: "active" | "closed";
  created_at: string;
  closed_at: string | null;
  restaurants: {
    id: string;
    name: string;
    phone: string;
    google_map_link?: string | null;
    additional: string[] | null;
  };
  order_items: OrderItem[];
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const { isAdminUser } = useAdminCheck();
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: order,
    loading,
    refetch,
    updateData,
  } = useCachedFetch<Order>({
    cacheKey: `order_${orderId}`,
    fetchFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch order");
      }
      return res.json();
    },
    skipCache: !orderId,
  });

  useEffect(() => {
    if (!user) return;
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    window.addEventListener("order-updated", refetch);
    return () => {
      window.removeEventListener("order-updated", refetch);
    };
  }, [refetch]);

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
          isAdmin={isAdminUser}
          orderId={orderId}
          updateOrder={updateData}
          restaurantAdditional={order.restaurants?.additional || null}
          onDelete={() => {
            window.dispatchEvent(new CustomEvent("order-updated"));
          }}
        />
      </div>
    </div>
  );
}
