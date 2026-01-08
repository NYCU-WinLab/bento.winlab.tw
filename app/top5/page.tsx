'use client'

import { TopSpenders } from '@/components/top-spenders'
import { TopVariety } from '@/components/top-variety'
import { TopParticipants } from '@/components/top-participants'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'

interface Top5Data {
  topSpenders: Array<{
    value: number
    users: Array<{
      userId: string
      userName: string
      avatarUrl: string | null
    }>
  }>
  topVariety: Array<{
    value: number
    users: Array<{
      userId: string
      userName: string
      avatarUrl: string | null
    }>
  }>
  topParticipants: Array<{
    value: number
    users: Array<{
      userId: string
      userName: string
      avatarUrl: string | null
    }>
  }>
}

export default function Top5Page() {
  const { data, loading } = useCachedFetch<Top5Data>({
    cacheKey: 'top5_rankings',
    fetchFn: async () => {
      const res = await fetch('/api/top5')
      if (!res.ok) {
        throw new Error('Failed to fetch top 5 rankings')
      }
      return res.json()
    },
    maxAge: 60 * 1000, // 1 minute cache
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">排名</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopSpenders data={data?.topSpenders || []} loading={loading} />
        <TopVariety data={data?.topVariety || []} loading={loading} />
        <TopParticipants data={data?.topParticipants || []} loading={loading} />
      </div>
    </div>
  )
}
