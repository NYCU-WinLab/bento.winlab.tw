export const queryKeys = {
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
  menus: {
    all: ['menus'] as const,
    detail: (id: string) => [...queryKeys.menus.all, id] as const,
    stats: (id: string) => [...queryKeys.menus.all, id, 'stats'] as const,
  },
  ratings: {
    all: ['ratings'] as const,
    byItem: (menuItemId: string) => [...queryKeys.ratings.all, menuItemId] as const,
    myRating: (menuItemId: string) => [...queryKeys.ratings.all, 'my', menuItemId] as const,
  },
  stats: {
    global: ['stats', 'global'] as const,
    rankings: ['stats', 'rankings'] as const,
    my: ['stats', 'my'] as const,
  },
  users: {
    all: ['users'] as const,
  },
  admin: {
    status: ['admin'] as const,
  },
}
