"use client";

import { TopRankingCard } from "./top-ranking-card";

interface TopVarietyGroup {
  value: number;
  users: Array<{
    userId: string;
    userName: string;
    avatarUrl: string | null;
  }>;
}

interface TopVarietyProps {
  data: TopVarietyGroup[];
  loading?: boolean;
}

export function TopVariety({ data, loading }: TopVarietyProps) {
  return (
    <TopRankingCard
      title="點餐總類最多"
      data={data}
      loading={loading}
      formatValue={(v) => `${v} 種`}
    />
  );
}
