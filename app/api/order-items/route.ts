import { createClient } from '@/lib/supabase/server'
import { isAdminServer } from '@/lib/utils/admin'
import { safeParseBody, createOrderItemSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = await safeParseBody(request, createOrderItemSchema)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const body = parsed.data

  // Determine which user's order this item belongs to
  const targetUserId = body.target_user_id ?? user.id

  // Only admins may place orders on behalf of other users
  if (targetUserId !== user.id) {
    const admin = await isAdminServer(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }
  }

  const { data: orderItem, error } = await supabase
    .from('bento_order_items')
    .insert({
      order_id: body.order_id,
      menu_item_id: body.menu_item_id,
      user_id: targetUserId,
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
