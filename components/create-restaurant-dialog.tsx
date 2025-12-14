'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { MenuImageUpload } from './menu-image-upload'
import { MenuParser } from './menu-parser'

interface MenuItem {
  name: string
  price: string
}

export function CreateRestaurantDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setLoading(true)
    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          menu_items: menuItems,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create restaurant')
      }

      if (data.warning) {
        alert(`警告: ${data.warning}`)
      }

      setOpen(false)
      setName('')
      setPhone('')
      setMenuItems([])
      onSuccess()
    } catch (error) {
      console.error('Error creating restaurant:', error)
      alert(error instanceof Error ? error.message : '建立店家失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>新增店家</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="phone">電話</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>菜單圖片</Label>
              <MenuImageUpload onParseComplete={setMenuItems} />
            </div>
            {menuItems.length > 0 && (
              <div className="space-y-2">
                <Label>解析結果（可編輯）</Label>
                <MenuParser items={menuItems} onChange={setMenuItems} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !name || !phone}>
              {loading ? '建立中...' : '建立'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

