import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Upsert rating (update if exists, insert if not)
  const { data: rating, error } = await supabase
    .from('ratings')
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

