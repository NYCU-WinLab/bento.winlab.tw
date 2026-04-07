"use client"

import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "@/hooks/query-keys"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

function unwrapRelation<T>(val: T | T[]): T | null {
  if (Array.isArray(val)) return val[0] ?? null
  return val ?? null
}

export function useMenus() {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.menus.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bento_menus")
        .select("*, menu_items:bento_menu_items(*)")
        .order("name")

      if (error) throw error
      return data
    },
  })
}

export function useMenu(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.menus.detail(id!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bento_menus")
        .select("*, menu_items:bento_menu_items(*)")
        .eq("id", id!)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useMenuStats(id: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.menus.stats(id!),
    queryFn: async () => {
      const { count: orderCount } = await supabase
        .from("bento_orders")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", id!)
        .eq("status", "closed")

      const { data: closedOrders } = await supabase
        .from("bento_orders")
        .select("id")
        .eq("restaurant_id", id!)
        .eq("status", "closed")

      let totalSpending = 0
      const itemCounts: Record<string, { count: number; total: number }> = {}

      if (closedOrders && closedOrders.length > 0) {
        const orderIds = closedOrders.map((o) => o.id)

        const { data: orderItems } = await supabase
          .from("bento_order_items")
          .select("menu_item_id, menu_items:bento_menu_items(price)")
          .in("order_id", orderIds)

        if (orderItems) {
          for (const item of orderItems) {
            const menuItemId = item.menu_item_id
            const menuItem = unwrapRelation(item.menu_items)
            const price = parseFloat(String(menuItem?.price || 0))
            totalSpending += price

            if (!itemCounts[menuItemId]) {
              itemCounts[menuItemId] = { count: 0, total: 0 }
            }
            itemCounts[menuItemId].count += 1
            itemCounts[menuItemId].total += price
          }
        }
      }

      const { data: menuItems } = await supabase
        .from("bento_menu_items")
        .select("id, name, price")
        .eq("restaurant_id", id!)

      const menuItemIds = (menuItems || []).map((item) => item.id)
      const { data: allRatings } = await supabase
        .from("bento_ratings")
        .select("menu_item_id, score")
        .in("menu_item_id", menuItemIds)

      const ratingMap = new Map<string, number[]>()
      for (const rating of allRatings || []) {
        if (!ratingMap.has(rating.menu_item_id)) {
          ratingMap.set(rating.menu_item_id, [])
        }
        ratingMap.get(rating.menu_item_id)!.push(rating.score)
      }

      const items = (menuItems || []).map((item) => {
        const stats = itemCounts[item.id] || { count: 0, total: 0 }
        const ratings = ratingMap.get(item.id) || []
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0

        return {
          ...item,
          order_count: stats.count,
          total_revenue: stats.total,
          average_rating: Math.round(avgRating * 10) / 10,
        }
      })

      return {
        order_count: orderCount || 0,
        total_spending: totalSpending,
        items,
      }
    },
    enabled: !!id,
  })
}

interface MenuItemInput {
  id?: string
  name: string
  price: string | number
  type?: string | null
}

export function useCreateMenu() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name: string
      phone: string
      google_map_link?: string | null
      additional?: string[] | null
      menu_items?: MenuItemInput[]
    }) => {
      const { data: menu, error } = await supabase
        .from("bento_menus")
        .insert({
          name: params.name,
          phone: params.phone,
          google_map_link: params.google_map_link?.trim() || null,
          additional: params.additional || null,
        })
        .select()
        .single()

      if (error) throw error

      if (params.menu_items && params.menu_items.length > 0) {
        const items = params.menu_items
          .filter((item) => item.name && item.price)
          .map((item) => ({
            restaurant_id: menu.id,
            name: item.name.trim(),
            price:
              typeof item.price === "number"
                ? item.price
                : parseFloat(String(item.price)) || 0,
            type: item.type?.trim() || null,
          }))

        if (items.length > 0) {
          const { error: menuError } = await supabase
            .from("bento_menu_items")
            .insert(items)

          if (menuError) throw menuError
        }
      }

      return menu
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all })
    },
  })
}

export function useUpdateMenu(id: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      name?: string
      phone?: string
      google_map_link?: string | null
      additional?: string[] | null
      menu_items?: MenuItemInput[]
    }) => {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (params.name !== undefined) updatePayload.name = params.name
      if (params.phone !== undefined) updatePayload.phone = params.phone
      if (params.additional !== undefined)
        updatePayload.additional = params.additional
      if (params.google_map_link !== undefined) {
        updatePayload.google_map_link = params.google_map_link?.trim() || null
      }

      const { data: menu, error } = await supabase
        .from("bento_menus")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      if (params.menu_items) {
        const { data: existingItems } = await supabase
          .from("bento_menu_items")
          .select("id")
          .eq("restaurant_id", id)

        const existingIds = new Set(
          (existingItems || []).map((item) => item.id)
        )
        const itemsToUpdate: Array<{
          id: string
          name: string
          price: number
          type: string | null
        }> = []
        const itemsToInsert: Array<{
          restaurant_id: string
          name: string
          price: number
          type: string | null
        }> = []

        for (const item of params.menu_items) {
          const parsedPrice =
            typeof item.price === "number"
              ? item.price
              : parseFloat(String(item.price)) || 0
          const parsedType = item.type?.trim() || null

          if (item.id && existingIds.has(item.id)) {
            itemsToUpdate.push({
              id: item.id,
              name: item.name,
              price: parsedPrice,
              type: parsedType,
            })
          } else {
            itemsToInsert.push({
              restaurant_id: id,
              name: item.name,
              price: parsedPrice,
              type: parsedType,
            })
          }
        }

        for (const item of itemsToUpdate) {
          const { error: updateError } = await supabase
            .from("bento_menu_items")
            .update({ name: item.name, price: item.price, type: item.type })
            .eq("id", item.id)
          if (updateError) throw updateError
        }

        if (itemsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("bento_menu_items")
            .insert(itemsToInsert)
          if (insertError) throw insertError
        }
      }

      return menu
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.stats(id) })
    },
  })
}

export function useDeleteMenu(id: string) {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bento_menus").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all })
    },
  })
}
