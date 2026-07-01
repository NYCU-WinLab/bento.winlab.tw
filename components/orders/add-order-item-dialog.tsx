"use client"

import { useAuth } from "@/contexts/auth-context"
import { useAdmin } from "@/hooks/use-admin"
import { useOrder } from "@/hooks/use-orders"
import { useMenu } from "@/hooks/use-menus"
import { useUsers } from "@/hooks/use-users"
import {
  useAddOrderItem,
  useAdminAddItem,
  useAddAnonymousItem,
} from "@/hooks/use-order-items"
import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  price: number
  type?: string | null
  order_count?: number
}

interface CartItem {
  key: number
  menuItemId: string
  noSauce: boolean
  additional: number | null
}

function buildEmptyCartItem(key: number): CartItem {
  return { key, menuItemId: "", noSauce: false, additional: null }
}

export function AddOrderItemDialog({
  orderId,
  onSuccess,
  trigger,
}: {
  orderId: string
  onSuccess: () => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([buildEmptyCartItem(0)])
  const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [anonymousName, setAnonymousName] = useState("")
  const [anonymousContact, setAnonymousContact] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const keyCounter = useRef(1)

  const { user } = useAuth()
  const { isAdmin: isAdminUser } = useAdmin()
  const isAnonymous = !user

  const { data: order } = useOrder(open ? orderId : undefined)
  const restaurantId = order?.restaurants?.id
  const { data: menuData } = useMenu(open ? restaurantId : undefined)
  const { data: userList } = useUsers()

  const addItem = useAddOrderItem()
  const adminAddItem = useAdminAddItem()
  const addAnonymousItem = useAddAnonymousItem()

  const restaurantAdditionalOptions = order?.restaurants?.additional || null

  const menuItems: MenuItem[] = (() => {
    const allMenuItems = menuData?.menu_items || []
    const orderItems = order?.order_items || []
    const itemCountMap = new Map<string, number>()

    orderItems.forEach((item: any) => {
      const menuItemId = item.menu_item_id
      itemCountMap.set(menuItemId, (itemCountMap.get(menuItemId) || 0) + 1)
    })

    const menuItemsWithCount = allMenuItems.map((item: any) => ({
      ...item,
      order_count: itemCountMap.get(item.id) || 0,
    }))

    menuItemsWithCount.sort((a: MenuItem, b: MenuItem) => {
      const countA = a.order_count || 0
      const countB = b.order_count || 0
      if (countA !== countB) {
        return countB - countA
      }
      if (a.type && b.type && a.type !== b.type) {
        return a.type.localeCompare(b.type)
      }
      if (a.type && !b.type) return -1
      if (!a.type && b.type) return 1
      return b.price - a.price
    })

    return menuItemsWithCount
  })()

  const handleOpenChange = (value: boolean) => {
    setOpen(value)
    if (value) {
      const initial = buildEmptyCartItem(0)
      if (restaurantAdditionalOptions && restaurantAdditionalOptions.length > 0) {
        initial.additional = 0
      }
      keyCounter.current = 1
      setCartItems([initial])
      setShowConfirm(false)
    }
  }

  const addCartRow = () => {
    const key = keyCounter.current++
    const item = buildEmptyCartItem(key)
    if (restaurantAdditionalOptions && restaurantAdditionalOptions.length > 0) {
      item.additional = 0
    }
    setCartItems((prev) => [...prev, item])
  }

  const removeCartRow = (key: number) => {
    setCartItems((prev) => prev.filter((r) => r.key !== key))
  }

  const updateCartRow = (key: number, patch: Partial<Omit<CartItem, "key">>) => {
    setCartItems((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.some((r) => !r.menuItemId)) return
    if (isAnonymous && (!anonymousName.trim() || !anonymousContact.trim())) return
    if (!isAnonymous && !user) return

    if (isAnonymous && !showConfirm) {
      setShowConfirm(true)
      return
    }

    await doSubmit()
  }

  const doSubmit = async () => {
    try {
      for (const row of cartItems) {
        if (isAnonymous) {
          await addAnonymousItem.mutateAsync({
            order_id: orderId,
            menu_item_id: row.menuItemId,
            anonymous_name: anonymousName.trim(),
            anonymous_contact: anonymousContact.trim(),
            no_sauce: row.noSauce,
            additional: row.additional,
          })
        } else if (isAdminUser && targetUserId) {
          await adminAddItem.mutateAsync({
            order_id: orderId,
            menu_item_id: row.menuItemId,
            user_id: targetUserId,
            no_sauce: row.noSauce,
            additional: row.additional,
          })
        } else {
          await addItem.mutateAsync({
            order_id: orderId,
            menu_item_id: row.menuItemId,
            no_sauce: row.noSauce,
            additional: row.additional,
          })
        }
      }

      setOpen(false)
      setCartItems([buildEmptyCartItem(0)])
      keyCounter.current = 1
      setTargetUserId(null)
      setShowConfirm(false)
      onSuccess()
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Failed to add item")
      console.error("Error adding order item:", err)
      alert(`新增訂餐失敗: ${err.message}`)
      setShowConfirm(false)
    }
  }

  const isPending =
    addItem.isPending || adminAddItem.isPending || addAnonymousItem.isPending

  const renderMenuOptions = () => {
    const grouped = new Map<string, MenuItem[]>()
    menuItems.forEach((item) => {
      const type = item.type || "其他"
      if (!grouped.has(type)) grouped.set(type, [])
      grouped.get(type)!.push(item)
    })

    const result: React.ReactElement[] = []
    grouped.forEach((items, type) => {
      if (grouped.size > 1) {
        result.push(
          <div
            key={`header-${type}`}
            className="sticky top-0 bg-muted/50 px-3 py-2 text-base font-semibold text-foreground backdrop-blur-sm"
          >
            {type}
          </div>
        )
      }
      items.forEach((item) => {
        const orderCountText =
          item.order_count && item.order_count > 0
            ? `（${item.order_count} 個訂餐）`
            : ""
        result.push(
          <SelectItem key={item.id} value={item.id} className="py-3 text-base">
            {item.name} - NT$ {item.price.toLocaleString()} {orderCountText}
          </SelectItem>
        )
      })
    })
    return result
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button>新增訂餐</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">新增訂餐</DialogTitle>
          <DialogDescription className="text-base">
            選擇品項並確認選項
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {isAnonymous && (
            <div className="space-y-3 pb-4">
              <Input
                placeholder="請輸入您的姓名"
                value={anonymousName}
                onChange={(e) => setAnonymousName(e.target.value)}
                className="h-12 text-base"
                required
              />
              <Input
                placeholder="聯絡方式（電話或 LINE ID）"
                value={anonymousContact}
                onChange={(e) => setAnonymousContact(e.target.value)}
                className="h-12 text-base"
                required
              />
            </div>
          )}
          {isAdminUser && (
            <div className="pb-4">
              <Select
                value={targetUserId ?? ""}
                onValueChange={(v) => setTargetUserId(v || null)}
              >
                <SelectTrigger className="h-12 w-full text-base">
                  <SelectValue placeholder="代替哪位用戶點餐（留空為自己）" />
                </SelectTrigger>
                <SelectContent>
                  {(userList ?? []).map((u) => (
                    <SelectItem
                      key={u.id}
                      value={u.id}
                      className="py-3 text-base"
                    >
                      {u.name ?? u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3 pb-4">
            {cartItems.map((row, idx) => (
              <div key={row.key} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <Select
                    value={row.menuItemId}
                    onValueChange={(v) => updateCartRow(row.key, { menuItemId: v })}
                  >
                    <SelectTrigger className="h-12 w-full text-base">
                      <SelectValue placeholder="選擇品項" />
                    </SelectTrigger>
                    <SelectContent>{renderMenuOptions()}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Checkbox
                    id={`noSauce-${row.key}`}
                    checked={row.noSauce}
                    onCheckedChange={(checked) =>
                      updateCartRow(row.key, { noSauce: checked === true })
                    }
                  />
                  <Label
                    htmlFor={`noSauce-${row.key}`}
                    className="cursor-pointer text-base whitespace-nowrap"
                  >
                    不醬
                  </Label>
                </div>
                {restaurantAdditionalOptions &&
                  restaurantAdditionalOptions.length > 0 && (
                    <div className="shrink-0">
                      <Select
                        value={
                          row.additional !== null
                            ? row.additional.toString()
                            : undefined
                        }
                        onValueChange={(value) =>
                          updateCartRow(row.key, { additional: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="h-12 w-32 text-base">
                          <SelectValue placeholder="額外選項" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurantAdditionalOptions.map(
                            (option: string, index: number) => (
                              <SelectItem key={index} value={index.toString()}>
                                {option}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                {cartItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeCartRow(row.key)}
                    aria-label={`移除第 ${idx + 1} 項`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="pb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-sm"
              onClick={addCartRow}
            >
              <Plus className="h-4 w-4" />
              新增品項
            </Button>
          </div>

          {isAnonymous && showConfirm && (
            <div className="mb-4 space-y-2 rounded-lg border border-rank-gold/50 bg-rank-gold/10 p-4">
              <p className="text-base font-semibold">請確認您的訂餐資訊：</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  姓名：
                  <span className="font-medium text-foreground">
                    {anonymousName}
                  </span>
                </p>
                <p>
                  聯絡方式：
                  <span className="font-medium text-foreground">
                    {anonymousContact}
                  </span>
                </p>
                <div className="space-y-0.5">
                  <p>品項：</p>
                  {cartItems.map((row, idx) => {
                    const found = menuItems.find((m) => m.id === row.menuItemId)
                    return (
                      <p key={row.key} className="pl-2">
                        <span className="font-medium text-foreground">
                          {idx + 1}. {found?.name ?? ""}
                          {row.noSauce ? "（不醬）" : ""}
                          {row.additional !== null &&
                          restaurantAdditionalOptions?.[row.additional]
                            ? `（${restaurantAdditionalOptions[row.additional]}）`
                            : ""}
                        </span>
                      </p>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {isAnonymous && showConfirm ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="h-11 text-base"
                >
                  返回修改
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-11 text-base"
                >
                  {isPending ? "新增中..." : "確認送出"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="h-11 text-base"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    cartItems.some((r) => !r.menuItemId) ||
                    (isAnonymous &&
                      (!anonymousName.trim() || !anonymousContact.trim()))
                  }
                  className="h-11 text-base"
                >
                  {isPending
                    ? "新增中..."
                    : cartItems.length > 1
                      ? `新增 ${cartItems.length} 項`
                      : "新增"}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
