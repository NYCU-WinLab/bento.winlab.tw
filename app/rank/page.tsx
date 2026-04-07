"use client";

import { TopParticipants } from "@/components/top-participants";
import { TopSpenders } from "@/components/top-spenders";
import { TopVariety } from "@/components/top-variety";
import { useRankings } from "@/hooks/use-stats";

export default function RankPage() {
  const { data, isLoading } = useRankings();

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mx-2">排名</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopSpenders data={data?.topSpenders || []} loading={isLoading} />
        <TopVariety data={data?.topVariety || []} loading={isLoading} />
        <TopParticipants data={data?.topParticipants || []} loading={isLoading} />
      </div>
    </div>
  );
}
