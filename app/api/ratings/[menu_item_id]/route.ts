import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ menu_item_id: string }> }
) {
  const { menu_item_id } = await params
  const supabase = await createClient()

  const { data: ratings, error } = await supabase
    .from('bento_ratings')
    .select('*')
    .eq('menu_item_id', menu_item_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get current user's rating if logged in
  const { data: { user } } = await supabase.auth.getUser()
  let userRating = null

  if (user) {
    const { data } = await supabase
      .from('bento_ratings')
      .select('*')
      .eq('menu_item_id', menu_item_id)
      .eq('user_id', user.id)
      .single()

    userRating = data
  }

  // Calculate average
  const average =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0

  return NextResponse.json({
    ratings,
    user_rating: userRating,
    average: Math.round(average * 10) / 10,
    count: ratings?.length || 0,
  })
}

