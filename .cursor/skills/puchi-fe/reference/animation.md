# Animation Gallery — Complete Recipes

Import: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`.

All recipes include reduced-motion respect.

---

## 1. Page/Content Transition (AnimatePresence)

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: "easeInOut" }}
  >
    <Content />
  </motion.div>
</AnimatePresence>
```

---

## 2. Stagger Children Enter

```tsx
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

<motion.div variants={container} initial="hidden" animate="show">
  <motion.div variants={itemAnim}>Item 1</motion.div>
  <motion.div variants={itemAnim}>Item 2</motion.div>
</motion.div>
```

---

## 3. Tab Slider Indicator

```tsx
<button className="relative flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium z-10">
  <motion.div
    animate={{ scale: isActive ? 1 : 0.85, opacity: isActive ? 1 : 0.5 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
  >
    <Icon size={18} />
  </motion.div>
  <span>{label}</span>
  {isActive && (
    <motion.div
      layoutId="tab-indicator"
      className="absolute inset-0 bg-background rounded-xl shadow-sm -z-10"
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    />
  )}
</button>
```

---

## 4. Spring Card Hover

```tsx
<motion.div
  className="rounded-2xl bg-card border border-border p-4 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
  whileHover={{ y: -2 }}
  whileTap={{ scale: 0.97 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
>
  content
</motion.div>
```

---

## 5. Animated Progress Bar

```tsx
<motion.div
  className="h-2.5 bg-muted rounded-full overflow-hidden"
  animate={{ /* re-trigger via key change or local state */ }}
>
  <motion.div
    className="h-full rounded-full bg-primary"
    initial={{ width: 0 }}
    animate={{ width: `${percent}%` }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  />
</motion.div>
```

---

## 6. Shimmer Effect

```tsx
const prefersReducedMotion = useReducedMotion();

{!prefersReducedMotion && (
  <motion.div
    className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
    animate={{ x: ["-100%", "400%"] }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  />
)}
```

---

## 7. Bouncing Number (on mount)

```tsx
<motion.span
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
>
  {value}
</motion.span>
```

---

## 8. Right Bar Slide-In Items

```tsx
<button
  onClick={...}
  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
>
  <div className="w-9 h-9 rounded-xl flex items-center justify-center ...">
    <Icon size={18} />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium group-hover:text-[var(--unit-N)] transition-colors">
      {title}
    </p>
    <p className="text-xs text-muted-foreground truncate">
      {description}
    </p>
  </div>
</button>
```

---

## 9. Spring Stagger — List Items

```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
    whileHover={{ x: 4, backgroundColor: "var(--muted)" }}
    whileTap={{ scale: 0.98 }}
  >
    content
  </motion.div>
))}
```

---

## 10. Badge Grid Enter

```tsx
<motion.button
  initial={{ opacity: 0, y: 16, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
  whileHover={{ scale: 1.08, y: -3 }}
  whileTap={{ scale: 0.92 }}
>
  ...
</motion.button>
```

---

## 11. Waffle Grid (100 cells — staggered)

```tsx
{Array.from({ length: 100 }).map((_, i) => (
  <motion.div
    key={i}
    className="w-2.5 h-2.5 rounded-[2px]"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: i * 0.003 + 0.2, type: "spring", stiffness: 400, damping: 12 }}
  />
))}
```

---

## 12. SVG Line Chart — Path Draw

```tsx
<motion.polyline
  points={dataPoints}
  fill="none"
  stroke="var(--primary)"
  strokeWidth={2.5}
  strokeLinecap="round"
  strokeLinejoin="round"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
/>
{/* Also fill area */}
<motion.polygon
  points={areaPoints}
  fill="var(--primary)"
  opacity={0.1}
  initial={{ opacity: 0 }}
  animate={{ opacity: 0.1 }}
  transition={{ duration: 0.6, delay: 0.2 }}
/>
```

---

## 13. SVG Spring Dots (chart)

```tsx
{data.map((d, i) => (
  <motion.circle
    key={i}
    cx={x} cy={y} r={3}
    fill="var(--primary)" stroke="var(--background)" strokeWidth={1.5}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 0.6 + i * 0.04, type: "spring", stiffness: 300, damping: 15 }}
  />
))}
```

---

## 14. Weekly Day Pills

```tsx
{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
  <motion.div
    key={day}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 15 }}
    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
      isToday ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
        : isPast ? "bg-[color-mix(in_srgb,var(--primary)_30%,transparent)] text-primary"
          : "bg-muted text-muted-foreground"
    }`}
  >
    {isPast ? "✓" : "—"}
  </motion.div>
))}
```

---

## 15. Inline Stagger (manual delay array)

```tsx
{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
  >
    {item}
  </motion.div>
))}
```
