# Puchi Homepage Mascot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the public homepage a recognizable Puchi presence through the hero and a concise three-skill learning journey.

**Architecture:** Keep the homepage composition server-rendered. Extend the existing `Hero` component with the welcoming mascot and add a focused `PuchiJourney` landing component after the language selector; both components load the user-provided assets from `public/images/mascot` through `next/image`.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, next/image, motion/react.

---

### Task 1: Add the homepage brand visual

**Files:**
- Modify: `src/components/landing/Hero.tsx`

- [ ] Add a responsive Puchi welcome image beside the hero copy using `next/image`.
- [ ] Preserve the current primary CTA and existing decorative SVGs.
- [ ] Confirm the mascot has meaningful alt text and does not affect the hero's keyboard flow.

### Task 2: Add the three-skill Puchi journey

**Files:**
- Create: `src/components/landing/PuchiJourney.tsx`
- Modify: `src/app/[locale]/(public)/page.tsx`

- [ ] Create three responsive skill cards for listening, reading, and writing using existing mascot PNGs.
- [ ] Use the existing landing typography, semantic color tokens, and motion primitives.
- [ ] Place the section between language discovery and metrics so it explains the product before social proof.

### Task 3: Verify the public landing page

**Files:**
- Verify: `src/components/landing/Hero.tsx`
- Verify: `src/components/landing/PuchiJourney.tsx`
- Verify: `src/app/[locale]/(public)/page.tsx`

- [ ] Run the available lint and production build checks (the project has no test runner configured, so no new test framework will be introduced for this focused visual change).
- [ ] Open the homepage at desktop and mobile widths and inspect the new imagery for overflow, readability, and dark-mode contrast.
