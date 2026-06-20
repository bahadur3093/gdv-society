# GDV Society — Design System

> **For AI agents and human developers alike.** This is the single source of truth for every visual and structural decision in this codebase. Read this before writing or modifying any UI component.

---

## Table of Contents

1. [Theme Identity](#1-theme-identity)
2. [Color System](#2-color-system)
3. [Tailwind CSS v4 Setup](#3-tailwind-css-v4-setup)
4. [Typography](#4-typography)
5. [Spacing & Sizing](#5-spacing--sizing)
6. [Borders & Radius](#6-borders--radius)
7. [Shadows & Elevation](#7-shadows--elevation)
8. [Backgrounds & Surfaces](#8-backgrounds--surfaces)
9. [Component Library](#9-component-library)
   - [Button](#button)
   - [Badge](#badge)
   - [Input / Textarea](#input--textarea)
   - [Card](#card)
   - [Modal](#modal)
   - [Confirm Dialog](#confirm-dialog)
   - [Toast / Notification](#toast--notification)
   - [Alert (inline)](#alert-inline)
   - [Sidebar / Navigation](#sidebar--navigation)
   - [Table](#table)
   - [Page Loader](#page-loader)
10. [Status & Semantic Colors](#10-status--semantic-colors)
11. [Icons](#11-icons)
12. [Layout & Grid](#12-layout--grid)
13. [Animation & Transitions](#13-animation--transitions)
14. [Scrollbar](#14-scrollbar)
15. [Dos and Don'ts](#15-dos-and-donts)

---

## 1. Theme Identity

**Name:** `Tactical Earth`
**Personality:** Deep dark, enterprise-rugged, professional. Think military-grade software meets property management. Zero flashiness.

### Core Principles

| Principle | Rule |
|---|---|
| **Dark-first** | Everything lives on a near-black canvas. There is no light mode. |
| **Muted palette** | No vibrant blues, neons, or gradients. All colours are desaturated. |
| **Earthy accents** | The brand lives in green (Pathania Green) and slate (Glacier Slate). |
| **High readability** | Text is always `slate-100` / `slate-200` / `slate-300` on dark surfaces. |
| **Atmospheric depth** | Cards and containers are achieved through subtle border + `bg-*/30` transparency, not hard fills. |

---

## 2. Color System

### Brand Tokens (CSS Custom Properties)

These are defined in `src/app/globals.css` via a Tailwind v4 `@theme` block. Always prefer these semantic tokens over raw Tailwind palette colors.

```css
/* In globals.css — @theme block */
@theme {
  --color-background:      #0D1111;  /* Obsidian Iron — main app background */
  --color-surface:         #1A1F1F;  /* Gunmetal — cards, modals, sidebars */
  --color-brand-primary:   #2E4D3E;  /* Pathania Green — CTAs, active states */
  --color-brand-secondary: #4A6367;  /* Glacier Slate — secondary accents */
  --color-brand-accent:    #8B4513;  /* Rust Ember — special highlights, warnings */
  --color-text-main:       #E2E8E4;  /* Parchment — all primary text */
  --color-text-muted:      #94A3B8;  /* slate-400 equivalent — secondary text */
  --color-border:          #1E293B;  /* slate-800 equivalent — default borders */
}
```

### Semantic Usage Map

| Token | Tailwind Class | Use Case |
|---|---|---|
| `--color-background` | `bg-background` | Root `<body>`, page wrappers, full-screen layouts |
| `--color-surface` | `bg-surface` | Cards, modal backgrounds, sidebar panels |
| `--color-brand-primary` | `bg-brand-primary`, `text-brand-primary`, `border-brand-primary` | Primary buttons, active nav, focus rings |
| `--color-brand-secondary` | `bg-brand-secondary`, `text-brand-secondary` | Secondary buttons, sub-labels, accent icons |
| `--color-brand-accent` | `bg-brand-accent`, `text-brand-accent` | Rust/warning highlights, special call-outs |
| `--color-text-main` | `text-text-main` | All headings and body copy |
| `--color-text-muted` | `text-text-muted` | Supporting text, timestamps, sub-labels |
| `--color-border` | `border-border` | Default card/input borders |

### Real-world Color Usage (what you'll actually see in components)

The codebase frequently uses the Tailwind slate scale directly in combination with the brand tokens. Here is the mapping to understand:

| Tailwind Class | Approximate Role |
|---|---|
| `bg-slate-950` | Deepest background — shell/layout wrappers, auth pages |
| `bg-slate-900` | Page-level card / modal background |
| `bg-slate-900/30` | Transparent card surface (preferred for data cards) |
| `bg-slate-900/50` | Slightly opaque card — used in toolbars, headers |
| `bg-slate-800/30–50` | Hover backgrounds on rows, interactive surfaces |
| `border-slate-800/40` | Standard card border |
| `border-slate-700/50` | Input borders |
| `text-slate-100` | Primary heading text |
| `text-slate-200` | Primary body/cell text |
| `text-slate-300` | Secondary body text |
| `text-slate-400` | Muted / supporting text |
| `text-slate-500` | Placeholder text, table headers, dim labels |
| `text-violet-400` | Brand accent icon colour (loader spinners, receipt icons) |
| `bg-violet-600` | Brand primary button (used in admin CTAs) |
| `bg-green-600` | Active nav item background |
| `text-emerald-400` | Positive money values (paid amounts) |
| `text-red-400` | Negative money values (outstanding) |
| `text-amber-400/70` | Warning states (unclaimed villas) |

> **Note:** `violet-400/600` and `green-600` are the dominant interactive accent colours in the actual component implementations, while the CSS variable tokens (`brand-primary` etc.) are used in the atom-level components (`Button`, `Badge`, `Input`). Both coexist — when building new components, prefer the CSS variable tokens. For admin-specific UI, matching the `violet`/`green` pattern is acceptable for consistency.

---

## 3. Tailwind CSS v4 Setup

### Key Differences from v3

- No `tailwind.config.js` file. All configuration lives in `src/app/globals.css`.
- CSS-first configuration using `@theme {}` block.
- Import is `@import "tailwindcss";` — not `@tailwind base/components/utilities`.
- Arbitrary values like `lg:w-86` work natively (no explicit safelist needed).
- `cn()` utility (`src/utils/classNames.ts`) combines `clsx` + `tailwind-merge` — **always use `cn()` for conditional/merged class strings**.

### globals.css Entry Point

```css
@import "tailwindcss";

@theme {
  /* All custom design tokens go here */
  --color-background: #0D1111;
  --color-surface:    #1A1F1F;
  /* ... see Section 2 */
}

/* Custom utility classes and overrides below */
```

### cn() Utility

```ts
// src/utils/classNames.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Always use `cn()` when building components that accept external `className` props or have conditional classes.**

---

## 4. Typography

### Scale

| Variant | Element | Classes | Usage |
|---|---|---|---|
| `h1` | `<h1>` | `text-4xl lg:text-5xl font-bold tracking-tight leading-tight` | Page titles |
| `h2` | `<h2>` | `text-3xl lg:text-4xl font-bold tracking-tight leading-tight` | Section titles |
| `h3` | `<h3>` | `text-2xl lg:text-3xl font-semibold tracking-tight leading-snug` | Card/panel headings |
| `h4` | `<h4>` | `text-xl lg:text-2xl font-semibold tracking-tight leading-snug` | Sub-headings |
| `h5` | `<h5>` | `text-lg lg:text-xl font-semibold leading-snug` | Labels |
| `h6` | `<h6>` | `text-base lg:text-lg font-semibold leading-normal` | Small labels |
| `body` | `<p>` | `text-base leading-relaxed` | Body copy |
| `small` | `<small>` | `text-sm leading-normal` | Supporting text |
| `caption` | `<span>` | `text-xs leading-normal` | Timestamps, meta |
| `label` | `<label>` | `text-sm font-medium leading-normal` | Form labels |
| `code` | `<code>` | `text-sm font-mono bg-surface px-1.5 py-0.5 rounded border border-border` | Inline code |

### Font Colors

| Context | Class |
|---|---|
| Page headings | `text-slate-100` or `text-white` |
| Body / data text | `text-slate-200` or `text-slate-300` |
| Supporting / meta | `text-slate-400` |
| Placeholder / dim | `text-slate-500` |
| Table headers (uppercase) | `text-slate-500 text-xs uppercase tracking-wider` |
| Positive financial | `text-emerald-400` |
| Negative / overdue | `text-red-400` |
| Warning / unclaimed | `text-amber-400` |
| Accent (icons, emphasis) | `text-violet-400` |
| Brand primary text | `text-brand-primary` |

### Numeric / Monospace Data

Always use `font-mono` for:
- Currency amounts
- Villa numbers
- Any data-table numeric column

```tsx
<span className="font-mono text-slate-300">₹3,600</span>
<span className="font-mono text-emerald-400">₹1,980</span>
<span className="font-mono text-red-400 font-semibold">₹1,620</span>
```

---

## 5. Spacing & Sizing

### Page Layout

```
Page Wrapper:  p-6 lg:p-8
Section Gap:   space-y-6
Card Gap:      space-y-4  (inside cards)
Row Gap:       gap-3 / gap-4 / gap-6
```

### Component Internal Spacing

| Element | Padding |
|---|---|
| Card (default) | `p-4` (md) / `p-6` (lg) |
| Table cell | `px-4 py-3` |
| Table header | `px-4 py-3` |
| Modal header | `p-6 border-b` |
| Modal body | `p-6` |
| Button (md) | `px-4 py-2` |
| Input (md) | `px-3 py-2` |
| Badge (md) | `px-2.5 py-1` |
| Sidebar nav item | `px-4 py-3` |

### Min Heights (interactive elements)

| Size | Min Height |
|---|---|
| `xs` | 24px |
| `sm` | 32px |
| `md` | 40px |
| `lg` | 48px |
| `xl` | 56px |

---

## 6. Borders & Radius

### Border Colours (most used)

```
Default cards:     border-slate-800/40
Toolbar/inner:     border-slate-800/40
Input default:     border-slate-700/50
Input hover:       border-brand-primary/50
Input focus:       border-brand-primary + ring-brand-primary/20
Modal:             border-slate-800/40
Sidebar:           border-r border-slate-800/40
Table row divider: border-slate-800/30
```

### Border Radius Scale

| Element | Radius |
|---|---|
| Cards / panels | `rounded-lg` |
| Buttons | `rounded-lg` |
| Inputs | `rounded-lg` or `rounded-md` |
| Badges (rounded) | `rounded-md` |
| Badges (pill) | `rounded-full` |
| Modals / dialogs | `rounded-lg` |
| Filter chips | `rounded-md` |
| Avatar / icon rings | `rounded-full` |
| Code blocks | `rounded` |

**Rule:** Use `rounded-lg` as the default for all containers. Use `rounded-md` only for smaller inline elements. Never use `rounded-xl` or `rounded-2xl` — they break the tactical aesthetic.

---

## 7. Shadows & Elevation

| Elevation | Class | Use |
|---|---|---|
| None | *(no shadow)* | Flat table rows |
| Low | `shadow-sm` | Basic cards at rest |
| Medium | `shadow-md` | Hover state cards |
| High | `shadow-2xl` | Modals, toasts, floating elements |
| Full-screen overlay | `bg-slate-950/80 backdrop-blur-sm` | Modal/dialog backdrops |
| Modal backdrop | `bg-black/50 backdrop-blur-sm` | Lighter backdrop variant |

---

## 8. Backgrounds & Surfaces

### Background Hierarchy (deepest → lightest)

```
1. bg-slate-950          ← Page shell, auth screens (deepest)
2. bg-slate-900/30       ← Data cards, stat panels (transparent)
3. bg-slate-900/50       ← Toolbars, card headers (slightly opaque)
4. bg-slate-900          ← Modals, dialogs, sidebars (solid)
5. bg-slate-800/30–50    ← Hover states on rows/buttons
6. bg-zinc-950           ← Sidebar background
```

### Atmospheric Effects

For dashboard-level cards that need depth:
```tsx
// Hover glow using brand-primary — subtle, not flashy
className="hover:border-cyan-500/30 transition-all duration-300"

// Statistics card gradient
className="bg-linear-to-br from-surface to-surface/80 border border-brand-primary/20 backdrop-blur-sm"
```

**Rule:** Never use solid colored backgrounds (`bg-blue-800`) for card surfaces. Always layer transparency with `/30`–`/50` opacity modifiers to maintain the atmospheric depth.

---

## 9. Component Library

### Button

**File:** `src/components/atoms/Button.tsx`

#### Variants

| Variant | Classes | Use |
|---|---|---|
| `primary` | `bg-brand-primary text-white border-brand-primary` | Main CTA |
| `secondary` | `bg-brand-secondary text-white border-brand-secondary` | Secondary CTA |
| `tertiary` | `bg-surface text-text-main border-border` | Neutral action |
| `danger` | `bg-red-600 text-white border-red-600` | Destructive action |
| `ghost` | `bg-transparent text-text-main border-transparent` | Subtle action |

#### Sizes

| Size | Padding | Height | Text |
|---|---|---|---|
| `xs` | `px-2 py-1` | 24px | `text-xs` |
| `sm` | `px-3 py-1.5` | 32px | `text-sm` |
| `md` | `px-4 py-2` | 40px | `text-sm` |
| `lg` | `px-6 py-2.5` | 48px | `text-base` |
| `xl` | `px-8 py-3` | 56px | `text-lg` |

#### Base Classes (always applied)

```
inline-flex items-center justify-center gap-2 rounded-lg font-medium
transition-all duration-200
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
disabled:cursor-not-allowed disabled:opacity-50
```

#### Admin-specific pattern (violet CTA)

Many admin pages use violet directly for primary CTAs:
```tsx
className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
```
This is acceptable in admin templates for consistency with the established visual rhythm.

---

### Badge

**File:** `src/components/atoms/Badge.tsx`

| Variant | Background | Text | Border |
|---|---|---|---|
| `default` | `bg-surface` | `text-text-main` | `border-border` |
| `primary` | `bg-brand-primary` | `text-white` | — |
| `secondary` | `bg-brand-secondary` | `text-white` | — |
| `success` | `bg-green-100` | `text-green-800` | `border-green-200` |
| `warning` | `bg-yellow-100` | `text-yellow-800` | `border-yellow-200` |
| `error` | `bg-red-100` | `text-red-800` | `border-red-200` |
| `info` | `bg-blue-100` | `text-blue-800` | `border-blue-200` |

**Status Badges (table/ledger pattern)** — use semi-transparent backgrounds:
```tsx
// PAID
"bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"

// PARTIAL
"bg-amber-500/15 text-amber-300 border border-amber-500/30"

// PENDING
"bg-red-500/15 text-red-300 border border-red-500/30"

// CREDIT
"bg-violet-500/15 text-violet-300 border border-violet-500/30"

// NO_BILLS
"bg-slate-500/15 text-slate-400 border border-slate-500/30"

// NOT_BILLABLE
"bg-slate-700/40 text-slate-500 border border-slate-600/30"
```

**Structure:**
```tsx
<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ...">
  <Icon className="w-3 h-3" />
  Label
</span>
```

---

### Input / Textarea

**File:** `src/components/atoms/Input.tsx`

#### Base

```
w-full rounded-lg text-text-main outline-none transition-all duration-200
bg-transparent
```

#### Variants

| Variant | Rest | Focus |
|---|---|---|
| `outlined` | `border border-border hover:border-brand-primary/50` | `border-brand-primary ring-2 ring-brand-primary/20` |
| `filled` | `bg-surface border border-transparent hover:bg-surface/80` | `border-brand-primary ring-2 ring-brand-primary/20 bg-transparent` |

#### Admin inline input pattern

```tsx
className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-md text-sm text-slate-200 focus:outline-none focus:border-violet-500/50"
```

#### Search input pattern

```tsx
className="pl-9 pr-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 w-full sm:w-64"
```

#### State overrides

| State | Classes |
|---|---|
| Error | `border-red-500 focus:border-red-500 focus:ring-red-500/20` |
| Success | `border-green-500 focus:border-green-500 focus:ring-green-500/20` |
| Disabled | `opacity-50 cursor-not-allowed` |

---

### Card

**File:** `src/components/atoms/Card.tsx`

#### Variants

| Variant | Classes |
|---|---|
| `basic` | `bg-surface border border-border` |
| `interactive` | `bg-surface border border-border transition-all duration-200 hover:border-brand-primary/50 hover:shadow-lg cursor-pointer` |
| `media` | `bg-surface border border-border overflow-hidden` |
| `statistics` | `bg-gradient-to-br from-surface to-surface/80 border border-brand-primary/20 backdrop-blur-sm` |

#### Real-world data card pattern

```tsx
<div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6 hover:border-{color}-500/30 transition-all duration-300">
```

Hover border accent colours used in the project:
- `hover:border-cyan-500/30` — Outstanding dues card
- `hover:border-indigo-500/30` — Plot info card
- `hover:border-brand-primary/50` — Generic interactive cards

#### Card Compound Components

```tsx
<Card variant="basic" elevation="low" padding="lg">
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

### Modal

**File:** `src/components/molecules/Modal.tsx`

#### Structure

```
Backdrop:   fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4
            animate-in fade-in duration-200

Container:  bg-slate-900 border border-slate-800 rounded-lg w-full max-h-[90vh] flex flex-col
            animate-in zoom-in-95 duration-200

Header:     p-6 border-b border-slate-800 shrink-0
Title:      text-2xl font-bold text-slate-100
Subtitle:   text-sm text-slate-400 mt-1
Close btn:  text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800/50

Body:       p-6 overflow-y-auto flex-1

Footer:     p-6 border-t border-slate-800 shrink-0
```

#### Sizes

| Size | Max Width |
|---|---|
| `sm` | `max-w-md` |
| `md` | `max-w-2xl` |
| `lg` | `max-w-4xl` |

#### Usage

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  subtitle="Supporting description"
  size="md"
  footer={<Button onClick={onClose}>Done</Button>}
>
  {/* content */}
</Modal>
```

---

### Confirm Dialog

**File:** `src/components/molecules/ConfirmDialog.tsx`

#### Structure

```
Backdrop:   fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm
            animate-in fade-in duration-200

Container:  w-full max-w-md bg-slate-900 border border-slate-800/40 rounded-lg shadow-2xl
            animate-in zoom-in-95 duration-200

Icon area:  p-3 rounded-full border (colour per variant)
Title:      text-xl font-bold text-slate-100
Message:    text-slate-400

Cancel:     px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg
Confirm:    px-4 py-2 rounded-lg text-white (colour per variant)
```

#### Variants

| Variant | Icon | Icon Color | Confirm Button |
|---|---|---|---|
| `danger` | AlertCircle | `text-red-400` | `bg-red-600 hover:bg-red-500` |
| `warning` | AlertTriangle | `text-orange-400` | `bg-orange-600 hover:bg-orange-500` |
| `info` | Info | `text-blue-400` | `bg-blue-600 hover:bg-blue-500` |
| `success` | CheckCircle2 | `text-green-400` | `bg-green-600 hover:bg-green-500` |

---

### Toast / Notification

**File:** `src/components/atoms/Toast.tsx`

#### Position

```
fixed top-4 right-4 z-50 animate-slide-in-right
```

#### Variants

| Variant | Background | Icon | Text |
|---|---|---|---|
| `success` | `bg-green-900/90 border-green-500/50` | `text-green-400` | `text-green-100` |
| `error` | `bg-red-900/90 border-red-500/50` | `text-red-400` | `text-red-100` |
| `warning` | `bg-yellow-900/90 border-yellow-500/50` | `text-yellow-400` | `text-yellow-100` |
| `info` | `bg-blue-900/90 border-blue-500/50` | `text-blue-400` | `text-blue-100` |

#### Container

```
flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-sm
min-w-[300px] max-w-md
```

---

### Alert (inline)

**File:** `src/components/atoms/Alert.tsx`

For inline feedback messages within content areas (not floating).

| Type | Background | Border | Icon Color | Text Color |
|---|---|---|---|---|
| `info` | `bg-blue-500/10` | `border-blue-500/20` | `text-violet-400` | `text-slate-400` |
| `warning` | `bg-yellow-500/10` | `border-yellow-500/20` | `text-yellow-400` | `text-yellow-200` |
| `error` | `bg-red-500/10` | `border-red-500/20` | `text-red-400` | `text-red-300` |
| `success` | `bg-emerald-500/10` | `border-emerald-500/20` | `text-green-400` | `text-green-300` |

**Pattern:**
```tsx
<div className="border rounded-lg p-4 bg-{colour}-500/10 border-{colour}-500/20">
  <div className="flex items-center gap-4">
    <Icon className="w-8 h-8 text-{colour}-400" />
    <span className="text-{colour}-300 text-md">{message}</span>
  </div>
</div>
```

Inline error/success feedback (used in forms and admin panels):
```tsx
// Error state
<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
  <AlertCircle className="w-5 h-5" />
  <span>{error}</span>
</div>

// Success state
<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">
  <CheckCircle2 className="w-5 h-5" />
  <span>{success}</span>
</div>
```

---

### Sidebar / Navigation

**File:** `src/components/molecules/Sidebar.tsx`

#### Structure

```
Sidebar:     lg:w-86 bg-zinc-950 border-r border-slate-800/40 lg:min-h-screen
Inner:       px-4 py-6 sticky top-0 h-screen flex flex-col

Avatar:      w-16 h-16 bg-violet-500/80 rounded-full flex items-center justify-center
             text-2xl font-bold (initials)

Title:       text-xl font-bold text-violet-500 (Admin Panel / user name)
Sub-label:   text-sm text-white font-medium (plot number)

Nav items:   space-y-2 (gap between items)
Nav link:    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
             transition-all duration-300 ease-in-out

Active:      bg-green-600 text-slate-900 shadow-lg
Inactive:    text-white hover:text-slate-100 hover:bg-green-600

Logout:      text-red-400 hover:text-red-300 hover:bg-red-900/20
             flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
             transition-all duration-300 ease-in-out

Divider:     border-t border-slate-800/40 (above logout)
```

#### Mobile Header Bar

```
lg:hidden flex items-center justify-between px-4 py-4
bg-slate-900/50 border-b border-slate-800/40
Title: text-lg font-bold text-slate-100
Hamburger: text-slate-400 hover:text-slate-100
```

---

### Table

Tables are built inline, not as a separate atom. Follow this exact pattern:

#### Container

```tsx
<section className="bg-slate-900/30 border border-slate-800/40 rounded-lg overflow-hidden">
```

#### Toolbar (above table)

```tsx
<div className="px-4 py-3 border-b border-slate-800/40 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-900/50">
```

#### Table Element

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead className="text-xs uppercase tracking-wider text-slate-500 bg-slate-900/50">
      <tr>
        <th className="text-left px-4 py-3 font-medium">Column</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-slate-800/30 hover:bg-slate-800/30 transition-colors">
        <td className="px-4 py-3 text-slate-300">value</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Column Text Colours

| Column Type | Class |
|---|---|
| Villa number / ID | `text-slate-300 font-mono` |
| Primary text (name) | `text-slate-200` |
| Secondary text (email, meta) | `text-xs text-slate-500` |
| Currency (amount due) | `text-slate-300 font-mono text-right` |
| Currency (paid) | `text-emerald-400 font-mono text-right` |
| Currency (outstanding) | `text-red-400 font-mono font-semibold text-right` |
| Date | `text-sm text-slate-400` |
| Muted / dim rows | `opacity-60` on `<tr>` |

#### Filter Chips (above tables)

```tsx
// Active
"px-3 py-1 rounded-md text-xs font-medium border bg-violet-500/20 text-violet-300 border-violet-500/30"

// Inactive
"px-3 py-1 rounded-md text-xs font-medium border bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50"
```

---

### Page Loader

**File:** `src/components/atoms/PageLoader.tsx`

**Inline loader:**
```
bg-slate-900/30 border border-slate-800/40 rounded-lg p-8
flex flex-col items-center gap-3
Spinner: Loader2 w-8 h-8 text-violet-400 animate-spin
Text: text-slate-400 text-sm
```

**Full-screen loader:**
```
fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999]
Inner: bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl
Spinner: Loader2 w-12 h-12 text-violet-400 animate-spin
Text: text-slate-300 font-medium
```

---

## 10. Status & Semantic Colors

### Bill / Payment Status

| Status | Background | Text | Border | Icon |
|---|---|---|---|---|
| PAID | `bg-emerald-500/15` | `text-emerald-300` | `border-emerald-500/30` | CheckCircle2 |
| PARTIAL | `bg-amber-500/15` | `text-amber-300` | `border-amber-500/30` | Clock |
| PENDING | `bg-red-500/15` | `text-red-300` | `border-red-500/30` | AlertCircle |
| CREDIT | `bg-violet-500/15` | `text-violet-300` | `border-violet-500/30` | CheckCircle2 |
| NO_BILLS | `bg-slate-500/15` | `text-slate-400` | `border-slate-500/30` | FileX |
| NOT_BILLABLE | `bg-slate-700/40` | `text-slate-500` | `border-slate-600/30` | Ban |

### User / Role States

| State | Colour |
|---|---|
| Admin role | `text-violet-400` / `bg-violet-500/10` |
| Verified resident | `text-green-400` |
| Unverified | `text-amber-400` |
| Unclaimed villa | `text-amber-400/70` |

### System Feedback

| State | Icon | Colour |
|---|---|---|
| Loading | Loader2 (spin) | `text-violet-400` |
| Error | AlertCircle / XCircle | `text-red-400` |
| Success | CheckCircle2 | `text-green-400` / `text-emerald-400` |
| Warning | AlertTriangle / AlertCircle | `text-yellow-400` / `text-orange-400` |
| Info | Info | `text-blue-400` |

---

## 11. Icons

**Library:** `lucide-react` (v1.16+)

### Sizing Convention

| Context | Size Class |
|---|---|
| Button icon | `w-4 h-4` (sm/md) / `w-5 h-5` (lg) |
| Nav icon | `w-5 h-5` |
| Page heading icon | `w-8 h-8` |
| Table row indicator | `w-3 h-3` — `w-4 h-4` |
| Status badge icon | `w-3 h-3` |
| Toast / Alert icon | `w-5 h-5` |
| Full-screen loader | `w-12 h-12` |
| Card icon accent | `w-5 h-5` (top-right) |

### Common Icons Used in the Project

| Icon | Import | Use |
|---|---|---|
| `Loader2` | lucide | Loading spinner (always `animate-spin`) |
| `AlertCircle` | lucide | Error, pending status |
| `CheckCircle2` | lucide | Success, paid status |
| `Clock` | lucide | Partial status, pending |
| `Search` | lucide | Search inputs |
| `ChevronRight` | lucide | Table row action, navigation |
| `X` | lucide | Close buttons |
| `LogOut` | lucide | Logout button |
| `Menu` | lucide | Mobile hamburger |
| `Trash2` | lucide | Delete action |
| `Edit` | lucide | Edit action |
| `Receipt` | lucide | Ledger / billing |
| `Users` | lucide | User management |
| `UserPlus` | lucide | Add user |
| `TrendingUp` / `TrendingDown` | lucide | Credit / debit |
| `Ban` | lucide | Not billable |
| `FileX` | lucide | No bills |
| `CreditCard` | lucide | Payment |

---

## 12. Layout & Grid

### App Shell

```tsx
<main className="min-h-screen bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out">
  <div className="min-h-screen flex flex-col lg:flex-row">
    <Sidebar />                          {/* lg:w-86, fixed left */}
    <div className="flex-1 p-6 lg:p-8"> {/* scrollable content area */}
      {children}
    </div>
  </div>
</main>
```

### Page Content Pattern

```tsx
<div className="space-y-6">
  {/* Page Header */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-violet-500/10 rounded-lg">
        <Icon className="w-6 h-6 text-violet-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">Page Title</h2>
        <p className="text-sm text-slate-400">Supporting description</p>
      </div>
    </div>
    {/* Optional CTA */}
    <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">
      <Icon className="w-4 h-4" />
      Action
    </button>
  </div>

  {/* Content grid / sections */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Cards */}
  </div>
</div>
```

### Responsive Grid Patterns

```tsx
// 2-col stat cards
"grid grid-cols-1 md:grid-cols-2 gap-4"

// 3-col stat cards  
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// 4-col (summary metrics)
"grid grid-cols-2 lg:grid-cols-4 gap-4"
```

---

## 13. Animation & Transitions

### Default Transition

All interactive elements (hover states, active states):
```
transition-all duration-200
transition-colors (colour-only changes)
transition-all duration-300 ease-in-out (nav items, sidebar)
```

### Modal / Dialog Entry

```
animate-in fade-in duration-200        ← backdrop
animate-in zoom-in-95 duration-200     ← panel
```

### Toast Entry

```
animate-slide-in-right    ← (custom keyframe, defined via Tailwind plugin)
```

### Loading

```
animate-spin    ← always on Loader2 icons
```

### Hover Patterns

| Element | Hover |
|---|---|
| Card | `hover:border-{color}/30 transition-all duration-300` |
| Table row | `hover:bg-slate-800/30 transition-colors` |
| Button | `hover:bg-{variant}/90` |
| Nav item | `hover:bg-green-600 transition-all duration-300 ease-in-out` |
| Icon button | `hover:text-slate-100 transition-colors` |

---

## 14. Scrollbar

Custom Material Design-inspired scrollbar applied via `custom-scrollbar` class (defined in `globals.css`):

```tsx
<div className="overflow-y-auto custom-scrollbar">
```

- 4px thin scrollbar
- Invisible at rest, appears on container hover
- Dark/light mode aware

---

## 15. Dos and Don'ts

### ✅ Do

- Use `bg-slate-900/30 border border-slate-800/40 rounded-lg` as the default card container.
- Use `text-slate-100` / `text-white` for page headings and `text-slate-400` for supporting text.
- Use `font-mono` for all numerical/financial data.
- Use `cn()` from `src/utils/classNames.ts` for merging conditional Tailwind classes.
- Use `transition-all duration-200` on all interactive elements.
- Use `backdrop-blur-sm` on all overlay backdrops.
- Use `space-y-6` as the default section spacing inside page content.
- Use `lucide-react` for all icons — no other icon library.
- Add `animate-spin` to `Loader2` icons — always, without exception.
- Use `opacity-60` on table rows that are disabled/inactive (e.g., `NOT_BILLABLE`).
- Use `aria-label`, `role`, `aria-modal` on modals and dialogs.

### ❌ Don't

- Don't use bright/saturated colors — no `bg-blue-500`, `bg-cyan-400`, `text-pink-400` for primary UI.
- Don't use `rounded-xl`, `rounded-2xl`, or `rounded-3xl` — breaks the tactical aesthetic.
- Don't use `text-gray-*` — always use `text-slate-*`.
- Don't hardcode hex colors in `className` — use CSS tokens or Tailwind classes.
- Don't add drop shadows to card bodies — use only border + transparency for depth.
- Don't use border thickness other than `border` (1px) — avoid `border-2` on containers.
- Don't create floating/absolute-positioned decorative elements or background blobs.
- Don't use gradients on text (`bg-clip-text`).
- Don't use `font-black` or `font-extrabold` — max is `font-bold`.
- Don't forget `transition-colors` / `transition-all` on any interactive element.
- Don't skip `placeholder:text-slate-500` on input fields — placeholders must be dim.

---

## Appendix: Quick Reference Cheatsheet

```tsx
// Standard page card
<div className="bg-slate-900/30 border border-slate-800/40 rounded-lg p-6">

// Section heading with icon
<div className="flex items-center gap-3">
  <div className="p-2 bg-violet-500/10 rounded-lg">
    <Icon className="w-6 h-6 text-violet-400" />
  </div>
  <h2 className="text-2xl font-bold text-white">Title</h2>
</div>

// Primary CTA button
<button className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors">

// Danger action
<button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition-colors">

// Table container
<section className="bg-slate-900/30 border border-slate-800/40 rounded-lg overflow-hidden">

// Search input
<input className="pl-9 pr-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-md text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50">

// Error feedback
<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">

// Success feedback
<div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400">

// Modal backdrop
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">

// Modal panel
<div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

// Loading spinner
<Loader2 className="w-8 h-8 text-violet-400 animate-spin" />

// Status badge (PAID)
<span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">

// Currency value (positive)
<span className="font-mono text-emerald-400">{inr(amount)}</span>

// Currency value (outstanding)
<span className="font-mono text-red-400 font-semibold">{inr(outstanding)}</span>
```
