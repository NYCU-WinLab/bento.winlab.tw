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
- **UI components**: Shadcn/ui (new-york style, zinc base color) in `components/ui/`
- **Database & Auth**: Supabase (SSR cookies, Keycloak primary + Google OAuth fallback)
- **AI**: OpenAI API (GPT vision for menu image parsing)
- **Path alias**: `@/*` maps to project root

## Architecture

### Data flow
- Browser Supabase client: `lib/supabase/client.ts`
- Server Supabase client: `lib/supabase/server.ts`
- Auth middleware proxy: `lib/supabase/proxy.ts`
- Auth context provider: `contexts/auth-context.tsx`
- API routes in `app/api/` handle authorization and Supabase queries server-side

### Client-side caching
Uses a custom SWR (stale-while-revalidate) pattern via `lib/hooks/use-cached-fetch.ts` backed by localStorage (`lib/utils/cache.ts`).

### Admin checks
- Server-side: `lib/utils/admin.ts` (`requireAdmin()`)
- Client-side: `lib/utils/admin-client.ts` (`isAdmin()`)
- Checks `user_profiles.roles.bento` array in Supabase

### Database tables (Supabase)
`bento_orders`, `bento_menu_items`, `bento_menus`, `bento_order_items`, `bento_ratings`, `user_profiles`

### Key API routes
- `/api/orders` — order CRUD + `/api/orders/[id]/close`
- `/api/menus` — restaurant/menu CRUD + `/api/menus/[id]/stats`
- `/api/order-items` — order item management
- `/api/ratings` — user ratings
- `/api/menu/parse` — OpenAI menu image parsing
- `/api/auth/callback` — OAuth callback handler

## Environment Variables

Copy `.env.example` to `.env`. Required:
- `NEXT_PUBLIC_SITE_URL` — app URL (http://localhost:3000 for dev)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — Supabase anon key
- `OPENAI_API_KEY` — for menu parsing feature
- `SUPABASE_SECRET_KEY` — server-only service role key (not in .env.example)
