import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 60;

interface RawStatsOrderItem {
  user_id: string;
  menu_items?: { price: number } | null;
}

interface RawStatsOrder {
  id: string;
  restaurant_id: string;
  status: string;
  created_at: string;
  closed_at: string | null;
  restaurants: { name: string } | null;
  order_items: RawStatsOrderItem[];
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from("bento_orders")
    .select(
      "id, restaurant_id, status, created_at, closed_at, restaurants:bento_menus(name), order_items:bento_order_items(user_id, menu_items:bento_menu_items(price))"
    )
    .eq("status", "closed")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Monthly spending summary
  const monthlyStats = new Map<
    string,
    {
      month: string;
      totalOrders: number;
      totalSpending: number;
      totalParticipants: number;
    }
  >();

  for (const order of (orders as unknown as RawStatsOrder[]) || []) {
    const date = new Date(order.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, {
        month: monthKey,
        totalOrders: 0,
        totalSpending: 0,
        totalParticipants: 0,
      });
    }

    const stats = monthlyStats.get(monthKey)!;
    stats.totalOrders += 1;

    const items = order.order_items || [];
    const users = new Set(items.map((i) => i.user_id));
    stats.totalParticipants += users.size;

    for (const item of items) {
      stats.totalSpending += parseFloat(
        String(item.menu_items?.price || 0)
      );
    }
  }

  // Restaurant frequency
  const restaurantFreq = new Map<string, { name: string; count: number }>();
  for (const order of (orders as unknown as RawStatsOrder[]) || []) {
    const name = order.restaurants?.name || "未知";
    const existing = restaurantFreq.get(name) || { name, count: 0 };
    existing.count += 1;
    restaurantFreq.set(name, existing);
  }

  const topRestaurants = Array.from(restaurantFreq.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    monthly: Array.from(monthlyStats.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    ),
    topRestaurants,
    totalOrders: (orders || []).length,
  });
}
