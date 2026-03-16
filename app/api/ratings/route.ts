import { createClient } from '@/lib/supabase/server'
import { safeParseBody, createRatingSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = await safeParseBody(request, createRatingSchema)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const body = parsed.data

  // Upsert rating (update if exists, insert if not)
  const { data: rating, error } = await supabase
    .from('bento_ratings')
    .upsert(
      {
        menu_item_id: body.menu_item_id,
        user_id: user.id,
        score: body.score,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'menu_item_id,user_id',
      }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(rating, { status: 201 })
}
