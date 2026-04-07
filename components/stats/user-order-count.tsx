"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface UserOrderCountProps {
  value: number
  loading?: boolean
}

export function UserOrderCount({ value, loading }: UserOrderCountProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>參與訂單數</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20 rounded-md" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>參與訂單數</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
