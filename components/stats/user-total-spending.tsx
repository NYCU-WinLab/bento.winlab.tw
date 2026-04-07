"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface UserTotalSpendingProps {
  value: number
  loading?: boolean
}

export function UserTotalSpending({ value, loading }: UserTotalSpendingProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>總計消費</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-32 rounded-md" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>總計消費</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">NT$ {value.toLocaleString()}</p>
      </CardContent>
    </Card>
  )
}
