"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/hooks/use-admin";
import { useMenus } from "@/hooks/use-menus";
import { Search } from "lucide-react";
import { useState } from "react";
import { RestaurantCard } from "./restaurant-card";

export function RestaurantList() {
  const { isAdmin } = useAdmin();
  const { data: restaurants, isLoading } = useMenus();
  const [search, setSearch] = useState("");

  const filtered = (restaurants ?? []).filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading && !restaurants) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-24 mx-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mx-2">店家列表</h1>

      <div className="relative mx-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="搜尋店家..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filtered.map((restaurant: any) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "找不到符合的店家" : "尚無店家"}
        </div>
      )}
    </div>
  );
}
