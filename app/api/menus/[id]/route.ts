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
  const { data: menu, error } = await supabase
    .from('bento_menus')
    .select('*, menu_items:bento_menu_items(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!menu) {
    return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
  }

  return NextResponse.json(menu)
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

    const { data: menu, error } = await supabase
      .from('bento_menus')
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
      await supabase.from('bento_menu_items').delete().eq('restaurant_id', id)

      // Insert new menu items
      if (body.menu_items.length > 0) {
        const menuItems = body.menu_items.map((item: { name: string; price: string | number }) => ({
          restaurant_id: id,
          name: item.name,
          price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0,
        }))

        const { error: menuError } = await supabase
          .from('bento_menu_items')
          .insert(menuItems)

        if (menuError) {
          return NextResponse.json({ error: menuError.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json(menu)
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

    // Check if menu has active orders
    const { data: activeOrders } = await supabase
      .from('bento_orders')
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

    const { error } = await supabase.from('bento_menus').delete().eq('id', id)

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

