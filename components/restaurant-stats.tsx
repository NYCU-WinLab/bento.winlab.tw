'use client'

interface RestaurantStatsData {
  order_count: number
  total_spending: number
  items: Array<{
    id: string
    name: string
    order_count: number
    total_revenue: number
    average_rating: number
  }>
}

export function RestaurantStats({ stats }: { stats: RestaurantStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <p className="text-sm text-muted-foreground">結單次數</p>
        <p className="text-2xl font-bold">{stats.order_count}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">總消費</p>
        <p className="text-2xl font-bold">NT$ {stats.total_spending.toLocaleString()}</p>
      </div>
    </div>
  )
}

