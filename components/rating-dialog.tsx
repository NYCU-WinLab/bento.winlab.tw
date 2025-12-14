'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Star } from 'lucide-react'
import { useSupabase } from '@/components/providers/supabase-provider'

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
  const [userRating, setUserRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useSupabase()

  useEffect(() => {
    if (open && user) {
      fetchUserRating()
    }
  }, [open, menuItemId, user])

  const fetchUserRating = async () => {
    try {
      const res = await fetch(`/api/ratings/${menuItemId}`)
      const data = await res.json()
      if (data.user_rating) {
        setUserRating(data.user_rating.score)
        setRating(data.user_rating.score)
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
    }
  }

  const handleSubmit = async () => {
    if (!user || rating === 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_item_id: menuItemId,
          score: rating,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit rating')
      }

      setOpen(false)
      setUserRating(rating)
      onRatingSubmitted?.()
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('評分失敗')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button onClick={handleSubmit} disabled={loading || rating === 0}>
            {loading ? '提交中...' : '提交'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

