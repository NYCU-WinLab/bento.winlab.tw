"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RankingGroup {
  value: number
  users: Array<{
    userId: string
    userName: string
    avatarUrl: string | null
  }>
}

interface TopRankingCardProps {
  title: string
  data: RankingGroup[]
  loading?: boolean
  formatValue: (value: number) => string
}

const rankStyles = {
  1: {
    badge:
      "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/50",
    glow: "shadow-[0_0_20px_rgba(250,204,21,0.6)]",
    scale: 1.05,
  },
  2: {
    badge:
      "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950 shadow-md shadow-gray-400/40",
    glow: "shadow-[0_0_15px_rgba(156,163,175,0.4)]",
    scale: 1.03,
  },
  3: {
    badge:
      "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 shadow-md shadow-amber-600/30",
    glow: "shadow-[0_0_10px_rgba(217,119,6,0.3)]",
    scale: 1.01,
  },
} as const

export function TopRankingCard({
  title,
  data,
  loading,
  formatValue,
}: TopRankingCardProps) {
  const [currentUserIndices, setCurrentUserIndices] = useState<number[]>([])

  useEffect(() => {
    if (data.length === 0) return
    setCurrentUserIndices(data.map(() => 0))

    const interval = setInterval(() => {
      setCurrentUserIndices((prev) =>
        prev.map((currentIndex, groupIndex) => {
          const group = data[groupIndex]
          if (group && group.users.length > 1) {
            return (currentIndex + 1) % group.users.length
          }
          return currentIndex
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-muted" />
                </div>
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((group, index) => {
              const rank = index + 1
              const isTopThree = rank <= 3
              const currentUserIndex = currentUserIndices[index] || 0
              const currentUser =
                group.users[currentUserIndex] || group.users[0]
              const hasMultipleUsers = group.users.length > 1
              const style = isTopThree ? rankStyles[rank as 1 | 2 | 3] : null

              return (
                <div
                  key={`${group.users[0]?.userId ?? index}-${rank}`}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-all ${
                    style?.glow || ""
                  } ${isTopThree ? "bg-background/50" : ""}`}
                >
                  <motion.div
                    animate={style ? { scale: [1, style.scale, 1] } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      style?.badge || "bg-primary/10 text-primary"
                    }`}
                  >
                    {rank}
                  </motion.div>

                  <div
                    className={`flex ${hasMultipleUsers ? "-space-x-2" : ""}`}
                  >
                    {hasMultipleUsers ? (
                      group.users.slice(0, 3).map((user) => (
                        <Avatar
                          key={user.userId}
                          className="h-8 w-8 ring-2 ring-background"
                        >
                          <AvatarImage
                            src={user.avatarUrl ?? undefined}
                            alt={user.userName}
                          />
                          <AvatarFallback>
                            {user.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))
                    ) : (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={currentUser.avatarUrl ?? undefined}
                          alt={currentUser.userName}
                        />
                        <AvatarFallback>
                          {currentUser.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div className="relative h-6 min-w-0 flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentUser.userId}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center"
                      >
                        <p className="truncate font-medium">
                          {currentUser.userName}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <p className="text-lg font-bold">
                    {formatValue(group.value)}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">尚無數據</p>
        )}
      </CardContent>
    </Card>
  )
}
