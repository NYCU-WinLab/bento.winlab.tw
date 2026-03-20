import { createClient, createServiceClient } from '@/lib/supabase/server'
import { safeParseBody, createAnonymousOrderItemSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const parsed = await safeParseBody(request, createAnonymousOrderItemSchema)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const body = parsed.data

  // Verify the order exists and is active
  const supabase = await createClient()
  const { data: order, error: orderError } = await supabase
    .from('bento_orders')
    .select('id, status')
    .eq('id', body.order_id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 })
  }

  if (order.status !== 'active') {
    return NextResponse.json({ error: '訂單已關閉，無法新增' }, { status: 400 })
  }

  // Use service role client to bypass RLS for anonymous insert
  const serviceClient = createServiceClient()

  const { data: orderItem, error } = await serviceClient
    .from('bento_order_items')
    .insert({
      order_id: body.order_id,
      menu_item_id: body.menu_item_id,
      user_id: null,
      anonymous_name: body.anonymous_name.trim(),
      no_sauce: body.no_sauce || false,
      additional: body.additional !== undefined ? body.additional : null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(orderItem, { status: 201 })
}
