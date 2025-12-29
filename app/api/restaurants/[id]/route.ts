import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/utils/admin'

export const revalidate = 60 // Cache for 60 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Use maybeSingle() to avoid 500 error when no rows are returned
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*, menu_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching restaurant:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
  }

  return NextResponse.json(restaurant)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .update({
        name: body.name,
        phone: body.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update menu items if provided
    if (body.menu_items && Array.isArray(body.menu_items)) {
      // Delete existing menu items
      await supabase.from('menu_items').delete().eq('restaurant_id', id)

      // Insert new menu items
      if (body.menu_items.length > 0) {
        const menuItems = body.menu_items.map((item: { name: string; price: string }) => ({
          restaurant_id: id,
          name: item.name,
          price: parseFloat(item.price) || 0,
        }))

        const { error: menuError } = await supabase
          .from('menu_items')
          .insert(menuItems)

        if (menuError) {
          return NextResponse.json({ error: menuError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json(restaurant)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 403 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = await createClient()

    // Check if restaurant has active orders
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', id)
      .eq('status', 'active')
      .limit(1)

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json(
        { error: '無法刪除店家：仍有進行中的訂單' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('restaurants').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 403 }
    )
  }
}

