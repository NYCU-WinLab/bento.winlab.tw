"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { MenuImageUpload } from "./menu-image-upload";
import { MenuParser } from "./menu-parser";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface MenuItem {
  id?: string;
  name: string;
  price: string | number;
  type?: string | null;
}

// MenuParser expects price as string
type MenuParserItem = {
  id?: string;
  name: string;
  price: string;
  type?: string | null;
};

interface Restaurant {
  id: string;
  name: string;
  phone: string;
}

export function EditRestaurantDialog({
  restaurant,
  menuItems: existingMenuItems,
  onSuccess,
}: {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [phone, setPhone] = useState(restaurant.phone);
  const [menuItems, setMenuItems] = useState<MenuParserItem[]>(
    existingMenuItems
      .map((item) => ({
        id: item.id, // Keep the id for updates
        name: item.name,
        price: String(item.price),
        type: item.type,
      }))
      .sort((a, b) => {
        // Group by type first
        if (a.type && b.type && a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }
        if (a.type && !b.type) return -1;
        if (!a.type && b.type) return 1;
        // Then by price
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
      })
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/menus/${restaurant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          menu_items: menuItems.map((item) => ({
            id: item.id, // Include id for updates
            name: item.name,
            price: item.price,
            type: item.type || null,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update restaurant");
      }

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      alert("更新店家失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4 mr-2" />
          編輯
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>編輯店家</DialogTitle>
          <DialogDescription>更新店家資訊與菜單</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">店家名稱</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>重新上傳菜單圖片（選填）</Label>
              <MenuImageUpload
                onParseComplete={(items) => {
                  // Sort items by type first, then price (ascending)
                  const sortedItems = [...items]
                    .map((item) => ({
                      name: item.name,
                      price: String(item.price),
                      type: item.type,
                    }))
                    .sort((a, b) => {
                      // Group by type first
                      if (a.type && b.type && a.type !== b.type) {
                        return a.type.localeCompare(b.type);
                      }
                      if (a.type && !b.type) return -1;
                      if (!a.type && b.type) return 1;
                      // Then by price
                      const priceA = parseFloat(a.price) || 0;
                      const priceB = parseFloat(b.price) || 0;
                      return priceA - priceB;
                    });
                  setMenuItems(sortedItems);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>菜單項目（可編輯）</Label>
              <MenuParser items={menuItems} onChange={setMenuItems} />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || !name || !phone}>
              {loading ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
