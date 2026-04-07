"use client";

import { useAuth } from "@/contexts/auth-context";
import { useMenus } from "@/hooks/use-menus";
import { useCreateOrder } from "@/hooks/use-orders";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CreateOrderDialog({
  onSuccess,
  trigger,
}: {
  onSuccess: () => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [orderDate, setOrderDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const { user } = useAuth();
  const { data: restaurants } = useMenus();
  const createOrder = useCreateOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !orderDate || !user) return;

    try {
      await createOrder.mutateAsync({
        p_restaurant_id: selectedRestaurant,
        p_order_date: orderDate,
      });

      setOpen(false);
      setSelectedRestaurant("");
      setOrderDate(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      });
      onSuccess();
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error("Failed to create order");
      console.error("Error creating order:", err);
      alert(`建立訂單失敗: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>新增訂單</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增訂單</DialogTitle>
          <DialogDescription>選擇店家以建立新訂單</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant">店家</Label>
              <Select
                value={selectedRestaurant}
                onValueChange={setSelectedRestaurant}
              >
                <SelectTrigger id="restaurant">
                  <SelectValue placeholder="選擇店家" />
                </SelectTrigger>
                <SelectContent>
                  {(restaurants ?? []).map((restaurant: any) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDate">訂單日期</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
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
            <Button
              type="submit"
              disabled={createOrder.isPending || !selectedRestaurant || !orderDate}
            >
              {createOrder.isPending ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
