"use client"

import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { queryKeys } from "@/hooks/query-keys"
import { useQuery } from "@tanstack/react-query"

export function useAdmin() {
  const { user } = useAuth()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.status,
    queryFn: async () => {
      if (!user) return null
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("roles")
        .eq("id", user.id)
        .single()
      return profile
    },
    enabled: !!user,
  })

  const isAdmin =
    !!data?.roles &&
    typeof data.roles === "object" &&
    Array.isArray((data.roles as Record<string, string[]>).bento) &&
    (data.roles as Record<string, string[]>).bento.includes("admin")

  return { isAdmin, isLoading }
}
