"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useAdminCheck } from "@/lib/hooks/use-admin-check";
import { clearCache } from "@/lib/utils/cache";
import { CircleDot } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddOrderItemDialog } from "./add-order-item-dialog";
import { CreateOrderDialog } from "./create-order-dialog";
import { CreateRestaurantDialog } from "./create-restaurant-dialog";
import { ThemeToggle } from "./theme-toggle";

export default function HeaderBar() {
  const { loading } = useAuth();
  const { isAdminUser, adminLoading, user } = useAdminCheck();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<"active" | "closed" | null>(
    null
  );

  useEffect(() => {
    if (pathname?.startsWith("/orders/")) {
      const id = pathname.split("/orders/")[1];
      setOrderId(id || null);
      if (id) {
        fetchOrderStatus(id);
      }
    } else {
      setOrderId(null);
      setOrderStatus(null);
    }
  }, [pathname]);

  const fetchOrderStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrderStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  const handleAvatarClick = () => {
    router.push("/me");
  };

  const handleCloseOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/close`, {
        method: "POST",
      });
      if (res.ok) {
        setOrderStatus("closed");
        clearCache("orders");
        clearCache(`order_${orderId}`);
        toast.success("訂單已關閉");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "關閉訂單失敗");
      }
    } catch (error) {
      console.error("Error closing order:", error);
      toast.error("關閉訂單失敗");
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete order");
      }

      clearCache("orders");
      clearCache(`order_${orderId}`);

      toast.success("訂單已刪除");
      router.push("/");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error instanceof Error ? error.message : "刪除訂單失敗");
    }
  };

  return (
    <header className="flex items-center justify-between p-4 px-6 w-full max-w-5xl mx-auto">
      {/* Left side - Navigation links */}
      <nav className="flex items-center gap-4">
        <Link href="/" className="font-semibold text-lg">
          訂單
        </Link>
        <Link href="/menus" className="font-semibold text-lg">
          店家
        </Link>
        <Link href="/rank" className="font-semibold text-lg">
          排名
        </Link>
        <Link href="/stats" className="font-semibold text-lg">
          統計
        </Link>
      </nav>

      {/* Right side - User area */}
      <div className="flex items-center gap-3">
        {/* Admin actions */}
        {!adminLoading && isAdminUser && user && (
          <>
            {pathname === "/" && (
              <CreateOrderDialog
                trigger={
                  <Button
                    size="sm"
                    className="animate-in fade-in slide-in-from-right-2 duration-200"
                  >
                    新增訂單
                  </Button>
                }
                onSuccess={() => {
                  clearCache("orders");
                  window.dispatchEvent(new CustomEvent("order-updated"));
                  toast.success("訂單已建立");
                  router.refresh();
                }}
              />
            )}

            {pathname === "/menus" && (
              <CreateRestaurantDialog
                trigger={
                  <Button
                    size="sm"
                    className="animate-in fade-in slide-in-from-right-2 duration-200"
                  >
                    新增店家
                  </Button>
                }
                onSuccess={() => {
                  toast.success("店家已建立");
                  router.refresh();
                }}
              />
            )}

            {orderId && orderStatus === "active" && (
              <>
                <ConfirmDialog
                  trigger={
                    <Button
                      variant="destructive"
                      size="sm"
                      className="animate-in fade-in slide-in-from-right-2 duration-200"
                    >
                      刪除訂單
                    </Button>
                  }
                  title="確定要刪除訂單嗎？"
                  description="此操作將永久刪除訂單，且無法復原。"
                  confirmText="刪除"
                  variant="destructive"
                  onConfirm={handleDeleteOrder}
                />
                <Button
                  onClick={handleCloseOrder}
                  variant="default"
                  size="sm"
                  className="animate-in fade-in slide-in-from-right-2 duration-200"
                >
                  關閉訂單
                </Button>
              </>
            )}
          </>
        )}

        <ThemeToggle />

        <Button size="icon" variant="ghost">
          <Link href="https://github.com/NYCU-WinLab/bento.winlab.tw/issues/new/choose">
            <CircleDot className="size-4" />
          </Link>
        </Button>

        {orderId && orderStatus === "active" && user && (
          <AddOrderItemDialog
            orderId={orderId}
            trigger={
              <Button
                size="sm"
                className="animate-in fade-in slide-in-from-right-2 duration-200"
              >
                新增訂餐
              </Button>
            }
            onSuccess={() => {
              clearCache("orders");
              clearCache(`order_${orderId}`);

              window.dispatchEvent(
                new CustomEvent("order-updated", {
                  detail: { orderId },
                })
              );

              toast.success("已新增訂餐");
              router.refresh();
            }}
          />
        )}

        {/* User avatar */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <button
            onClick={handleAvatarClick}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <Avatar>
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.email}
              />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <Button
            size="sm"
            asChild
            className="animate-in fade-in duration-200"
          >
            <Link
              href={
                pathname && pathname !== "/login"
                  ? `/login?next=${encodeURIComponent(pathname)}`
                  : "/login"
              }
            >
              登入
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
