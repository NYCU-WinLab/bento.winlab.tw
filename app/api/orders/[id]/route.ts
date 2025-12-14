import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 5 // Cache for 5 seconds (order details change frequently)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, restaurants(*), order_items(*, menu_items(*))')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch user profiles for order items in parallel
  if (order && order.order_items) {
    const userIds = [...new Set(order.order_items.map((item: any) => item.user_id))]
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .in('id', userIds)

      if (profiles) {
        const profileMap = new Map(profiles.map((p: any) => [p.id, p]))
        order.order_items = order.order_items.map((item: any) => ({
          ...item,
          user: profileMap.get(item.user_id) || { name: null, email: item.user_id },
        }))
      } else {
        order.order_items = order.order_items.map((item: any) => ({
          ...item,
          user: { name: null, email: item.user_id },
        }))
      }
    }
  }

  return NextResponse.json(order)
}

