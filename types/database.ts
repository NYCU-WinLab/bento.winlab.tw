export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  price: number
  type: string | null
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  phone: string
  google_map_link?: string | null
  additional?: string[] | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  user_id: string
  no_sauce: boolean
  additional: number | null
  menu_items: {
    name: string
    price: number
  }
}

export interface OrderItemWithUser extends OrderItem {
  user: {
    name: string | null
    email?: string
  } | null
}

export interface Order {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  auto_close_at: string | null
  created_by: string
  restaurants: Restaurant
  order_items: OrderItemWithUser[]
}

export interface OrderWithStats {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  restaurants: {
    name: string
    additional?: string[] | null
  }
  order_items?: OrderItem[]
  stats: {
    user_count: number
    menu_item_names: string[]
    menu_items: Array<{ name: string; count: number }>
    total_items: number
    total_price: number
  }
}

export interface UserProfile {
  id: string
  name: string | null
  roles?: {
    bento?: string[]
  }
}

export interface RankEntry {
  value: number
  users: Array<{
    userId: string
    userName: string
    avatarUrl: string | null
  }>
}

export interface RankData {
  topSpenders: RankEntry[]
  topVariety: RankEntry[]
  topParticipants: RankEntry[]
}

export interface UserStats {
  order_count: number
  total_spending: number
  top_restaurant_items: Array<{ name: string; count: number }>
}
