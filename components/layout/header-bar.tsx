"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import {
  useOrder,
  useCloseOrder,
  useDeleteOrder,
  useReopenOrder,
} from "@/hooks/use-orders"
import { CircleDot, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { AddOrderItemDialog } from "@/components/orders/add-order-item-dialog"
import { CreateOrderDialog } from "@/components/orders/create-order-dialog"
import { CreateRestaurantDialog } from "@/components/menus/create-restaurant-dialog"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export default function HeaderBar() {
  const { user, loading } = useAuth()
  const { isAdmin, isLoading: adminLoading } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const orderId = useMemo(() => {
    if (pathname?.startsWith("/orders/")) {
      return pathname.split("/orders/")[1] || null
    }
    return null
  }, [pathname])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const { data: orderData } = useOrder(orderId ?? undefined)
  const orderStatus = orderData?.status ?? null

  const closeOrder = useCloseOrder()
  const deleteOrder = useDeleteOrder()
  const reopenOrder = useReopenOrder()

  const handleAvatarClick = () => {
    router.push("/me")
  }

  const handleCloseOrder = async () => {
    if (!orderId) return
    try {
      await closeOrder.mutateAsync(orderId)
      toast.success("訂單已關閉")
    } catch {
      toast.error("關閉訂單失敗")
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderId) return
    try {
      await deleteOrder.mutateAsync(orderId)
      toast.success("訂單已刪除")
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "刪除訂單失敗")
    }
  }

  const handleReopenOrder = async () => {
    if (!orderId) return
    try {
      await reopenOrder.mutateAsync(orderId)
      toast.success("訂單已重新開啟")
    } catch {
      toast.error("重新開啟訂單失敗")
    }
  }

  const adminOrderActions =
    !adminLoading && isAdmin && user && orderId ? (
      <>
        {orderStatus === "active" && (
          <>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm">
                  刪除訂單
                </Button>
              }
              title="確定要刪除訂單嗎？"
              description="此操作將永久刪除訂單，且無法復原。"
              confirmText="刪除"
              variant="destructive"
              onConfirm={handleDeleteOrder}
            />
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  關閉訂單
                </Button>
              }
              title="確定要關閉訂單嗎？"
              description="關閉後訂單將停止接受新增，可透過重新開啟恢復。"
              confirmText="關閉"
              onConfirm={handleCloseOrder}
            />
          </>
        )}
        {orderStatus === "closed" && (
          <ConfirmDialog
            trigger={
              <Button variant="default" size="sm">
                重新開啟訂單
              </Button>
            }
            title="確定要重新開啟訂單嗎？"
            description="重新開啟後，訂單將可以繼續接受訂餐。"
            confirmText="開啟"
            onConfirm={handleReopenOrder}
          />
        )}
      </>
    ) : null

  const adminPageActions =
    !adminLoading && isAdmin && user ? (
      <>
        {pathname === "/" && (
          <CreateOrderDialog
            trigger={<Button size="sm">新增訂單</Button>}
            onSuccess={() => toast.success("訂單已建立")}
          />
        )}
        {pathname === "/menus" && (
          <CreateRestaurantDialog
            trigger={<Button size="sm">新增店家</Button>}
            onSuccess={() => toast.success("店家已建立")}
          />
        )}
      </>
    ) : null

  const navLinks = (
    <>
      <Link href="/" className="text-lg font-semibold">
        訂單
      </Link>
      <Link href="/menus" className="text-lg font-semibold">
        店家
      </Link>
      <Link href="/rank" className="text-lg font-semibold">
        排名
      </Link>
      <Link href="/stats" className="text-lg font-semibold">
        統計
      </Link>
    </>
  )

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between p-4 px-6">
        <div className="flex items-center gap-4">
          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 md:flex">{navLinks}</nav>

          {/* Mobile brand */}
          <Link href="/" className="text-lg font-semibold md:hidden">
            訂餐
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop admin actions */}
          <div className="hidden items-center gap-3 md:flex">
            {adminPageActions}
            {adminOrderActions}
          </div>

          <ThemeToggle />

          <Button size="icon" variant="ghost" asChild className="hidden md:flex">
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
              trigger={<Button size="sm">新增訂餐</Button>}
              onSuccess={() => toast.success("已新增訂餐")}
            />
          )}

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
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
            <Button size="sm" asChild>
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

          {/* Mobile hamburger */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "關閉選單" : "開啟選單"}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b bg-background/95 shadow-md backdrop-blur-sm md:hidden">
          <nav className="mx-auto flex max-w-5xl flex-col gap-1 px-6 py-4">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-lg font-semibold hover:bg-accent"
            >
              訂單
            </Link>
            <Link
              href="/menus"
              className="rounded-md px-3 py-2 text-lg font-semibold hover:bg-accent"
            >
              店家
            </Link>
            <Link
              href="/rank"
              className="rounded-md px-3 py-2 text-lg font-semibold hover:bg-accent"
            >
              排名
            </Link>
            <Link
              href="/stats"
              className="rounded-md px-3 py-2 text-lg font-semibold hover:bg-accent"
            >
              統計
            </Link>

            {(!adminLoading && isAdmin && user) || orderId ? (
              <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                {adminPageActions && (
                  <div className="flex flex-wrap gap-2">{adminPageActions}</div>
                )}
                {adminOrderActions && (
                  <div className="flex flex-wrap gap-2">
                    {adminOrderActions}
                  </div>
                )}
                <Button size="sm" variant="ghost" asChild className="w-fit">
                  <Link
                    href="https://github.com/NYCU-WinLab/bento.winlab.tw/issues/new/choose"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <CircleDot className="mr-1.5 size-4" />
                    回報問題
                  </Link>
                </Button>
              </div>
            ) : null}
          </nav>
        </div>
      )}
    </>
  )
}
