"use client";

import { useAdminCheck } from "@/lib/hooks/use-admin-check";
import { useCachedFetch } from "@/lib/hooks/use-cached-fetch";
import { RestaurantCard } from "./restaurant-card";

interface Restaurant {
  id: string;
  name: string;
  phone: string;
  google_map_link?: string | null;
  created_at: string;
}

export function RestaurantList() {
  const { isAdminUser } = useAdminCheck();

  const {
    data: restaurants = [],
    loading,
    refetch,
    invalidateCache,
  } = useCachedFetch<Restaurant[]>({
    cacheKey: "restaurants",
    fetchFn: async () => {
      const res = await fetch("/api/menus");
      if (!res.ok) {
        throw new Error("Failed to fetch restaurants");
      }
      return res.json();
    },
  });

  const handleRestaurantUpdate = () => {
    invalidateCache();
    refetch();
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mx-2">店家列表</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {(restaurants || []).map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isAdmin={isAdminUser}
            onUpdate={handleRestaurantUpdate}
          />
        ))}
      </div>

      {(restaurants || []).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">尚無店家</div>
      )}
    </div>
  );
}
