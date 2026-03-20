import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isAdminServer } from '@/lib/utils/admin'
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

  // Check if the order item exists
  const { data: orderItem, error: fetchError } = await supabase
    .from('bento_order_items')
    .select('user_id, order_id')
    .eq('id', id)
    .single()

  if (fetchError || !orderItem) {
    return NextResponse.json({ error: 'Order item not found' }, { status: 404 })
  }

  // Allow deletion if: item belongs to user, OR user is admin
  const isOwner = orderItem.user_id === user.id
  if (!isOwner) {
    const admin = await isAdminServer(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Check if order is still active
  const { data: order, error: orderError } = await supabase
    .from('bento_orders')
    .select('status')
    .eq('id', orderItem.order_id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status !== 'active') {
    return NextResponse.json({ error: 'Cannot delete item from closed order' }, { status: 400 })
  }

  // Use service client for admin deleting others' items (RLS: auth.uid() = user_id)
  const deleteClient = isOwner ? supabase : createServiceClient()
  const { error } = await deleteClient.from('bento_order_items').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

