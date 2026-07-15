# Design Tokens Reference — Full OKLCH Values

Source: `src/styles/globals.css`

## Light Mode

```css
--background: oklch(0.985 0 0);
--foreground: oklch(0.324 0.009 120);

--card: oklch(0.985 0 0);
--card-foreground: oklch(0.324 0.009 120);

--primary: oklch(0.72 0.192 150);
--primary-foreground: oklch(0.984 0.003 210);
--primary-depth: oklch(0.614 0.163 150);
--primary-light: oklch(0.811 0.178 152);
--primary-dark: oklch(0.364 0.082 153);

--secondary: oklch(0.759 0.137 232);
--secondary-foreground: oklch(0.984 0.003 210);
--secondary-depth: oklch(0.677 0.148 238);

--highlight: oklch(0.825 0.108 346);
--highlight-depth: oklch(0.724 0.176 350);

--super: oklch(0.627 0.233 304);
--super-foreground: oklch(0.985 0 0);
--super-depth: oklch(0.557 0.251 302);

--destructive: oklch(0.673 0.215 25);
--destructive-depth: oklch(0.605 0.225 27);

--muted: oklch(0.956 0.003 150);
--muted-foreground: oklch(0.565 0.022 157);

--accent: oklch(0.956 0.003 150);
--accent-foreground: oklch(0.324 0.009 120);

--border: oklch(0.925 0.003 160);
--input: oklch(0.871 0.007 144);
--ring: oklch(0.72 0.192 150);

--disabled: oklch(0.925 0.003 160);
--disabled-foreground: oklch(0.602 0.013 120);
--loading: oklch(0.925 0.003 160);
```

## Dark Mode (`.dark` class)

```css
--background: oklch(0.198 0.013 198);
--foreground: oklch(0.865 0.022 226);

--card: oklch(0.219 0.015 198);
--card-foreground: oklch(0.85 0.021 224);

--primary: oklch(0.72 0.192 150);
--primary-depth: oklch(0.614 0.163 150);

--muted: oklch(0.417 0.016 142);
--muted-foreground: oklch(0.59 0.019 141);

--border: oklch(0.341 0.01 203);
--input: oklch(0.301 0.009 203);
```

Note: Dark mode uses `@custom-variant dark (&:is(.dark *))`. No separate color values needed in components — just use `bg-card text-foreground` etc.

## Unit Colors (same in both modes)

```css
--unit-1: #58cc02;
--unit-2: #ce82ff;
--unit-3: #ff9600;
--unit-4: #ff4b4b;
--unit-5: #1cb0f6;
--unit-6: #00cd9c;
--unit-7: #ff86d0;
--unit-8: #dc8f47;
--unit-0: #0047AB;
```

## Z-Index Scale

```css
--z-1: 1;
--z-2: 2;
```

## CSS Animations (globals.css)

```css
--animate-accordion-down: accordion-down 0.2s ease-out;
--animate-accordion-up: accordion-up 0.2s ease-out;
--animate-footer-marquee: footer-marquee 20s linear infinite;
--animate-footer-pulse: footer-pulse 2s ease-in-out infinite;
--animate-spin-slow: spin 3s linear infinite;
--animate-bounce-slow: bounce-slow 2s ease-in-out infinite;
```

## Keyframes Reference

```css
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

## Color-mix Utility

Used for pastel icon backgrounds — always use `in srgb`:

```css
background-color: color-mix(in srgb, var(--unit-N) 20%, transparent)
```

## Tailwind Custom Utilities

```css
@utility container {
  @apply mx-auto;
}
.paused { animation-play-state: paused; }
.scrollbar-hide { /* hides scrollbar cross-browser */ }
.scrollbar-thin { /* thin scrollbar with rounded thumb */ }
```
