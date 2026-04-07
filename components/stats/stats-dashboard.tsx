"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useGlobalStats } from "@/hooks/use-stats"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function StatsDashboard() {
  const { data, isLoading } = useGlobalStats()

  if (isLoading && !data) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
        <Skeleton className="mx-2 h-8 w-48 rounded-md" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentMonth = data.monthly[data.monthly.length - 1]

  const chartConfig = {
    totalSpending: {
      label: "消費",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const chartData = data.monthly.slice(-12).map((m) => ({
    month: `${m.month.slice(5)}月`,
    totalSpending: m.totalSpending,
  }))

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4">
      <h1 className="mx-2 text-2xl font-bold">統計儀表板</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>歷史訂單總數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>本月消費</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${(currentMonth?.totalSpending ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>本月訂單數</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {currentMonth?.totalOrders || 0}
            </p>
          </CardContent>
        </Card>
      </div>

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

      {data.topRestaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最常訂購店家</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topRestaurants.map((r, i) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-6 text-right text-sm text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {r.count} 次
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(r.count / data.topRestaurants[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
