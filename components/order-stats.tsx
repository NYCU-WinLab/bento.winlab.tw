"use client";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface OrderItemForStats {
  menu_item_id: string;
  no_sauce?: boolean;
  menu_items: {
    name: string;
    price: number;
  };
  user_id: string;
}

interface OrderStatsProps {
  orderItems: OrderItemForStats[];
  className?: string;
}

export function OrderStats({ orderItems, className }: OrderStatsProps) {
  const items = orderItems || [];

  // Calculate statistics
  const uniqueUsers = new Set(items.map((item) => item.user_id));
  const userCount = uniqueUsers.size;

  // Count menu items and their quantities
  const menuItemCounts = new Map<
    string,
    { name: string; count: number; price: number; noSauceCount: number }
  >();

  items.forEach((item) => {
    const menuItemId = item.menu_item_id;
    const menuItemName = item.menu_items?.name || "未知品項";
    const menuItemPrice = item.menu_items?.price || 0;

    if (menuItemCounts.has(menuItemId)) {
      const existing = menuItemCounts.get(menuItemId)!;
      existing.count += 1;
      if (item.no_sauce) {
        existing.noSauceCount += 1;
      }
    } else {
      menuItemCounts.set(menuItemId, {
        name: menuItemName,
        count: 1,
        price: menuItemPrice,
        noSauceCount: item.no_sauce ? 1 : 0,
      });
    }
  });

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    return sum + (item.menu_items?.price || 0);
  }, 0);

  // Format menu items list for Badge display, sorted by count desc
  const menuItemsList = Array.from(menuItemCounts.values()).sort(
    (a, b) => b.count - a.count
  );

  return (
    <div
      className={cn(
        "text-base text-muted-foreground space-y-2",
        className
      )}
    >
      <p>
        已有 <span className="font-bold text-foreground">{userCount}</span>{" "}
        人訂餐，{" "}
        <span className="font-bold text-foreground">{items.length}</span>{" "}
        項餐點，共 NT${" "}
        <span className="font-bold text-primary">
          {totalPrice.toLocaleString()}
        </span>
      </p>
      {menuItemsList.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {menuItemsList.map((item, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-sm px-3 py-1"
            >
              {item.name}{" "}
              <span className="font-semibold">{item.count}</span> 份
              {item.noSauceCount > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  （不醬 {item.noSauceCount} 份）
                </span>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}


