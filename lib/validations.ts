import { z } from 'zod/v4'

export const createOrderSchema = z.object({
  restaurant_id: z.string().uuid(),
  order_date: z.string().min(1, '訂單日期為必填項目'),
  auto_close_at: z.string().nullable().optional(),
})

export const createOrderItemSchema = z.object({
  order_id: z.string().min(1),
  menu_item_id: z.string().uuid(),
  no_sauce: z.boolean().default(false),
  additional: z.number().nullable().optional(),
})

export const createRatingSchema = z.object({
  menu_item_id: z.string().uuid(),
  score: z.number().int().min(1).max(5),
})

export const createRestaurantSchema = z.object({
  name: z.string().min(1, '店家名稱為必填項目'),
  phone: z.string().min(1, '電話為必填項目'),
  google_map_link: z.string().url().nullable().optional(),
  additional: z.array(z.string()).nullable().optional(),
  menu_items: z.array(z.object({
    name: z.string().min(1),
    price: z.union([z.number(), z.string()]),
    type: z.string().nullable().optional(),
  })).optional(),
})

export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  google_map_link: z.string().url().nullable().optional(),
  additional: z.any().optional(),
  menu_items: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    price: z.union([z.number(), z.string()]),
    type: z.string().nullable().optional(),
  })).optional(),
})

/**
 * Safely parse JSON from a Request, returning a typed error response on failure.
 */
export async function safeParseBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { success: false, error: '無效的 JSON 格式' }
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map((i: z.core.$ZodIssue) => i.message).join(', ')
    return { success: false, error: message }
  }
  return { success: true, data: result.data }
}
