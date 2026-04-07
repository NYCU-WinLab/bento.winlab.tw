"use client"

import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "@/hooks/query-keys"
import { useQuery } from "@tanstack/react-query"

function unwrapRelation<T>(val: T | T[]): T | null {
  if (Array.isArray(val)) return val[0] ?? null
  return val ?? null
}

export function useGlobalStats() {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.stats.global,
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('bento_orders')
        .select(
          'id, restaurant_id, status, created_at, closed_at, restaurants:bento_menus(name), order_items:bento_order_items(user_id, menu_items:bento_menu_items(price))'
        )
        .eq('status', 'closed')
        .order('created_at', { ascending: false })

      if (error) throw error

      const monthlyStats = new Map<string, {
        month: string
        totalOrders: number
        totalSpending: number
        totalParticipants: number
      }>()

      for (const order of orders || []) {
        const date = new Date(order.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        if (!monthlyStats.has(monthKey)) {
          monthlyStats.set(monthKey, {
            month: monthKey,
            totalOrders: 0,
            totalSpending: 0,
            totalParticipants: 0,
          })
        }

        const stats = monthlyStats.get(monthKey)!
        stats.totalOrders += 1

        const items = order.order_items || []
        const users = new Set(items.map((i) => i.user_id))
        stats.totalParticipants += users.size

        for (const item of items) {
          const menuItem = unwrapRelation(item.menu_items)
          stats.totalSpending += parseFloat(String(menuItem?.price || 0))
        }
      }

      const restaurantFreq = new Map<string, { name: string; count: number }>()
      for (const order of orders || []) {
        const restaurant = unwrapRelation(order.restaurants)
        const name = restaurant?.name || '未知'
        const existing = restaurantFreq.get(name) || { name, count: 0 }
        existing.count += 1
        restaurantFreq.set(name, existing)
      }

      const topRestaurants = Array.from(restaurantFreq.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        monthly: Array.from(monthlyStats.values()).sort((a, b) =>
          a.month.localeCompare(b.month)
        ),
        topRestaurants,
        totalOrders: (orders || []).length,
      }
    },
  })
}

export function useRankings() {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.stats.rankings,
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from('bento_order_items')
        .select(
          'user_id, menu_item_id, order_id, menu_items:bento_menu_items(price, name)'
        )

      if (error) throw error

      const userIds = new Set<string>()
      for (const item of orderItems || []) {
        if (item.user_id) userIds.add(item.user_id)
      }

      const userProfilesMap = new Map<string, { id: string; name: string | null; avatarUrl: string | null }>()
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, name')
          .in('id', Array.from(userIds))

        for (const profile of (profiles || []) as { id: string; name: string | null }[]) {
          userProfilesMap.set(profile.id, { id: profile.id, name: profile.name, avatarUrl: null })
        }
      }

      const userStats = new Map<string, {
        userId: string
        userName: string | null
        totalSpending: number
        uniqueMenuItems: Set<string>
        orderIds: Set<string>
      }>()

      for (const item of orderItems || []) {
        const userId = item.user_id
        if (!userId) continue

        if (!userStats.has(userId)) {
          const profile = userProfilesMap.get(userId)
          userStats.set(userId, {
            userId,
            userName: profile?.name || null,
            totalSpending: 0,
            uniqueMenuItems: new Set(),
            orderIds: new Set(),
          })
        }

        const stats = userStats.get(userId)!
        const menuItem = unwrapRelation(item.menu_items)
        stats.totalSpending += parseFloat(String(menuItem?.price || 0))
        if (item.menu_item_id) stats.uniqueMenuItems.add(item.menu_item_id)
        if (item.order_id) stats.orderIds.add(item.order_id)
      }

      const allUsers = Array.from(userStats.values())

      const groupByValue = (
        users: typeof allUsers,
        getValue: (u: typeof allUsers[number]) => number
      ) => {
        const valueMap = new Map<number, Array<{ userId: string; userName: string; avatarUrl: string | null }>>()
        for (const user of users) {
          const value = getValue(user)
          if (!valueMap.has(value)) valueMap.set(value, [])
          const profile = userProfilesMap.get(user.userId)
          valueMap.get(value)!.push({
            userId: user.userId,
            userName: user.userName || '未知',
            avatarUrl: profile?.avatarUrl || null,
          })
        }
        return Array.from(valueMap.entries())
          .sort((a, b) => b[0] - a[0])
          .slice(0, 5)
          .map(([value, users]) => ({ value, users }))
      }

      return {
        topSpenders: groupByValue(allUsers, (u) => u.totalSpending),
        topVariety: groupByValue(allUsers, (u) => u.uniqueMenuItems.size),
        topParticipants: groupByValue(allUsers, (u) => u.orderIds.size),
      }
    },
  })
}

export function useMyStats() {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.stats.my,
    queryFn: async () => {
      const { data: orderItems, error } = await supabase
        .from('bento_order_items')
        .select('order_id, menu_item_id, menu_items:bento_menu_items(price, name, restaurant_id)')
        .eq('user_id', user!.id)

      if (error) throw error

      const restaurantIds = new Set<string>()
      for (const item of orderItems || []) {
        const menuItem = unwrapRelation(item.menu_items)
        if (menuItem?.restaurant_id) {
          restaurantIds.add(menuItem.restaurant_id)
        }
      }

      let restaurantMap = new Map<string, string>()
      if (restaurantIds.size > 0) {
        const { data: restaurants } = await supabase
          .from('bento_menus')
          .select('id, name')
          .in('id', Array.from(restaurantIds))

        if (restaurants) {
          restaurantMap = new Map(
            (restaurants as { id: string; name: string }[]).map((r) => [r.id, r.name])
          )
        }
      }

      const orderIdSet = new Set<string>()
      let totalSpending = 0
      const restaurantItemCounts: Record<string, { name: string; count: number }> = {}

      for (const item of orderItems || []) {
        orderIdSet.add(item.order_id)
        const menuItem = unwrapRelation(item.menu_items)
        totalSpending += parseFloat(String(menuItem?.price || 0))

        const restaurantId = menuItem?.restaurant_id
        const menuItemName = menuItem?.name || ''
        const restaurantName = restaurantId ? (restaurantMap.get(restaurantId) || '') : ''

        if (restaurantName && menuItemName) {
          const key = `${restaurantId}_${item.menu_item_id}`
          if (!restaurantItemCounts[key]) {
            restaurantItemCounts[key] = { name: `${restaurantName} ${menuItemName}`, count: 0 }
          }
          restaurantItemCounts[key].count += 1
        }
      }

      const topRestaurantItems = Object.values(restaurantItemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        order_count: orderIdSet.size,
        total_spending: totalSpending,
        top_restaurant_items: topRestaurantItems,
      }
    },
    enabled: !!user,
  })
}
