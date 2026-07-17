---
name: puchi-fe
description: Design and interaction patterns for Puchi Frontend. Use when building new pages, components, or adding animations/styling to the Puchi learning app. Covers design tokens, card patterns, animation constants, icon containers, hydration safety, and feature folder conventions.
---

# Puchi FE — Design & Interaction Patterns

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, output: standalone) |
| Language | React 19, TypeScript |
| Styling | Tailwind CSS v4 + Shadcn UI (New York, 27 components) |
| Animation | `motion` (framer-motion v12) |
| Icons | Lucide React |
| i18n | `next-intl`, 9 locales (messages/*.json) |
| Auth | Auth-service (self-hosted, Go/Kratos) |
| State | Zustand v5 |
| Package mgmt | Bun (install) → Node.js 22 (build & run) |

---

## Design Tokens

### Colors (OKLCH — `globals.css`)

```
--primary:  oklch(0.72 0.192 150)       green        # General CTAs, progress bars
--primary-depth: oklch(0.614 0.163 150)               darker green, button depth
--primary-light: oklch(0.811 0.178 152)               lighter green, XP bar gradient
--primary-dark: oklch(0.364 0.082 153)                darkest green, heatmap max

--secondary: oklch(0.759 0.137 232)      blue         secondary CTAs
--highlight: oklch(0.825 0.108 346)      pink/red     featured highlights
--super: oklch(0.627 0.233 304)          purple       premium

--destructive: oklch(0.673 0.215 25)     red          danger zone
--muted-foreground: oklch(0.565 0.022 157)            secondary text
```

### Unit Colors (9 gamification colors)

```css
--unit-1: #58cc02;   /* green    — lessons, following   */
--unit-2: #ce82ff;   /* purple   — achievements         */
--unit-3: #ff9600;   /* orange   — XP, crowns, find     */
--unit-4: #ff4b4b;   /* red      — streak, hearts, invite*/
--unit-5: #1cb0f6;   /* blue     — accuracy, gems       */
--unit-6: #00cd9c;   /* teal     — total hours           */
--unit-7: #ff86d0;   /* pink     — unused in profile     */
--unit-8: #dc8f47;   /* brown    — unused in profile     */
--unit-0: #0047AB;   /* navy     — unused in profile     */
```

### Fonts

| Font | Token | Weight | Used for |
|---|---|---|---|
| Capriola | `--font-display` | 700+ | Headings, big numbers, streak |
| Gabarito | `--font-sans` | 400-600 | Body, tabs, labels, buttons |
| DIN | `--font-din` | 700 | Stat numbers, XP, metrics |

### Border Radius Scale

```
--radius: 0.5rem;        /* base */
rounded-2xl: 1rem;        /* cards */
rounded-3xl: 1.5rem;      /* hero card, containers */
rounded-xl: 0.75rem;      /* icon containers, small cards */
rounded-lg: calc(radius)  /* Shadcn default */
rounded-full: 9999px;     /* avatars, pills */
```

### Shadows

```css
/* Default card border + subtle hover shadow (claymorphism) */
border border-border
hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]

/* Active press */
active:scale-[0.97]
```

### Quick Reference — Card variants

| Variant | Classes | Use case |
|---|---|---|
| Clay card | `rounded-2xl bg-card border border-border p-5` | Stats, sections, progress |
| Hero card | `rounded-3xl bg-card border border-border p-6 space-y-5` | Profile hero, top-level |
| Gradient accent | `rounded-2xl bg-gradient-to-r from-[color-mix(...unit-4...)] to-[color-mix(...unit-3...)] border border-[...unit-4...] p-5` | Streak, achievements |
| Icon containers (solid) | `rounded-xl w-10 h-10 flex items-center justify-center` + `style={{ backgroundColor: color, color: "white" }}` | StatCard icons |
| Icon containers (pastel) | `w-9 h-9 rounded-xl flex items-center justify-center` + `style={{ backgroundColor: "color-mix(in srgb, var(--unit-N) 20%, transparent)", color: "var(--unit-N)" }}` | Right bar icons |
| Gradient avatar | `rounded-full bg-gradient-to-br from-[var(--unit-1)] to-[var(--unit-5)] text-white` | Friend avatars |

---

## Animation Constants

All from `motion` (framer-motion v12). Import: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`.

### Spring Constants

| Context | Stiffness | Damping | Example |
|---|---|---|---|
| Tab indicator slider | 400 | 30 | `layoutId="tab-indicator"` |
| Tab icon scale | 400 | 20 | active=scale1, inactive=scale0.85 |
| Card hover lift | 400 | 15 | `whileHover={{ y: -2 }}` |
| Card spring enter | 300 | 20 | `initial={{ opacity:0, y:16 }}` |
| Stagger items | 300 | 20 | staggerChildren 0.06-0.08 delay |
| Bounce numbers | 200 | 12 | `initial={{ scale:0 }}` on stat values |
| Badge hover | 300 | 20 | `whileHover={{ scale: 1.08, y: -3 }}` |
| Progress bar fill | — | — | `duration: 0.8, ease: "easeOut"` (not spring) |

### Tab Switch Transition

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    <TabComponent />
  </motion.div>
</AnimatePresence>
```

### Tab Slider Indicator

```tsx
<button className="relative ... z-10">
  <tab.icon ... />
  {isActive && (
    <motion.div
      layoutId="tab-indicator"
      className="absolute inset-0 bg-background rounded-xl shadow-sm -z-10"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  )}
</button>
```

### Animated Progress Bar

```tsx
<div className="h-2.5 bg-muted rounded-full overflow-hidden">
  <motion.div
    className="h-full rounded-full bg-primary"
    initial={{ width: 0 }}
    animate={{ width: `${percent}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  />
</div>
```

### Shimmer Effect (XP bar etc.)

```tsx
<motion.div
  className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
  animate={{ x: ["-100%", "400%"] }}
  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
/>
```

### Reduced Motion

Always check `useReducedMotion()` from `motion/react`. When true, skip continuous animations:

```tsx
const prefersReducedMotion = useReducedMotion();
// ...
animate={prefersReducedMotion ? {} : { ... }}
```

---

## Component Conventions

### Feature Folder Structure

```
components/<feature>/
├── <Feature>Hero.tsx        # Top-level section (server or client)
├── <Feature>Tabs.tsx        # Navigation sub-component
├── shared/
│   ├── StatCard.tsx         # Reusable card across features
│   └── BadgeGrid.tsx        # Reusable grid
└── tabs/
    ├── OverviewTab.tsx      # Tab content
    └── StatsTab.tsx
```

### Icon Containers

Solid color background (for stat cards, overview):

```tsx
<div
  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
  style={{ backgroundColor: color, color: "white" }}
>
  <Icon size={20} />
</div>
```

Pastel background (for right bar links):

```tsx
<div
  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
  style={{ backgroundColor: "color-mix(in srgb, var(--unit-N) 20%, transparent)", color: "var(--unit-N)" }}
>
  <Icon size={18} />
</div>
```

Gradient background (for decorative icons):

```tsx
<div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--unit-2)] to-[var(--unit-6)] text-white">
  <Settings size={18} />
</div>
```

### Card Section Container

Every section card uses: `rounded-2xl bg-card border border-border p-5` (or `p-4` for dense). Title uses `font-display text-lg font-bold`.

### Hover Color Shift (Right Bar Links)

```tsx
<Link className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group">
  <div className="...">icon</div>
  <p className="text-sm font-medium group-hover:text-[var(--unit-N)] transition-colors">text</p>
</Link>
```

### Sign Out (Client-side)

```tsx
import { useAuth } from "@/providers/AuthProvider";

const { logout } = useAuth();
<button onClick={() => logout().then(() => window.location.reload())}>
  Sign Out
</button>
```

### Sign Out (Server Action — Sidebar)

```tsx
import { logoutAction } from "@/actions/auth";

<form action={logoutAction}>
  <button type="submit">Sign Out</button>
</form>
```

---

## Hydration Safety

### toLocaleString

Always specify locale to avoid mismatch between server (Node en-US) and browser:

```tsx
❌ {value.toLocaleString()}
✅ {value.toLocaleString("en-US")}
```

### Theme Hydration (SelectTheme pattern)

```tsx
// DO NOT return null pre-hydration — render matching placeholder
if (!hydrated) return (
  <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
    <span>Theme</span>
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
);
```

### Date.toLocaleString

```tsx
// Use toLocaleDateString without extra arguments for consistent server/client
new Date(dateStr).toLocaleDateString("en-US")
```

### Mock Data → API Migration

- Mock data in `src/data/<feature>Mock.ts`
- Real API at `src/services/<feature>.service.ts`
- Page layer swaps: replace `mockFullProfile` import with real API call

---

## i18n Conventions

```tsx
import { useTranslations } from "next-intl";
const t = useTranslations("FeatureName");
// Use: t("key") or t("nested.key")
```

Add new keys to `messages/en.json` and `messages/vi.json` under correct namespace.

---

## Additional Resources

- For design tokens reference with all OKLCH values, see [reference/design-tokens.md](reference/design-tokens.md)
- For animation recipe gallery with complete code, see [reference/animation.md](reference/animation.md)
- For existing project rules, see `.cursor/rules/project.mdc` (auth, docker, CI/CD, env vars) and `.cursor/rules/nextjs.mdc` (App Router, auth integration, API layer)
