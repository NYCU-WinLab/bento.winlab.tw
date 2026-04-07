"use client"

import { useUpdateMenu } from "@/hooks/use-menus"
import { Pencil } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MenuItem {
  id?: string
  name: string
  price: string | number
  type?: string | null
}

type MenuParserItem = {
  id?: string
  name: string
  price: string
  type?: string | null
}

interface Restaurant {
  id: string
  name: string
  phone: string
  google_map_link?: string | null
  additional?: string[] | null
}

export function EditRestaurantDialog({
  restaurant,
  menuItems: existingMenuItems,
  onSuccess,
}: {
  restaurant: Restaurant
  menuItems: MenuItem[]
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(restaurant.name)
  const [phone, setPhone] = useState(restaurant.phone)
  const [googleMapLink, setGoogleMapLink] = useState(
    restaurant.google_map_link ?? ""
  )
  const [additionalOptions, setAdditionalOptions] = useState<string[]>(
    restaurant.additional || []
  )
  const [newAdditionalOption, setNewAdditionalOption] = useState("")
  const [menuItems, setMenuItems] = useState<MenuParserItem[]>(
    existingMenuItems
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: String(item.price),
        type: item.type,
      }))
      .sort((a, b) => {
        if (a.type && b.type && a.type !== b.type) {
          return a.type.localeCompare(b.type)
        }
        if (a.type && !b.type) return -1
        if (!a.type && b.type) return 1
        const priceA = parseFloat(a.price) || 0
        const priceB = parseFloat(b.price) || 0
        return priceA - priceB
      })
  )
  const updateMenu = useUpdateMenu(restaurant.id)

  useEffect(() => {
    if (open) {
      setName(restaurant.name)
      setPhone(restaurant.phone)
      setGoogleMapLink(restaurant.google_map_link ?? "")
      setAdditionalOptions(restaurant.additional || [])
      setMenuItems(
        existingMenuItems
          .map((item) => ({
            id: item.id,
            name: item.name,
            price: String(item.price),
            type: item.type,
          }))
          .sort((a, b) => {
            if (a.type && b.type && a.type !== b.type) {
              return a.type.localeCompare(b.type)
            }
            if (a.type && !b.type) return -1
            if (!a.type && b.type) return 1
            const priceA = parseFloat(a.price) || 0
            const priceB = parseFloat(b.price) || 0
            return priceA - priceB
          })
      )
    }
  }, [open, existingMenuItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    try {
      await updateMenu.mutateAsync({
        name,
        phone,
        google_map_link: googleMapLink.trim() || null,
        menu_items: menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          type: item.type || null,
        })),
        additional: additionalOptions.length > 0 ? additionalOptions : null,
      })

      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating restaurant:", error)
      alert("更新店家失敗")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          編輯
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto sm:max-w-6xl">
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
              <Label htmlFor="google_map_link">Google 地圖連結（選填）</Label>
              <Input
                id="google_map_link"
                type="url"
                placeholder="https://maps.google.com/..."
                value={googleMapLink}
                onChange={(e) => setGoogleMapLink(e.target.value)}
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
              <Label>自訂選項（如：辣度、醬汁等）</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="例如：不辣、小辣、中辣、大辣"
                    value={newAdditionalOption}
                    onChange={(e) => setNewAdditionalOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (
                          newAdditionalOption.trim() &&
                          !additionalOptions.includes(
                            newAdditionalOption.trim()
                          )
                        ) {
                          setAdditionalOptions([
                            ...additionalOptions,
                            newAdditionalOption.trim(),
                          ])
                          setNewAdditionalOption("")
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        newAdditionalOption.trim() &&
                        !additionalOptions.includes(newAdditionalOption.trim())
                      ) {
                        setAdditionalOptions([
                          ...additionalOptions,
                          newAdditionalOption.trim(),
                        ])
                        setNewAdditionalOption("")
                      }
                    }}
                  >
                    新增
                  </Button>
                </div>
                {additionalOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {additionalOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                      >
                        <span>{option}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAdditionalOptions(
                              additionalOptions.filter((_, i) => i !== index)
                            )
                          }}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              disabled={updateMenu.isPending || !name || !phone}
            >
              {updateMenu.isPending ? "更新中..." : "更新"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
