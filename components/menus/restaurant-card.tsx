"use client"

import { useDeleteMenu, useMenu, useMenuStats } from "@/hooks/use-menus"
import { ExternalLink, Trash2 } from "lucide-react"
import { useState } from "react"
import { EditRestaurantDialog } from "./edit-restaurant-dialog"
import { RestaurantStats } from "./restaurant-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface MenuItem {
  id: string
  name: string
  price: number
  type?: string | null
  order_count?: number
  average_rating?: number
}

interface Restaurant {
  id: string
  name: string
  phone: string
  google_map_link?: string | null
  created_at: string
  additional?: string[] | null
}

interface RestaurantStatsItem {
  id: string
  name: string
  order_count: number
  total_revenue: number
  average_rating: number
}

export function RestaurantCard({
  restaurant,
  isAdmin,
}: {
  restaurant: Restaurant
  isAdmin: boolean
}) {
  const { data: restaurantData, isLoading: menuLoading } = useMenu(
    restaurant.id
  )
  const { data: stats, isLoading: statsLoading } = useMenuStats(restaurant.id)
  const deleteMenu = useDeleteMenu(restaurant.id)

  const menuItems = restaurantData?.menu_items || []
  const loading = menuLoading || statsLoading

  const handleDelete = async () => {
    if (
      !confirm(
        `確定要刪除「${restaurant.name}」嗎？\n\n此操作將刪除所有相關的品項和訂單記錄，且無法復原。`
      )
    ) {
      return
    }

    try {
      await deleteMenu.mutateAsync()
    } catch (error) {
      console.error("Error deleting restaurant:", error)
      alert(error instanceof Error ? error.message : "刪除店家失敗")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {restaurant.google_map_link && (
                <a
                  href={restaurant.google_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Google 地圖
                </a>
              )}
              <span>
                電話：
                <a
                  href={`tel:${restaurant.phone}`}
                  className="text-primary hover:underline"
                >
                  {restaurant.phone}
                </a>
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex animate-in items-center gap-2 duration-200 fade-in slide-in-from-right-2">
              <EditRestaurantDialog
                restaurant={restaurant}
                menuItems={menuItems}
                onSuccess={() => {}}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMenu.isPending}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                {deleteMenu.isPending ? "刪除中..." : "刪除"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-base text-muted-foreground">結單次數</p>
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
              <div>
                <p className="mb-1 text-base text-muted-foreground">總消費</p>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border px-4 py-2"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20 rounded-md" />
                        <Skeleton className="h-4 w-16 rounded-md" />
                      </div>
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {stats && <RestaurantStats stats={stats} />}
            <div className="mt-4">
              <div className="space-y-2">
                {menuItems
                  .slice()
                  .sort((a: any, b: any) => {
                    const aStats =
                      stats?.items.find((i: any) => i.id === a.id) || null
                    const bStats =
                      stats?.items.find((i: any) => i.id === b.id) || null
                    const aCount = aStats?.order_count || 0
                    const bCount = bStats?.order_count || 0
                    if (aCount !== bCount) {
                      return bCount - aCount
                    }
                    return b.price - a.price
                  })
                  .map((item: any) => {
                    const stat =
                      stats?.items.find((i: any) => i.id === item.id) || null
                    const orderCount = stat?.order_count || 0
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border px-4 py-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-sm text-muted-foreground">
                              NT$ {item.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            被點 {orderCount} 次
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
