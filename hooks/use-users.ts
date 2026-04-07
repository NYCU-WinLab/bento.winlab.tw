"use client"

import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "@/hooks/query-keys"
import { useQuery } from "@tanstack/react-query"

export function useUsers() {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id, name")
        .order("name")

      if (error) throw error
      return data as { id: string; name: string | null }[]
    },
  })
}
