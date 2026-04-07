"use client";

import { TopRankingCard } from "./top-ranking-card";

interface TopParticipantGroup {
  value: number;
  users: Array<{
    userId: string;
    userName: string;
    avatarUrl: string | null;
  }>;
}

interface TopParticipantsProps {
  data: TopParticipantGroup[];
  loading?: boolean;
}

export function TopParticipants({ data, loading }: TopParticipantsProps) {
  return (
    <TopRankingCard
      title="參與次數最多"
      data={data}
      loading={loading}
      formatValue={(v) => `${v} 次`}
    />
  );
}
