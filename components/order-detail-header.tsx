'use client'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { format } from 'date-fns'
// @ts-ignore - date-fns locale type definition issue
import zhTWLocale from 'date-fns/locale/zh-TW'

interface Order {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  restaurants: {
    id: string
    name: string
    phone: string
  }
}

export function OrderDetailHeader({
  order,
  isAdmin,
  adminLoading,
  onClose,
}: {
  order: Order
  isAdmin: boolean
  adminLoading?: boolean
  onClose: () => void
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{order.restaurants.name}</h1>
          <p className="text-muted-foreground">電話: {order.restaurants.phone}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={order.status === 'active' ? 'default' : 'secondary'}>
            {order.status === 'active' ? '進行中' : '已結束'}
          </Badge>
          {!adminLoading && isAdmin && order.status === 'active' && (
            <Button onClick={onClose} variant="destructive">
              關閉訂單
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>建立時間: {format(new Date(order.created_at), 'yyyy/MM/dd HH:mm', { locale: zhTWLocale })}</p>
        {order.closed_at && (
          <p>結束時間: {format(new Date(order.closed_at), 'yyyy/MM/dd HH:mm', { locale: zhTWLocale })}</p>
        )}
      </div>
    </div>
  )
}
