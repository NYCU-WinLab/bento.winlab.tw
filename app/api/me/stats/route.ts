import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get order count
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('order_id, menu_item_id, menu_items(price, name, restaurant_id)')
    .eq('user_id', user.id)

  // Get restaurant names separately
  const restaurantIds = new Set<string>()
  orderItems?.forEach((item: any) => {
    if (item.menu_items?.restaurant_id) {
      restaurantIds.add(item.menu_items.restaurant_id)
    }
  })

  let restaurantMap = new Map<string, string>()
  if (restaurantIds.size > 0) {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name')
      .in('id', Array.from(restaurantIds))

    if (restaurants) {
      restaurantMap = new Map(restaurants.map((r: any) => [r.id, r.name]))
    }
  }

  const orderIds = new Set<string>()
  let totalSpending = 0
  const itemCounts: Record<string, { name: string; count: number }> = {}
  const restaurantCounts: Record<string, { name: string; count: number }> = {}

  orderItems?.forEach((item: any) => {
    orderIds.add(item.order_id)
    const price = parseFloat(String(item.menu_items?.price || 0))
    totalSpending += price

    // Count items
    const menuItemId = item.menu_item_id
    if (!itemCounts[menuItemId]) {
      itemCounts[menuItemId] = {
        name: item.menu_items?.name || '',
        count: 0,
      }
    }
    itemCounts[menuItemId].count += 1

    // Count restaurants
    const restaurantId = item.menu_items?.restaurant_id
    if (restaurantId) {
      if (!restaurantCounts[restaurantId]) {
        restaurantCounts[restaurantId] = {
          name: restaurantMap.get(restaurantId) || '',
          count: 0,
        }
      }
      restaurantCounts[restaurantId].count += 1
    }
  })

  // Get top 3 items
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Get top 3 restaurants
  const topRestaurants = Object.values(restaurantCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return NextResponse.json({
    order_count: orderIds.size,
    total_spending: totalSpending,
    top_items: topItems,
    top_restaurants: topRestaurants,
  })
}

