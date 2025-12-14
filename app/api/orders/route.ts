import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'

export const revalidate = 10 // Cache for 10 seconds (orders change frequently)

export async function GET() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, restaurants(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        restaurant_id: body.restaurant_id,
        status: 'active',
        created_by: user.id,
        auto_close_at: body.auto_close_at || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 403 }
    )
  }
}

