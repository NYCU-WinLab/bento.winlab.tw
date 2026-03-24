"use client";

import { TopRankingCard } from "./top-ranking-card";

interface TopSpenderGroup {
  value: number;
  users: Array<{
    userId: string;
    userName: string;
    avatarUrl: string | null;
  }>;
}

interface TopSpendersProps {
  data: TopSpenderGroup[];
  loading?: boolean;
}

export function TopSpenders({ data, loading }: TopSpendersProps) {
  return (
    <TopRankingCard
      title="花費最多"
      data={data}
      loading={loading}
      formatValue={(v) => `NT$ ${v.toLocaleString()}`}
    />
  );
}
