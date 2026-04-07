# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bento is an ordering system for NYCU WinLab (https://bento.winlab.tw). The UI is in Traditional Chinese.

## Commands

- `bun dev` — start development server
- `bun run build` — production build
- `bun run lint` — ESLint (next/core-web-vitals + next/typescript)
- No test framework is configured

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Package manager**: Bun
- **Styling**: Tailwind CSS v4 (OKLCH color space, CSS variables, dark mode via `.dark` class)
- **UI components**: Shadcn/ui (radix-luma style, neutral base color) in `components/ui/`
- **Database & Auth**: Supabase (SSR cookies, Keycloak primary + Google OAuth fallback)
- **Data fetching**: TanStack Query v5
- **Path alias**: `@/*` maps to project root

## Architecture

### Data flow

- Browser Supabase client: `lib/supabase/client.ts`
- Server Supabase client: `lib/supabase/server.ts`
- Auth proxy: `lib/supabase/proxy.ts`
- Auth context provider: `contexts/auth-context.tsx` — provides user state
- All CRUD goes through direct Supabase client calls in TanStack Query hooks (`hooks/`)
- Only one API route remains: `/api/auth/callback` (OAuth)

### Client-side caching

TanStack Query v5 handles all caching, refetching, and optimistic updates. Query key factory in `hooks/query-keys.ts`.

### Hooks (`hooks/`)

- `use-orders` — order list, detail, create, close, delete
- `use-order-items` — add item, admin add, anonymous add, delete item
- `use-menus` — menu list, detail, stats, create, update, delete
- `use-ratings` — ratings by item, user rating, submit rating
- `use-stats` — global stats, rankings, personal stats
- `use-users` — user list (admin)
- `use-admin` — admin role check
- `use-realtime` — Supabase realtime subscriptions → TanStack Query invalidation

### Components (`components/`)

Organized by domain:

- `orders/` — order list, detail, items, creation
- `menus/` — menu list, detail, editor, item management
- `rankings/` — leaderboard views
- `stats/` — charts and statistics
- `layout/` — nav, sidebar, header
- `shared/` — reusable cross-domain components
- `providers/` — QueryProvider wrapper
- `ui/` — shadcn/ui primitives

### Shared utils

- `lib/utils/menu.ts` — `groupMenuItems()` for grouping menu items by type

### Authorization

- DB-level RLS with `has_role()` function — no application-level admin checks
- `hooks/use-admin.ts` checks role for UI gating only

### Realtime

`hooks/use-realtime.ts` subscribes to Supabase realtime channels and invalidates TanStack Query caches on changes.

### Database tables (Supabase)

`bento_orders`, `bento_menu_items`, `bento_menus`, `bento_order_items`, `bento_ratings`, `user_profiles`

## Environment Variables

Copy `.env.example` to `.env`. Required:

- `NEXT_PUBLIC_SITE_URL` — app URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase anon key
- `SUPABASE_SECRET_KEY` — server-only service role key (not in .env.example)
