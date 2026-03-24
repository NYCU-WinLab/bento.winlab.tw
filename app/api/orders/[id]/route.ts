import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/utils/admin";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("bento_orders")
    .select(
      "*, restaurants:bento_menus(*), order_items:bento_order_items(*, menu_items:bento_menu_items(*))"
    )
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch user profiles for order items in parallel
  interface RawDetailItem {
    user_id: string | null
    anonymous_name: string | null
    [key: string]: unknown
  }

  if (order && order.order_items) {
    const userIds = [
      ...new Set(
        (order.order_items as RawDetailItem[])
          .map((item) => item.user_id)
          .filter((id): id is string => id !== null)
      ),
    ];
    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("user_profiles")
        .select("id, name")
        .in("id", userIds);

      if (profileError) {
        console.error("Error fetching user profiles:", profileError);
      }

      const profileMap = new Map(
        (profiles || []).map((p: { id: string; name: string | null }) => [p.id, p])
      );
      order.order_items = (order.order_items as RawDetailItem[]).map((item) => {
        if (item.user_id) {
          const profile = profileMap.get(item.user_id);
          return {
            ...item,
            user: profile ? { name: profile.name || null } : null,
          };
        }
        // Anonymous item — use anonymous_name
        return {
          ...item,
          user: item.anonymous_name ? { name: item.anonymous_name } : null,
        };
      });
    } else {
      // All items are anonymous
      order.order_items = (order.order_items as RawDetailItem[]).map((item) => ({
        ...item,
        user: item.anonymous_name ? { name: item.anonymous_name } : null,
      }));
    }
  }

  return NextResponse.json(order);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const supabase = await createClient();

    // Check if order has any order items
    const { data: orderItems, error: checkError } = await supabase
      .from("bento_order_items")
      .select("id")
      .eq("order_id", id)
      .limit(1);

    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (orderItems && orderItems.length > 0) {
      return NextResponse.json(
        { error: "無法刪除訂單：訂單中仍有項目，請先刪除所有項目" },
        { status: 400 }
      );
    }

    // Delete the order
    const { error } = await supabase.from("bento_orders").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 403 }
    );
  }
}
