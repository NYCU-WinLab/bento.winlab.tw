'use client'

import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Trash2 } from 'lucide-react'

interface MenuItem {
  name: string
  price: string
}

export function MenuParser({
  items,
  onChange,
}: {
  items: MenuItem[]
  onChange: (items: MenuItem[]) => void
}) {
  const [localItems, setLocalItems] = useState<MenuItem[]>(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleItemChange = (index: number, field: 'name' | 'price', value: string) => {
    const newItems = [...localItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setLocalItems(newItems)
    onChange(newItems)
  }

  const handleAddItem = () => {
    const newItems = [...localItems, { name: '', price: '' }]
    setLocalItems(newItems)
    onChange(newItems)
  }

  const handleRemoveItem = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index)
    setLocalItems(newItems)
    onChange(newItems)
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>品項名稱</TableHead>
            <TableHead>價格</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  placeholder="品項名稱"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  placeholder="價格"
                />
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button type="button" variant="outline" onClick={handleAddItem}>
        新增品項
      </Button>
    </div>
  )
}

