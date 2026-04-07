"use client"

import { TopParticipants } from "@/components/rankings/top-participants"
import { TopSpenders } from "@/components/rankings/top-spenders"
import { TopVariety } from "@/components/rankings/top-variety"
import { useRankings } from "@/hooks/use-stats"

export default function RankPage() {
  const { data, isLoading } = useRankings()

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4">
      <h1 className="mx-2 text-2xl font-bold">排名</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TopSpenders data={data?.topSpenders || []} loading={isLoading} />
        <TopVariety data={data?.topVariety || []} loading={isLoading} />
        <TopParticipants
          data={data?.topParticipants || []}
          loading={isLoading}
        />
      </div>
    </div>
  )
}
