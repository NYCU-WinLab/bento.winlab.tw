"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCachedFetch } from "@/lib/hooks/use-cached-fetch";

interface MonthlyStats {
  month: string;
  totalOrders: number;
  totalSpending: number;
  totalParticipants: number;
}

interface StatsData {
  monthly: MonthlyStats[];
  topRestaurants: Array<{ name: string; count: number }>;
  totalOrders: number;
}

export function StatsDashboard() {
  const { data, loading } = useCachedFetch<StatsData>({
    cacheKey: "stats_dashboard",
    fetchFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mx-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const currentMonth = data.monthly[data.monthly.length - 1];
  const maxSpending = Math.max(
    ...data.monthly.map((m) => m.totalSpending),
    1
  );

  return (
    <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mx-2">統計儀表板</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">歷史訂單總數</p>
          <p className="text-3xl font-bold">{data.totalOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">本月消費</p>
          <p className="text-3xl font-bold">
            ${currentMonth?.totalSpending.toLocaleString() || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">本月訂單數</p>
          <p className="text-3xl font-bold">
            {currentMonth?.totalOrders || 0}
          </p>
        </Card>
      </div>

      {/* Monthly spending bar chart (pure CSS) */}
      {data.monthly.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">每月消費趨勢</h2>
          <div className="flex items-end gap-2 h-48">
            {data.monthly.slice(-12).map((m) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs text-muted-foreground">
                  ${m.totalSpending.toLocaleString()}
                </span>
                <div
                  className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all"
                  style={{
                    height: `${(m.totalSpending / maxSpending) * 100}%`,
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {m.month.slice(5)}月
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top restaurants */}
      {data.topRestaurants.length > 0 && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">最常訂購店家</h2>
          <div className="space-y-3">
            {data.topRestaurants.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="text-muted-foreground w-6 text-right text-sm">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.count} 次
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(r.count / data.topRestaurants[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
