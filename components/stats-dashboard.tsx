"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useCachedFetch } from "@/lib/hooks/use-cached-fetch";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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

  const chartConfig = {
    totalSpending: {
      label: "消費",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const chartData = data.monthly.slice(-12).map((m) => ({
    month: `${m.month.slice(5)}月`,
    totalSpending: m.totalSpending,
  }));

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
            ${(currentMonth?.totalSpending ?? 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">本月訂單數</p>
          <p className="text-3xl font-bold">
            {currentMonth?.totalOrders || 0}
          </p>
        </Card>
      </div>

      {/* Monthly spending area chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>每月消費趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="fillSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-totalSpending)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-totalSpending)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v) => `$${(v as number).toLocaleString()}`}
                  width={70}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        `$${(value as number).toLocaleString()}`
                      }
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="totalSpending"
                  stroke="var(--color-totalSpending)"
                  strokeWidth={2}
                  fill="url(#fillSpending)"
                  dot={{ r: 4, fill: "var(--color-totalSpending)" }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
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
