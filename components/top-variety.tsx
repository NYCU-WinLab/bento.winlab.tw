"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
  const [currentUserIndices, setCurrentUserIndices] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean[]>([]);

  // Initialize and rotate users for groups with multiple users
  useEffect(() => {
    if (data.length > 0) {
      setCurrentUserIndices(data.map(() => 0));
      setIsTransitioning(data.map(() => false));

      // Rotate users every 3 seconds
      const interval = setInterval(() => {
        setCurrentUserIndices((prev) =>
          prev.map((currentIndex, groupIndex) => {
            const group = data[groupIndex];
            if (group && group.users.length > 1) {
              setIsTransitioning((prevTransitioning) => {
                const newTransitioning = [...prevTransitioning];
                newTransitioning[groupIndex] = true;
                return newTransitioning;
              });

              setTimeout(() => {
                setIsTransitioning((prevTransitioning) => {
                  const newTransitioning = [...prevTransitioning];
                  newTransitioning[groupIndex] = false;
                  return newTransitioning;
                });
              }, 600);

              return (currentIndex + 1) % group.users.length;
            }
            return currentIndex;
          })
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>點餐總類最多</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>點餐總類最多</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.map((group, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              const currentUserIndex = currentUserIndices[index] || 0;
              const currentUser =
                group.users[currentUserIndex] || group.users[0];
              const hasMultipleUsers = group.users.length > 1;

              // 前三名的特殊樣式
              const rankStyles = {
                1: {
                  badge:
                    "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/50",
                  glow: "shadow-[0_0_20px_rgba(250,204,21,0.6)]",
                  scale: 1.05,
                  pulse: true,
                },
                2: {
                  badge:
                    "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950 shadow-md shadow-gray-400/40",
                  glow: "shadow-[0_0_15px_rgba(156,163,175,0.4)]",
                  scale: 1.03,
                  pulse: true,
                },
                3: {
                  badge:
                    "bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 shadow-md shadow-amber-600/30",
                  glow: "shadow-[0_0_10px_rgba(217,119,6,0.3)]",
                  scale: 1.01,
                  pulse: true,
                },
              } as const;

              const style = isTopThree ? rankStyles[rank as 1 | 2 | 3] : null;

              return (
                <div
                  key={`${group.value}-${rank}`}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                    style?.glow || ""
                  } ${isTopThree ? "bg-background/50" : ""}`}
                >
                  <motion.div
                    animate={
                      style?.pulse
                        ? {
                            scale: [1, style.scale, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                      style?.badge || "bg-primary/10 text-primary"
                    }`}
                  >
                    {rank}
                  </motion.div>

                  {/* Avatar with overlapping effect for multiple users */}
                  <div
                    className={`flex ${hasMultipleUsers ? "-space-x-2" : ""}`}
                  >
                    {hasMultipleUsers ? (
                      // Show max 3 avatars with overlap
                      group.users.slice(0, 3).map((user, userIdx) => (
                        <Avatar
                          key={user.userId}
                          className="w-8 h-8 ring-2 ring-background"
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
                      // Single avatar
                      <Avatar className="w-8 h-8">
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

                  {/* Name with scroll animation */}
                  <div className="flex-1 min-w-0 relative h-6 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentUser.userId}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center"
                      >
                        <p className="font-medium truncate">
                          {currentUser.userName}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <p className="font-bold text-lg">{group.value} 種</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">尚無數據</p>
        )}
      </CardContent>
    </Card>
  );
}
