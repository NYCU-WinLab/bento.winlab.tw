# Bento UI Alignment & Polish Design

## Overview

Align bento.winlab.tw with the latest shadcn template (radix-luma style), upgrade deps, add formatting tooling, and fix 60+ UI consistency issues.

## Phase 1: Config & Tooling Alignment

### 1.1 Upgrade Dependencies

```bash
bun add next@latest react@latest react-dom@latest lucide-react@latest tailwindcss@latest @tailwindcss/postcss@latest
bun add -d prettier prettier-plugin-tailwindcss shadcn@latest
```

### 1.2 Switch to radix-luma Style

Update `components.json`:

```json
{
  "style": "radix-luma",
  "tailwind": { "baseColor": "neutral" },
  "menuColor": "default",
  "menuAccent": "subtle"
}
```

Re-install ALL shadcn components to get new style:

```bash
bunx shadcn@latest add alert-dialog avatar badge button card chart checkbox dialog input label select separator skeleton sonner table --overwrite
```

### 1.3 Update globals.css

Replace with template's CSS structure:

- Add `@import "shadcn/tailwind.css"` (the new shadcn way)
- Switch from offset radius (`calc(var(--radius) - 4px)`) to multiplier radius (`calc(var(--radius) * 0.6)`)
- Switch from zinc hue (285) to neutral (0)
- Keep bento's colorful chart colors (don't use template's grayscale)
- Add font variables: `--font-heading`, `--font-sans` (generic, not geist-specific)
- Add `html { @apply font-sans }` to base layer
- Add ranking color tokens (see Phase 2)

### 1.4 Add Prettier

Create `.prettierrc`:

```json
{
  "endOfLine": "lf",
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "app/globals.css",
  "tailwindFunctions": ["cn", "cva"]
}
```

Create `.prettierignore`:

```
node_modules/
.next/
bun.lock
```

Add scripts to package.json:

```json
{
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit"
}
```

### 1.5 Run Prettier on Entire Codebase

```bash
bun run format
```

This will be a large formatting commit — do it as a standalone commit before any UI changes.

## Phase 2: Design Tokens for Rankings

Add to globals.css (both `:root` and `.dark`):

```css
:root {
  --rank-gold: oklch(0.795 0.184 86.047);
  --rank-gold-foreground: oklch(0.421 0.095 57.708);
  --rank-silver: oklch(0.869 0.005 286.286);
  --rank-silver-foreground: oklch(0.551 0.014 285.938);
  --rank-bronze: oklch(0.645 0.246 16.439);
  --rank-bronze-foreground: oklch(0.356 0.11 35.191);
}

.dark {
  --rank-gold: oklch(0.795 0.184 86.047);
  --rank-gold-foreground: oklch(0.326 0.095 57.708);
  --rank-silver: oklch(0.769 0.005 286.286);
  --rank-silver-foreground: oklch(0.421 0.014 285.938);
  --rank-bronze: oklch(0.645 0.246 16.439);
  --rank-bronze-foreground: oklch(0.29 0.11 35.191);
}
```

Add to `@theme inline`:

```css
--color-rank-gold: var(--rank-gold);
--color-rank-gold-foreground: var(--rank-gold-foreground);
--color-rank-silver: var(--rank-silver);
--color-rank-silver-foreground: var(--rank-silver-foreground);
--color-rank-bronze: var(--rank-bronze);
--color-rank-bronze-foreground: var(--rank-bronze-foreground);
```

Then in `top-ranking-card.tsx`, replace hardcoded `from-yellow-400 to-yellow-600` etc. with `bg-rank-gold text-rank-gold-foreground`.

## Phase 3: UI Consistency Fixes

### 3.1 Loading States — Unified Pattern

**Rule**: Always use `<Skeleton>` for loading states, never raw `animate-pulse`.

Files to fix:

- `components/menus/restaurant-card.tsx` — replace `animate-pulse` divs with `<Skeleton>`
- `components/stats/user-order-count.tsx` — replace `animate-pulse` with `<Skeleton>`
- `components/stats/user-total-spending.tsx` — same
- `components/stats/user-top-items.tsx` — same

### 3.2 Card Structure — Unified Pattern

**Rule**: Use `Card > CardHeader > CardContent` structure. Don't override padding with `p-0`.

Files to fix:

- `components/menus/restaurant-card.tsx` — remove `p-4` on Card, remove `p-0` on CardHeader/CardContent, use standard structure
- `components/orders/order-summary.tsx` — use CardHeader/CardContent instead of Card + manual `p-6`
- `components/stats/stats-dashboard.tsx` — stat cards should use CardHeader/CardContent, not `<Card className="p-4">`

### 3.3 Empty States — Unified Pattern

**Rule**: `<div className="text-center py-12 text-muted-foreground">message</div>`

Files to fix:

- `components/orders/order-items-list.tsx` — change `py-8` to `py-12`
- `components/rankings/top-ranking-card.tsx` — add `text-center py-12`
- `components/stats/user-top-items.tsx` — add `text-center py-12`

### 3.4 Font Weight — Unified Rules

**Rules**:

- Page title (h1): `text-2xl font-bold`
- Section title (h2): `text-xl font-semibold`
- Card title: use `<CardTitle>` (inherits `font-semibold`)
- Label: `font-medium` (via `<Label>`)

Files to fix:

- `components/orders/order-list.tsx` — closed orders heading: `font-semibold` → matches rule (h2)
- `components/menus/restaurant-card.tsx` — remove `font-bold` override on CardTitle

### 3.5 Dialog Footer — Unified Pattern

**Rule**: Left side = `variant="outline"` cancel, Right side = default submit.

Already mostly consistent. Check:

- `components/shared/confirm-dialog.tsx` — ensure AlertDialogAction uses proper destructive styling via variant, not inline classes

### 3.6 Hardcoded Colors → Semantic Tokens

Files to fix:

- `components/rankings/top-ranking-card.tsx` — replace `from-yellow-400 to-yellow-600` etc. with rank tokens
- `components/orders/order-items-list.tsx` — replace hardcoded `shadow-[0_0_20px_rgba(250,204,21,0.6)]` with rank-gold token
- `components/shared/rating-dialog.tsx` — `fill-yellow-400` → `fill-rank-gold`, `text-gray-300` → `text-muted-foreground`
- `components/orders/add-order-item-dialog.tsx` — `border-yellow-500/50 bg-yellow-50/50` → `border-rank-gold/50 bg-rank-gold/10`

### 3.7 Icon Sizing — Unified Rules

**Rules**:

- Default in buttons: `size-4` (handled by button component)
- Inline with text: `w-4 h-4`
- Rating stars: `w-6 h-6` (interactive, need larger tap target)

Files to fix:

- `components/shared/rating-dialog.tsx` — stars `w-8 h-8` → `w-6 h-6`

## Migration Strategy

1. **Commit 1**: Upgrade deps + add prettier + format entire codebase
2. **Commit 2**: Switch to radix-luma (components.json + globals.css + re-install shadcn components)
3. **Commit 3**: Add ranking tokens to globals.css + fix hardcoded colors
4. **Commit 4**: Fix UI consistency (loading, cards, empty states, font weights, icons)
5. **Commit 5**: Build verify + any fixups
