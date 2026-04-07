"use client"

import { useDeleteOrderItem } from "@/hooks/use-order-items"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"

interface OrderItem {
  id: string
  menu_item_id: string
  no_sauce: boolean
  additional: number | null
  user_id: string | null
  anonymous_name?: string | null
  anonymous_contact?: string | null
  menu_items: {
    name: string
    price: number
  }
  user: {
    name: string | null
    email?: string
  } | null
}

interface GroupedOrderItem {
  user_id: string
  user_name: string | null
  items: OrderItem[]
  total: number
}

export function OrderItemsList({
  items,
  isActive,
  currentUserId,
  currentUserName,
  isAdmin,
  orderId,
  restaurantAdditional,
}: {
  items: OrderItem[]
  isActive: boolean
  currentUserId?: string
  currentUserName?: string | null
  isAdmin?: boolean
  orderId?: string
  restaurantAdditional?: string[] | null
}) {
  const deleteItem = useDeleteOrderItem()

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此訂餐項目嗎？")) return
    try {
      await deleteItem.mutateAsync(id)
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to delete")
      console.error("Error deleting item:", err)
      alert(`刪除失敗: ${err.message}`)
    }
  }

  const groupedItems = items.reduce(
    (acc, item) => {
      const groupKey =
        item.user_id ?? `anon:${item.anonymous_name ?? "unknown"}`
      if (!acc[groupKey]) {
        acc[groupKey] = {
          user_id: groupKey,
          user_name: item.user?.name || item.anonymous_name || null,
          items: [],
          total: 0,
        }
      }
      acc[groupKey].items.push(item)
      acc[groupKey].total += item.menu_items?.price || 0
      return acc
    },
    {} as Record<string, GroupedOrderItem>
  )

  const groupedItemsArray = Object.values(groupedItems).sort((a, b) => {
    if (currentUserId) {
      if (a.user_id === currentUserId) return -1
      if (b.user_id === currentUserId) return 1
    }
    return b.total - a.total
  })

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">尚無訂餐項目</div>
    )
  }

  return (
    <ItemGroup className="gap-4">
      {groupedItemsArray.map((group, index) => {
        const isOver140 = group.total > 140
        const goldGlowStyle = isOver140
          ? "shadow-[0_0_20px_rgba(250,204,21,0.6)] border-yellow-500/50"
          : ""

        return (
          <div key={group.user_id}>
            <Item
              variant="outline"
              className={`text-lg ${goldGlowStyle} ${
                isOver140
                  ? "bg-linear-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/20 dark:to-yellow-900/10"
                  : ""
              }`}
            >
              <ItemContent className="flex-1">
                <ItemTitle className="text-lg">
                  {group.user_name || "未知"}
                  {group.items[0]?.anonymous_contact && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({group.items[0].anonymous_contact})
                    </span>
                  )}
                </ItemTitle>
                <div className="mt-1.5 flex flex-col gap-1.5 text-muted-foreground">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span>{item.menu_items?.name}</span>
                      {item.no_sauce && (
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 text-[11px]"
                        >
                          不醬
                        </Badge>
                      )}
                      {item.additional !== null &&
                        item.additional !== undefined &&
                        restaurantAdditional &&
                        restaurantAdditional[item.additional] && (
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 text-[11px]"
                          >
                            {restaurantAdditional[item.additional]}
                          </Badge>
                        )}
                      {isActive &&
                        (currentUserId === item.user_id || isAdmin) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-3 py-0"
                            onClick={() => handleDelete(item.id)}
                          >
                            刪除
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              </ItemContent>
              <ItemActions>
                <div className="text-right font-medium">
                  <div className="text-lg text-muted-foreground">總計</div>
                  <div
                    className={`text-lg ${
                      isOver140
                        ? "font-bold text-yellow-600 dark:text-yellow-500"
                        : ""
                    }`}
                  >
                    NT$ {group.total.toLocaleString()}
                  </div>
                </div>
              </ItemActions>
            </Item>
          </div>
        )
      })}
    </ItemGroup>
  )
}
