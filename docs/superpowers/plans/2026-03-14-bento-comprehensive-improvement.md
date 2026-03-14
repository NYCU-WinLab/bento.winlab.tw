# Bento Comprehensive Improvement Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Bento across security, architecture, UX, performance, and add new features (realtime notifications, search, PWA, dashboard, dark mode toggle).

**Architecture:** Incremental improvements organized into 9 independent commits. Each commit is self-contained and buildable. Security and architecture fixes come first, then UX/performance, then new features.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS v4, Shadcn/ui, Zod (new), Sonner (new)

---

## Chunk 1: Security & Architecture Foundation

### Task 1: Add Zod validation + shared types + security headers

**Files:**
- Create: `types/database.ts`
- Create: `lib/validations.ts`
- Modify: `next.config.ts`
- Modify: `app/layout.tsx:31` (lang attribute)
- Modify: `package.json` (add zod, sonner)
- Modify: `app/api/orders/route.ts`
- Modify: `app/api/order-items/route.ts`
- Modify: `app/api/ratings/route.ts`
- Modify: `app/api/menus/route.ts`
- Modify: `app/api/menus/[id]/route.ts`
- Modify: `app/api/rank/route.ts`
- Modify: `app/api/orders/[id]/route.ts`
- Modify: `app/api/me/stats/route.ts`
- Modify: `app/api/auth/callback/route.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/loki/bento && bun add zod sonner
```

- [ ] **Step 2: Create shared TypeScript types**

Create `types/database.ts`:

```typescript
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

export interface Order {
  id: string
  restaurant_id: string
  status: 'active' | 'closed'
  created_at: string
  closed_at: string | null
  auto_close_at: string | null
  created_by: string
  restaurants: Restaurant & { additional?: string[] | null }
  order_items: OrderItemWithUser[]
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
  } | null
}

export interface OrderWithStats extends Omit<Order, 'order_items'> {
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

export interface Rating {
  id: string
  menu_item_id: string
  user_id: string
  score: number
  updated_at: string
}

export interface RankData {
  topSpenders: RankEntry[]
  topVariety: RankEntry[]
  topParticipants: RankEntry[]
}

export interface RankEntry {
  value: number
  users: Array<{
    userId: string
    userName: string
    avatarUrl: string | null
  }>
}

export interface UserStats {
  order_count: number
  total_spending: number
  top_restaurant_items: Array<{ name: string; count: number }>
}
```

- [ ] **Step 3: Create Zod validation schemas**

Create `lib/validations.ts`:

```typescript
import { z } from 'zod'

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
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return { success: false, error: '無效的 JSON 格式' }
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map(i => i.message).join(', ')
    return { success: false, error: message }
  }
  return { success: true, data: result.data }
}
```

- [ ] **Step 4: Add security headers in next.config.ts**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create middleware.ts for auth session refresh**

Create `middleware.ts` at project root:

```typescript
import { createClient } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createClient(request, response);

  // Refresh the auth session to keep it alive
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 6: Fix lang attribute in layout.tsx**

In `app/layout.tsx` line 31, change `lang="en"` to `lang="zh-TW"`.

- [ ] **Step 7: Apply Zod validation to all API routes**

Update `app/api/orders/route.ts` POST handler to use `safeParseBody`:

```typescript
// At top, add imports:
import { safeParseBody, createOrderSchema } from '@/lib/validations'

// In POST function, replace `const body = await request.json()` block with:
const parsed = await safeParseBody(request, createOrderSchema)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error }, { status: 400 })
}
const body = parsed.data
```

Update `app/api/order-items/route.ts` POST:

```typescript
import { safeParseBody, createOrderItemSchema } from '@/lib/validations'
// Replace body parsing:
const parsed = await safeParseBody(request, createOrderItemSchema)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error }, { status: 400 })
}
const body = parsed.data
```

Update `app/api/ratings/route.ts` POST:

```typescript
import { safeParseBody, createRatingSchema } from '@/lib/validations'
// Replace body parsing:
const parsed = await safeParseBody(request, createRatingSchema)
if (!parsed.success) {
  return NextResponse.json({ error: parsed.error }, { status: 400 })
}
const body = parsed.data
```

Update `app/api/menus/route.ts` POST to use `safeParseBody(request, createRestaurantSchema)`.

Update `app/api/menus/[id]/route.ts` PUT to use `safeParseBody(request, updateRestaurantSchema)`.

- [ ] **Step 8: Add auth check to /api/orders GET and /api/rank GET**

In `app/api/orders/route.ts`, add auth check to GET:

```typescript
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
```

In `app/api/rank/route.ts`, add auth check:

```typescript
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest unchanged
```

- [ ] **Step 9: Remove hardcoded cookie names in auth callback**

In `app/api/auth/callback/route.ts`, replace the hardcoded cookie names with a dynamic pattern:

```typescript
// Replace lines 38-42 with:
const supabaseProjectId = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /\/\/([^.]+)\./
)?.[1] || ''
const cookiePrefix = `sb-${supabaseProjectId}-auth-token`
const cookieNames = [cookiePrefix, `${cookiePrefix}.0`, `${cookiePrefix}.1`]
```

- [ ] **Step 10: Replace `any` types in API routes with proper types**

In `app/api/orders/route.ts`, replace `any` with typed interfaces:

```typescript
import type { OrderItem } from '@/types/database'
// Replace (order: any) with proper type
// Replace (item: any) with OrderItem or inline type
```

Repeat for `app/api/rank/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/me/stats/route.ts` — replacing all `any` usages with imports from `types/database.ts`.

- [ ] **Step 11: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 12: Commit**

```bash
git add types/ lib/validations.ts middleware.ts next.config.ts app/layout.tsx app/api/ package.json bun.lock
git commit -m "feat: add security headers, Zod validation, middleware, shared types, and auth checks"
```

---

## Chunk 2: Architecture — Extract shared hooks and utilities

### Task 2: Extract useAdminCheck hook and shared parseOrderDate

**Files:**
- Create: `lib/hooks/use-admin-check.ts`
- Create: `lib/utils/date.ts`
- Modify: `components/order-list.tsx`
- Modify: `components/order-detail.tsx`
- Modify: `components/restaurant-list.tsx`
- Modify: `components/header-bar.tsx`
- Modify: `components/order-card.tsx`
- Modify: `components/order-detail-header.tsx`

- [ ] **Step 1: Create useAdminCheck hook**

Create `lib/hooks/use-admin-check.ts`:

```typescript
'use client'

import { useAuth } from '@/contexts/auth-context'
import { isAdmin } from '@/lib/utils/admin-client'
import { useEffect, useState } from 'react'

export function useAdminCheck() {
  const { user } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsAdminUser(false)
      setAdminLoading(false)
      return
    }

    let cancelled = false
    const check = async () => {
      try {
        const admin = await isAdmin(user.id)
        if (!cancelled) setIsAdminUser(admin)
      } catch {
        if (!cancelled) setIsAdminUser(false)
      } finally {
        if (!cancelled) setAdminLoading(false)
      }
    }
    check()

    return () => { cancelled = true }
  }, [user])

  return { isAdminUser, adminLoading, user }
}
```

- [ ] **Step 2: Create shared date utility**

Create `lib/utils/date.ts`:

```typescript
export function parseOrderDate(orderId: string): string {
  if (orderId.length === 8 && /^\d{8}$/.test(orderId)) {
    const year = orderId.substring(0, 4)
    const month = orderId.substring(4, 6)
    const day = orderId.substring(6, 8)
    return `${year}/${month}/${day}`
  }
  return orderId
}
```

- [ ] **Step 3: Replace duplicated admin logic in 4 components**

In `components/order-list.tsx`, replace lines 5-6 imports and lines 30-85 (admin state + checkAdmin) with:

```typescript
import { useAdminCheck } from '@/lib/hooks/use-admin-check'
// Inside component:
const { isAdminUser, adminLoading, user } = useAdminCheck()
```

Remove the `isAdmin` import, `useState` for admin state, `useEffect` for admin check, and `checkAdmin` function.

Apply same pattern to:
- `components/order-detail.tsx` (lines 44-112)
- `components/restaurant-list.tsx` (lines 18-59)
- `components/header-bar.tsx` (lines 21-64)

- [ ] **Step 4: Replace duplicated parseOrderDate**

In `components/order-card.tsx`, replace local `parseOrderDate` (lines 33-41) with:
```typescript
import { parseOrderDate } from '@/lib/utils/date'
```

In `components/order-detail-header.tsx`, same replacement (lines 34-43).

- [ ] **Step 5: Update component type imports to use shared types**

In `components/order-list.tsx`, `components/order-detail.tsx`, `components/order-card.tsx`, `components/order-detail-header.tsx`, `components/restaurant-list.tsx` — replace local `Order`, `OrderItem`, `Restaurant` interface definitions with imports from `@/types/database`.

- [ ] **Step 6: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 7: Commit**

```bash
git add lib/hooks/use-admin-check.ts lib/utils/date.ts components/ types/
git commit -m "refactor: extract useAdminCheck hook, shared types, and parseOrderDate utility"
```

---

## Chunk 3: Clear cache on logout + fix useCachedFetch types

### Task 3: Fix auth cache leak and improve cache utility types

**Files:**
- Modify: `contexts/auth-context.tsx:112`
- Modify: `lib/hooks/use-cached-fetch.ts`
- Modify: `lib/utils/cache.ts`

- [ ] **Step 1: Clear localStorage cache on sign out**

In `contexts/auth-context.tsx`, import `clearAllCache` and call it on SIGNED_OUT:

```typescript
import { clearAllCache } from '@/lib/utils/cache'

// In the onAuthStateChange handler, update the SIGNED_OUT block:
if (event === 'SIGNED_OUT') {
  console.log('User signed out - clearing cookies and cache')
  clearSupabaseCookies()
  clearAllCache()
}
```

- [ ] **Step 2: Fix `any` types in useCachedFetch and cache**

In `lib/hooks/use-cached-fetch.ts`, replace `any` in interface:

```typescript
interface UseCachedFetchOptions<T> {
  cacheKey: string
  fetchFn: () => Promise<T>
  skipCache?: boolean
  onDataChange?: (data: T) => void
}
```

In `lib/utils/cache.ts`, replace `any` in setCache:

```typescript
export function setCache<T>(key: string, data: T, options: CacheOptions = {}) {
```

- [ ] **Step 3: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add contexts/auth-context.tsx lib/hooks/use-cached-fetch.ts lib/utils/cache.ts
git commit -m "fix: clear localStorage cache on logout, remove any types from cache utilities"
```

---

## Chunk 4: UX — Toast notifications + replace alert/confirm + loading skeletons

### Task 4: Add Sonner toasts, AlertDialog, and loading skeletons

**Files:**
- Create: `components/ui/sonner.tsx`
- Create: `components/confirm-dialog.tsx`
- Modify: `app/layout.tsx` (add Toaster)
- Modify: `components/header-bar.tsx` (replace alert/confirm with toast/dialog)
- Modify: `components/order-detail.tsx` (replace alert/confirm, add loading state)
- Modify: `components/order-list.tsx` (add loading skeleton)
- Modify: `components/restaurant-list.tsx` (add loading skeleton)

- [ ] **Step 1: Add Sonner Toaster component**

Create `components/ui/sonner.tsx`:

```typescript
"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
```

- [ ] **Step 2: Add Toaster to layout.tsx**

In `app/layout.tsx`, add after `</AuthProvider>`:

```typescript
import { Toaster } from '@/components/ui/sonner'
// Inside the ThemeProvider, after </AuthProvider>:
<Toaster />
```

- [ ] **Step 3: Create reusable ConfirmDialog**

Create `components/confirm-dialog.tsx`:

```typescript
"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ReactNode } from "react"

interface ConfirmDialogProps {
  trigger: ReactNode
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "確認",
  cancelText = "取消",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

Note: You'll need to generate the alert-dialog shadcn component first:

```bash
cd /Users/loki/bento && bunx shadcn@latest add alert-dialog
```

- [ ] **Step 4: Replace alert/confirm in header-bar.tsx**

In `components/header-bar.tsx`:
- Import `toast` from `sonner`
- Replace `alert(...)` calls with `toast.error(...)`
- Replace `confirm(...)` in `handleDeleteOrder` with the ConfirmDialog component wrapping the delete button

- [ ] **Step 5: Replace alert/confirm in order-detail.tsx**

Same pattern: replace `alert()` with `toast.error()`, wrap delete actions with ConfirmDialog.

Add a loading skeleton when `!order`:

```typescript
if (!order) {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <div className="space-y-4 mx-2">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Add loading skeletons to order-list.tsx**

In `components/order-list.tsx`, show skeletons when loading:

```typescript
import { Skeleton } from '@/components/ui/skeleton'

// Before the return, after const closedOrders:
if (loading && (!orders || orders.length === 0)) {
  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-24 mx-2" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Add loading skeletons to restaurant-list.tsx**

Same pattern with a grid of skeleton cards.

- [ ] **Step 8: Add toast for successful operations**

In `components/header-bar.tsx`:
- After successful order close: `toast.success('訂單已關閉')`
- After successful order delete: `toast.success('訂單已刪除')`
- After successful create: `toast.success('已建立')`

Apply same to `components/order-detail.tsx` and other mutation points.

- [ ] **Step 9: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 10: Commit**

```bash
git add components/ui/sonner.tsx components/confirm-dialog.tsx components/ui/alert-dialog.tsx app/layout.tsx components/header-bar.tsx components/order-detail.tsx components/order-list.tsx components/restaurant-list.tsx package.json bun.lock
git commit -m "feat: add toast notifications, confirm dialogs, and loading skeletons"
```

---

## Chunk 5: Performance — top-level imports + static metadata

### Task 5: Fix dynamic imports and add page metadata

**Files:**
- Modify: `components/header-bar.tsx` (replace dynamic imports with top-level)
- Modify: `components/order-detail.tsx` (same)
- Create: `app/menus/layout.tsx` (metadata)
- Create: `app/rank/layout.tsx` (metadata)
- Create: `app/me/layout.tsx` (metadata)

- [ ] **Step 1: Replace dynamic imports with top-level imports**

In `components/header-bar.tsx`, replace all `await import("@/lib/utils/cache")` dynamic imports (lines 104, 137, 181, 249) with a top-level import:

```typescript
import { clearCache } from '@/lib/utils/cache'
```

Then replace `const { clearCache } = await import(...)` with direct `clearCache(...)` calls.

Apply same to `components/order-detail.tsx`.

- [ ] **Step 2: Add page-level metadata**

Create `app/menus/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '店家列表 | Bento',
}

export default function MenusLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

Create `app/rank/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '排名 | Bento',
}

export default function RankLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

Create `app/me/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '個人資料 | Bento',
}

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

- [ ] **Step 3: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add components/header-bar.tsx components/order-detail.tsx app/menus/layout.tsx app/rank/layout.tsx app/me/layout.tsx
git commit -m "perf: replace dynamic imports with static, add page-level metadata"
```

---

## Chunk 6: Feature — Dark mode toggle

### Task 6: Add dark mode toggle button to header

**Files:**
- Create: `components/theme-toggle.tsx`
- Modify: `components/header-bar.tsx`

- [ ] **Step 1: Create theme toggle component**

Create `components/theme-toggle.tsx`:

```typescript
"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "切換為淺色模式" : "切換為深色模式"}
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  )
}
```

- [ ] **Step 2: Add ThemeToggle to header-bar.tsx**

In `components/header-bar.tsx`, import and place `<ThemeToggle />` next to the GitHub issues button:

```typescript
import { ThemeToggle } from './theme-toggle'

// In the right side div, before the GitHub button:
<ThemeToggle />
```

- [ ] **Step 3: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add components/theme-toggle.tsx components/header-bar.tsx
git commit -m "feat: add dark mode toggle button in header"
```

---

## Chunk 7: Feature — Menu search & filter

### Task 7: Add search bar to restaurant list

**Files:**
- Modify: `components/restaurant-list.tsx`

- [ ] **Step 1: Add search state and filter to restaurant-list.tsx**

In `components/restaurant-list.tsx`, add search input and filter logic:

```typescript
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

// Inside RestaurantList component, add state:
const [search, setSearch] = useState('')

// Add filtered list:
const filtered = (restaurants || []).filter((r) =>
  r.name.toLowerCase().includes(search.toLowerCase())
)

// In the JSX, add search bar after the h1:
<div className="relative mx-2">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <Input
    placeholder="搜尋店家..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pl-9"
  />
</div>

// Replace `(restaurants || []).map(...)` with `filtered.map(...)`
// Update empty state to differentiate between "no restaurants" and "no results":
{filtered.length === 0 && (
  <div className="text-center py-12 text-muted-foreground">
    {search ? '找不到符合的店家' : '尚無店家'}
  </div>
)}
```

- [ ] **Step 2: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 3: Commit**

```bash
git add components/restaurant-list.tsx
git commit -m "feat: add search bar to restaurant list page"
```

---

## Chunk 8: Feature — PWA support

### Task 8: Add PWA manifest and service worker

**Files:**
- Create: `public/manifest.json`
- Modify: `app/layout.tsx` (add manifest link)

- [ ] **Step 1: Create PWA manifest**

Create `public/manifest.json`:

```json
{
  "name": "Bento - Winlab 訂餐系統",
  "short_name": "Bento",
  "description": "NYCU Winlab 會議訂餐系統",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "any",
      "type": "image/x-icon"
    }
  ]
}
```

- [ ] **Step 2: Add manifest link to layout.tsx**

In `app/layout.tsx`, add to the metadata export:

```typescript
export const metadata: Metadata = {
  title: "Bento | Winlab",
  description: "Meeting food ordering system for NYCU Winlab",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bento",
  },
};
```

- [ ] **Step 3: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json app/layout.tsx
git commit -m "feat: add PWA manifest for mobile home screen support"
```

---

## Chunk 9: Feature — Order history dashboard + Supabase Realtime notifications

### Task 9A: Order history & statistics dashboard

**Files:**
- Create: `app/stats/page.tsx`
- Create: `app/stats/layout.tsx`
- Create: `components/stats-dashboard.tsx`
- Create: `app/api/stats/route.ts`
- Modify: `components/header-bar.tsx` (add nav link)

- [ ] **Step 1: Create stats API route**

Create `app/api/stats/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 60

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all closed orders with items
  const { data: orders, error } = await supabase
    .from('bento_orders')
    .select('id, restaurant_id, status, created_at, closed_at, restaurants:bento_menus(name), order_items:bento_order_items(user_id, menu_items:bento_menu_items(price))')
    .eq('status', 'closed')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Monthly spending summary
  const monthlyStats = new Map<string, { month: string; totalOrders: number; totalSpending: number; totalParticipants: number }>()

  for (const order of orders || []) {
    const date = new Date(order.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthlyStats.has(monthKey)) {
      monthlyStats.set(monthKey, { month: monthKey, totalOrders: 0, totalSpending: 0, totalParticipants: 0 })
    }

    const stats = monthlyStats.get(monthKey)!
    stats.totalOrders += 1

    const items = order.order_items || []
    const users = new Set(items.map((i: { user_id: string }) => i.user_id))
    stats.totalParticipants += users.size

    for (const item of items) {
      stats.totalSpending += parseFloat(String((item as { menu_items?: { price?: number } }).menu_items?.price || 0))
    }
  }

  // Restaurant frequency
  const restaurantFreq = new Map<string, { name: string; count: number }>()
  for (const order of orders || []) {
    const name = (order.restaurants as { name: string } | null)?.name || '未知'
    const existing = restaurantFreq.get(name) || { name, count: 0 }
    existing.count += 1
    restaurantFreq.set(name, existing)
  }

  const topRestaurants = Array.from(restaurantFreq.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return NextResponse.json({
    monthly: Array.from(monthlyStats.values()).sort((a, b) => a.month.localeCompare(b.month)),
    topRestaurants,
    totalOrders: (orders || []).length,
  })
}
```

- [ ] **Step 2: Create stats dashboard component**

Create `components/stats-dashboard.tsx`:

```typescript
"use client"

import { Card } from '@/components/ui/card'
import { useCachedFetch } from '@/lib/hooks/use-cached-fetch'
import { Skeleton } from '@/components/ui/skeleton'

interface MonthlyStats {
  month: string
  totalOrders: number
  totalSpending: number
  totalParticipants: number
}

interface StatsData {
  monthly: MonthlyStats[]
  topRestaurants: Array<{ name: string; count: number }>
  totalOrders: number
}

export function StatsDashboard() {
  const { data, loading } = useCachedFetch<StatsData>({
    cacheKey: 'stats_dashboard',
    fetchFn: async () => {
      const res = await fetch('/api/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const currentMonth = data.monthly[data.monthly.length - 1]
  const maxSpending = Math.max(...data.monthly.map(m => m.totalSpending), 1)

  return (
    <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mx-2">統計儀表板</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">歷史訂單總數</p>
          <p className="text-3xl font-bold">{data.totalOrders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">本月消費</p>
          <p className="text-3xl font-bold">
            ${currentMonth?.totalSpending.toLocaleString() || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">本月訂單數</p>
          <p className="text-3xl font-bold">{currentMonth?.totalOrders || 0}</p>
        </Card>
      </div>

      {/* Monthly spending bar chart (pure CSS) */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">每月消費趨勢</h2>
        <div className="flex items-end gap-2 h-48">
          {data.monthly.slice(-12).map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">
                ${m.totalSpending.toLocaleString()}
              </span>
              <div
                className="w-full bg-primary rounded-t-sm min-h-[4px] transition-all"
                style={{ height: `${(m.totalSpending / maxSpending) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground">
                {m.month.slice(5)}月
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top restaurants */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">最常訂購店家</h2>
        <div className="space-y-3">
          {data.topRestaurants.map((r, i) => (
            <div key={r.name} className="flex items-center gap-3">
              <span className="text-muted-foreground w-6 text-right text-sm">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-sm text-muted-foreground">{r.count} 次</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(r.count / data.topRestaurants[0].count) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Create stats page and layout**

Create `app/stats/layout.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '統計 | Bento',
}

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

Create `app/stats/page.tsx`:

```typescript
import { StatsDashboard } from '@/components/stats-dashboard'

export default function StatsPage() {
  return <StatsDashboard />
}
```

- [ ] **Step 4: Add "統計" nav link to header**

In `components/header-bar.tsx`, add after the 排名 link:

```tsx
<Link href="/stats" className="font-semibold text-lg">
  統計
</Link>
```

- [ ] **Step 5: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 6: Commit**

```bash
git add app/stats/ app/api/stats/ components/stats-dashboard.tsx components/header-bar.tsx
git commit -m "feat: add order history & statistics dashboard page"
```

---

### Task 9B: Supabase Realtime notifications

**Files:**
- Create: `components/realtime-notifications.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create Realtime notification component**

Create `components/realtime-notifications.tsx`:

```typescript
"use client"

import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { clearCache } from '@/lib/utils/cache'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function RealtimeNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const channel = supabase
      .channel('bento-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bento_orders',
          filter: 'status=eq.closed',
        },
        (payload) => {
          toast.info('訂單已關閉', {
            description: `訂單 ${payload.new.id} 已被關閉`,
          })
          clearCache('orders')
          clearCache(`order_${payload.new.id}`)
          window.dispatchEvent(new CustomEvent('order-updated'))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bento_orders',
        },
        (payload) => {
          toast.info('新訂單', {
            description: `有新的訂單已建立`,
          })
          clearCache('orders')
          window.dispatchEvent(new CustomEvent('order-updated'))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bento_order_items',
        },
        (payload) => {
          // Only notify if it's not the current user's action
          if (payload.new.user_id !== user.id) {
            toast.info('新的訂餐', {
              description: '有人新增了訂餐項目',
            })
            clearCache(`order_${payload.new.order_id}`)
            window.dispatchEvent(
              new CustomEvent('order-updated', {
                detail: { orderId: payload.new.order_id },
              })
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return null
}
```

Note: Supabase Realtime requires that Realtime is enabled on the relevant tables in the Supabase Dashboard (Database > Replication). This component subscribes but will silently no-op if Realtime isn't enabled server-side.

- [ ] **Step 2: Add RealtimeNotifications to layout.tsx**

In `app/layout.tsx`, inside `<AuthProvider>`, add:

```typescript
import { RealtimeNotifications } from '@/components/realtime-notifications'

// Inside AuthProvider:
<RealtimeNotifications />
```

- [ ] **Step 3: Validate the build**

```bash
cd /Users/loki/bento && bun run build
```

- [ ] **Step 4: Commit**

```bash
git add components/realtime-notifications.tsx app/layout.tsx
git commit -m "feat: add Supabase Realtime notifications for order updates"
```

---

## Summary of Commits

| # | Commit | Category |
|---|--------|----------|
| 1 | Security headers, Zod validation, middleware, shared types, auth checks | Security |
| 2 | Extract useAdminCheck hook, shared types, parseOrderDate utility | Architecture |
| 3 | Clear localStorage cache on logout, remove `any` from cache | Architecture |
| 4 | Toast notifications, confirm dialogs, loading skeletons | UX |
| 5 | Replace dynamic imports, add page metadata | Performance |
| 6 | Dark mode toggle button | Feature |
| 7 | Search bar for restaurant list | Feature |
| 8 | PWA manifest | Feature |
| 9a | Stats dashboard page | Feature |
| 9b | Supabase Realtime notifications | Feature |
