"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuth } from "@/contexts/auth-context";
import { useAdmin } from "@/hooks/use-admin";
import { useOrder, useCloseOrder, useDeleteOrder } from "@/hooks/use-orders";
import { CircleDot } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { AddOrderItemDialog } from "./add-order-item-dialog";
import { CreateOrderDialog } from "./create-order-dialog";
import { CreateRestaurantDialog } from "./create-restaurant-dialog";
import { ThemeToggle } from "./theme-toggle";

export default function HeaderBar() {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const orderId = useMemo(() => {
    if (pathname?.startsWith("/orders/")) {
      return pathname.split("/orders/")[1] || null;
    }
    return null;
  }, [pathname]);

  const { data: orderData } = useOrder(orderId ?? undefined);
  const orderStatus = orderData?.status ?? null;

  const closeOrder = useCloseOrder();
  const deleteOrder = useDeleteOrder();

  const handleAvatarClick = () => {
    router.push("/me");
  };

  const handleCloseOrder = async () => {
    if (!orderId) return;
    try {
      await closeOrder.mutateAsync(orderId);
      toast.success("訂單已關閉");
    } catch (error) {
      console.error("Error closing order:", error);
      toast.error("關閉訂單失敗");
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderId) return;
    try {
      await deleteOrder.mutateAsync(orderId);
      toast.success("訂單已刪除");
      router.push("/");
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error instanceof Error ? error.message : "刪除訂單失敗");
    }
  };

  return (
    <header className="flex items-center justify-between p-4 px-6 w-full max-w-5xl mx-auto">
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

      <div className="flex items-center gap-3">
        {!adminLoading && isAdmin && user && (
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
                  toast.success("訂單已建立");
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

        <Button size="icon" variant="ghost" asChild>
          <Link
            href="https://github.com/NYCU-WinLab/bento.winlab.tw/issues/new/choose"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="回報問題"
          >
            <CircleDot className="size-4" />
          </Link>
        </Button>

        {orderId && orderStatus === "active" && (
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
              toast.success("已新增訂餐");
            }}
          />
        )}

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
