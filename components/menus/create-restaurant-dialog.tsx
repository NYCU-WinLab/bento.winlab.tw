"use client"

import { useCreateMenu } from "@/hooks/use-menus"
import { useState } from "react"
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
  name: string
  price: string
  type?: string | null
}

export function CreateRestaurantDialog({
  onSuccess,
  trigger,
}: {
  onSuccess: () => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [googleMapLink, setGoogleMapLink] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [additionalOptions, setAdditionalOptions] = useState<string[]>([])
  const [newAdditionalOption, setNewAdditionalOption] = useState("")
  const createMenu = useCreateMenu()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    try {
      await createMenu.mutateAsync({
        name,
        phone,
        google_map_link: googleMapLink.trim() || null,
        menu_items: menuItems,
        additional: additionalOptions.length > 0 ? additionalOptions : null,
      })

      setOpen(false)
      setName("")
      setPhone("")
      setGoogleMapLink("")
      setMenuItems([])
      setAdditionalOptions([])
      setNewAdditionalOption("")
      onSuccess()
    } catch (error) {
      console.error("Error creating restaurant:", error)
      alert(error instanceof Error ? error.message : "建立店家失敗")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>新增店家</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>新增店家</DialogTitle>
          <DialogDescription>填寫店家資訊並上傳菜單圖片</DialogDescription>
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
              disabled={createMenu.isPending || !name || !phone}
            >
              {createMenu.isPending ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
