'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useMyRating, useRate } from '@/hooks/use-ratings'

export function RatingDialog({
  menuItemId,
  menuItemName,
  onRatingSubmitted,
}: {
  menuItemId: string
  menuItemName: string
  onRatingSubmitted?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const { user } = useAuth()
  const { data: myRating } = useMyRating(open ? menuItemId : undefined)
  const rate = useRate()

  const userRating = myRating?.score ?? null

  const handleOpen = (value: boolean) => {
    setOpen(value)
    if (value && userRating) {
      setRating(userRating)
    }
  }

  const handleSubmit = async () => {
    if (!user || rating === 0) return

    try {
      await rate.mutateAsync({
        menu_item_id: menuItemId,
        score: rating,
      })
      setOpen(false)
      onRatingSubmitted?.()
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('評分失敗')
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Star className="w-4 h-4 mr-1" />
          {userRating ? `${userRating} 星` : '評分'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>評分：{menuItemName}</DialogTitle>
          <DialogDescription>選擇 1-5 星評分</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setRating(score)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    score <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-4 text-sm text-muted-foreground">
              您選擇了 {rating} 星
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={rate.isPending || rating === 0}>
            {rate.isPending ? '提交中...' : '提交'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
