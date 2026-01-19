"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCachedFetch } from "@/lib/hooks/use-cached-fetch";
import { UserOrderCount } from "./user-order-count";
import { UserTopItems } from "./user-top-items";
import { UserTotalSpending } from "./user-total-spending";

interface UserStatsData {
  order_count: number;
  total_spending: number;
  top_restaurant_items: Array<{
    name: string;
    count: number;
  }>;
}

export function UserStats() {
  const { user } = useAuth();

  const { data: stats, loading } = useCachedFetch<UserStatsData>({
    cacheKey: `user_stats_${user?.id || "anonymous"}`,
    fetchFn: async () => {
      const res = await fetch("/api/me/stats");
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }
      return res.json();
    },
    skipCache: !user, // Skip cache if user is not logged in
  });

  if (!user) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserOrderCount value={stats?.order_count || 0} loading={loading} />
        <UserTotalSpending value={stats?.total_spending || 0} loading={loading} />
      </div>
      <UserTopItems
        data={stats?.top_restaurant_items || []}
        loading={loading}
      />
    </div>
  );
}
