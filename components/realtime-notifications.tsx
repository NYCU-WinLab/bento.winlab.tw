"use client";

import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";

export function RealtimeNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel("bento-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bento_orders",
          filter: "status=eq.closed",
        },
        (payload) => {
          toast.info("訂單已關閉", {
            description: `訂單 ${payload.new.id} 已被關閉`,
          });
          window.dispatchEvent(new CustomEvent("order-updated"));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bento_orders",
        },
        () => {
          toast.info("新訂單", {
            description: "有新的訂單已建立",
          });
          window.dispatchEvent(new CustomEvent("order-updated"));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bento_order_items",
        },
        (payload) => {
          if (payload.new.user_id !== user.id) {
            toast.info("新的訂餐", {
              description: "有人新增了訂餐項目",
            });
            window.dispatchEvent(
              new CustomEvent("order-updated", {
                detail: { orderId: payload.new.order_id },
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
}
