import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 60 // Cache for 60 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // Get order count
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', id)
    .eq('status', 'closed')

  // Get total spending
  const { data: closedOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('restaurant_id', id)
    .eq('status', 'closed')

  let totalSpending = 0
  const itemCounts: Record<string, { count: number; total: number }> = {}

  if (closedOrders && closedOrders.length > 0) {
    const orderIds = closedOrders.map((o) => o.id)

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('menu_item_id, menu_items(price)')
      .in('order_id', orderIds)

    if (orderItems) {
      orderItems.forEach((item: any) => {
        const menuItemId = item.menu_item_id
        const price = parseFloat(String(item.menu_items?.price || 0))
        totalSpending += price

        if (!itemCounts[menuItemId]) {
          itemCounts[menuItemId] = { count: 0, total: 0 }
        }
        itemCounts[menuItemId].count += 1
        itemCounts[menuItemId].total += price
      })
    }
  }

  // Get menu items with counts and ratings (optimized: fetch all ratings at once)
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name, price')
    .eq('restaurant_id', id)

  // Fetch all ratings for all menu items in one query
  const menuItemIds = (menuItems || []).map((item) => item.id)
  const { data: allRatings } = await supabase
    .from('ratings')
    .select('menu_item_id, score')
    .in('menu_item_id', menuItemIds)

  // Calculate average ratings per menu item
  const ratingMap = new Map<string, number[]>()
  allRatings?.forEach((rating: any) => {
    if (!ratingMap.has(rating.menu_item_id)) {
      ratingMap.set(rating.menu_item_id, [])
    }
    ratingMap.get(rating.menu_item_id)!.push(rating.score)
  })

  const itemsWithStats = (menuItems || []).map((item) => {
    const stats = itemCounts[item.id] || { count: 0, total: 0 }
    const ratings = ratingMap.get(item.id) || []
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0

    return {
      ...item,
      order_count: stats.count,
      total_revenue: stats.total,
      average_rating: Math.round(avgRating * 10) / 10,
    }
  })

  return NextResponse.json({
    order_count: orderCount || 0,
    total_spending: totalSpending,
    items: itemsWithStats,
  })
}

