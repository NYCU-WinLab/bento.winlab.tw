import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if the order item belongs to the user
  const { data: orderItem, error: fetchError } = await supabase
    .from('order_items')
    .select('user_id, order_id')
    .eq('id', id)
    .single()

  if (fetchError || !orderItem) {
    return NextResponse.json({ error: 'Order item not found' }, { status: 404 })
  }

  if (orderItem.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check if order is still active
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderItem.order_id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status !== 'active') {
    return NextResponse.json({ error: 'Cannot delete item from closed order' }, { status: 400 })
  }

  const { error } = await supabase.from('order_items').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

