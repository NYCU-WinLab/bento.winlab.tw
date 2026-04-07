"use client"

import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "@/hooks/query-keys"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useRatings(menuItemId: string | undefined) {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.ratings.byItem(menuItemId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bento_ratings")
        .select("*")
        .eq("menu_item_id", menuItemId!)

      if (error) throw error

      const average =
        data && data.length > 0
          ? data.reduce((sum, r) => sum + r.score, 0) / data.length
          : 0

      return {
        ratings: data,
        average: Math.round(average * 10) / 10,
        count: data?.length || 0,
      }
    },
    enabled: !!menuItemId,
  })
}

export function useMyRating(menuItemId: string | undefined) {
  const { user } = useAuth()
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.ratings.myRating(menuItemId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bento_ratings")
        .select("*")
        .eq("menu_item_id", menuItemId!)
        .eq("user_id", user!.id)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!menuItemId && !!user,
  })
}

export function useRate() {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { menu_item_id: string; score: number }) => {
      if (!user) throw new Error("Unauthorized")

      const { data, error } = await supabase
        .from("bento_ratings")
        .upsert(
          {
            menu_item_id: params.menu_item_id,
            user_id: user.id,
            score: params.score,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "menu_item_id,user_id" }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.ratings.byItem(variables.menu_item_id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.ratings.myRating(variables.menu_item_id),
      })
    },
  })
}
