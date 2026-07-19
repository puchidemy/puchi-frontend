# Puchi Journey Map (Unit 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-20-puchi-journey-map-design.md`

**Goal:** Replace the Duolingo-style Unit 1 lesson path with a pan/zoom Vietnam diorama journey map, chapter full-screen screen, and versioned art assets.

**Architecture:** Static `JourneyMapConfig` drives hotspot layout (never inferred from pixels). Runtime landmark status is derived from `baseStatus` + `getUnit` lessons + `completedLessonIds`. MVP renders one `island-base` image with CSS markers; Approach 2 asset folders are reserved. Chapter route guards redirect locked/`coming_soon` with a short-lived sonner tip.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind, next/image, next-intl, sonner, zustand trial store, motion (optional reduced-motion), Bun install / Node build.

## Global Constraints

- Spec is authoritative: Approach 1 MVP UI, Approach 2-ready asset tree under `unit-1/v1/`.
- Hotspots only from `JourneyMapConfig` — never auto-detect from image pixels.
- Runtime status ∈ `unlocked | locked | coming_soon | completed`; `isCurrent` is a separate boolean.
- Progress `1/3` ⇒ `status: "unlocked"` + `isCurrent: true`.
- Completed chapter CTA = **Review** (not Continue).
- Tips via sonner / ephemeral state — do not persist tip text in the URL.
- Restore map viewport from `sessionStorage` when returning from Chapter.
- Separate hotspot `visualSize` vs `hitArea` (hit ≥ 44px).
- Keep guest soft-gate (3 lessons); do not change LessonPlayer / learn APIs.
- No new test runner in this repo — pure logic gets a Bun selftest script; UI verified via lint/build + manual QA.
- Commit only when the human enables commits or explicitly asks.

---

## File Structure Map

```
puchi-frontend/
  src/lib/journey-map/
    types.ts                 # config + runtime types
    unit-1-config.ts         # JourneyMapConfig for Unit 1
    derive.ts                # deriveLandmarkViews()
    chapter-access.ts        # resolveChapterAccess()
    viewport.ts              # sessionStorage viewport load/save
  src/lib/journey-map/selftest.ts   # bun-runnable assertions
  src/components/learn/journey/
    JourneyMapView.tsx       # /learn map shell
    JourneyMapHeader.tsx
    JourneyMapCanvas.tsx     # pan/zoom + image + hotspots
    JourneyHotspot.tsx
    JourneyPuchiOverlay.tsx
    ChapterView.tsx          # chapter full-screen UI
  src/app/[locale]/(protected)/(nav)/(learn)/learn/
    page.tsx                 # unchanged entry → UnitLearnView
    chapter/[landmarkSlug]/page.tsx
  src/components/learn/UnitLearnView.tsx   # swap TrialUnitPath → JourneyMapView
  public/images/learn/journey/unit-1/v1/
    key-visual/vietnam-diorama-kv.webp
    map/island-base.webp
    landmarks/hoan-kiem/hero.webp
    landmarks/{…}/           # reserved dirs + .gitkeep
  messages/{en,vi}.json      # Learn.Journey.*
```

---

### Task 1: Types, Unit 1 config, derive + chapter access

**Files:**
- Create: `src/lib/journey-map/types.ts`
- Create: `src/lib/journey-map/unit-1-config.ts`
- Create: `src/lib/journey-map/derive.ts`
- Create: `src/lib/journey-map/chapter-access.ts`
- Create: `src/lib/journey-map/selftest.ts`
- Modify: `package.json` (add script `"test:journey-map": "bun src/lib/journey-map/selftest.ts"`)

**Interfaces:**
- Produces:
  - `JourneyMapConfig`, `JourneyLandmark`, `RuntimeLandmarkStatus`, `DerivedLandmarkView`
  - `UNIT_1_JOURNEY_MAP: JourneyMapConfig`
  - `deriveLandmarkViews(config, skills, completedLessonIds): DerivedLandmarkView[]`
  - `resolveChapterAccess(config, views, slug): { ok: true; view } | { ok: false; reason }`

- [ ] **Step 1: Add types**

```ts
// src/lib/journey-map/types.ts
import type { LearnSkill } from "@/lib/learn-api";

export type LandmarkBaseStatus = "unlocked" | "locked" | "coming_soon";
export type RuntimeLandmarkStatus =
  | "unlocked"
  | "locked"
  | "coming_soon"
  | "completed";

export type JourneyViewport = { x: number; y: number; zoom: number };

export type JourneyLandmark = {
  slug: string;
  skillId?: string;
  baseStatus: LandmarkBaseStatus;
  hotspot: { x: number; y: number };
  visualSize: number;
  hitArea: number;
  assets: {
    hero?: string;
    pin?: string;
    states?: Partial<
      Record<"idle" | "glow" | "locked" | "completed", string>
    >;
  };
};

export type JourneyMapConfig = {
  unitId: string;
  version: number;
  mapDimensions: { width: number; height: number };
  defaultViewport: JourneyViewport;
  assetBasePath: string; // e.g. /images/learn/journey/unit-1/v1
  landmarks: JourneyLandmark[];
};

export type DerivedLandmarkView = {
  slug: string;
  baseStatus: LandmarkBaseStatus;
  status: RuntimeLandmarkStatus;
  isCurrent: boolean;
  hotspot: JourneyLandmark["hotspot"];
  visualSize: number;
  hitArea: number;
  assets: JourneyLandmark["assets"];
  skillId?: string;
  lessons: LearnSkill["lessons"];
  completedCount: number;
  totalCount: number;
};
```

- [ ] **Step 2: Add Unit 1 config**

Use seed skill id `22222222-2222-2222-2222-222222222222` and `DEFAULT_UNIT_ID` value. Placeholder hotspots (tune after art lands — still authored here, never from pixels):

```ts
// src/lib/journey-map/unit-1-config.ts
import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 1,
  mapDimensions: { width: 2048, height: 2048 },
  defaultViewport: { x: 0.5, y: 0.42, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      hotspot: { x: 0.48, y: 0.28 },
      visualSize: 28,
      hitArea: 48,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.40, y: 0.34 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.52, y: 0.32 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.44, y: 0.48 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.56, y: 0.52 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.38, y: 0.62 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.50, y: 0.68 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base.webp`;
}
```

- [ ] **Step 3: Implement derive + chapter access**

```ts
// src/lib/journey-map/derive.ts
import type { LearnLesson, LearnSkill } from "@/lib/learn-api";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
  RuntimeLandmarkStatus,
} from "./types";

function lessonsForLandmark(
  landmarkSkillId: string | undefined,
  skills: LearnSkill[],
  isPrimaryUnlocked: boolean,
): LearnLesson[] {
  if (landmarkSkillId) {
    const skill = skills.find((s) => s.id === landmarkSkillId);
    if (skill) return skill.lessons;
  }
  // MVP fallback: primary unlocked landmark without matching skillId gets all unit lessons
  if (isPrimaryUnlocked) {
    return skills.flatMap((s) => s.lessons);
  }
  return [];
}

export function deriveLandmarkViews(
  config: JourneyMapConfig,
  skills: LearnSkill[],
  completedLessonIds: string[],
): DerivedLandmarkView[] {
  const completed = new Set(completedLessonIds);
  const allLessons = skills.flatMap((s) => s.lessons);
  const firstIncomplete = allLessons.find((l) => !completed.has(l.id));

  return config.landmarks.map((landmark) => {
    const lessons = lessonsForLandmark(
      landmark.skillId,
      skills,
      landmark.baseStatus === "unlocked",
    );
    const totalCount = lessons.length;
    const completedCount = lessons.filter((l) => completed.has(l.id)).length;

    let status: RuntimeLandmarkStatus;
    if (landmark.baseStatus === "coming_soon") status = "coming_soon";
    else if (landmark.baseStatus === "locked") status = "locked";
    else if (totalCount > 0 && completedCount === totalCount) status = "completed";
    else status = "unlocked";

    const isCurrent =
      status === "unlocked" &&
      totalCount > 0 &&
      !!firstIncomplete &&
      lessons.some((l) => l.id === firstIncomplete.id);

    return {
      slug: landmark.slug,
      baseStatus: landmark.baseStatus,
      status,
      isCurrent,
      hotspot: landmark.hotspot,
      visualSize: landmark.visualSize,
      hitArea: landmark.hitArea,
      assets: landmark.assets,
      skillId: landmark.skillId,
      lessons,
      completedCount,
      totalCount,
    };
  });
}
```

```ts
// src/lib/journey-map/chapter-access.ts
import type { DerivedLandmarkView, JourneyMapConfig } from "./types";

export type ChapterAccess =
  | { ok: true; view: DerivedLandmarkView }
  | { ok: false; reason: "unknown_slug" | "locked" | "coming_soon" };

export function resolveChapterAccess(
  config: JourneyMapConfig,
  views: DerivedLandmarkView[],
  slug: string,
): ChapterAccess {
  if (!config.landmarks.some((l) => l.slug === slug)) {
    return { ok: false, reason: "unknown_slug" };
  }
  const view = views.find((v) => v.slug === slug);
  if (!view) return { ok: false, reason: "unknown_slug" };
  if (view.status === "coming_soon") return { ok: false, reason: "coming_soon" };
  if (view.status === "locked") return { ok: false, reason: "locked" };
  return { ok: true, view };
}
```

- [ ] **Step 4: Selftest**

```ts
// src/lib/journey-map/selftest.ts
import { deriveLandmarkViews } from "./derive";
import { resolveChapterAccess } from "./chapter-access";
import { UNIT_1_JOURNEY_MAP } from "./unit-1-config";
import type { LearnSkill } from "@/lib/learn-api";

const skills: LearnSkill[] = [
  {
    id: "22222222-2222-2222-2222-222222222222",
    unit_id: UNIT_1_JOURNEY_MAP.unitId,
    position: 1,
    title: "Greetings",
    lessons: [
      { id: "l1", skill_id: "22222222-2222-2222-2222-222222222222", position: 1, title: "A", xp_reward: 10, required: true },
      { id: "l2", skill_id: "22222222-2222-2222-2222-222222222222", position: 2, title: "B", xp_reward: 10, required: true },
      { id: "l3", skill_id: "22222222-2222-2222-2222-222222222222", position: 3, title: "C", xp_reward: 10, required: true },
    ],
  },
];

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const zero = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, []);
assert(zero[0].status === "unlocked" && zero[0].isCurrent, "0/3 current unlocked");
assert(zero[1].status === "coming_soon", "landmark 2 coming_soon");

const mid = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, ["l1"]);
assert(mid[0].status === "unlocked" && mid[0].isCurrent, "1/3 still unlocked+current");

const done = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, ["l1", "l2", "l3"]);
assert(done[0].status === "completed" && !done[0].isCurrent, "3/3 completed");

assert(
  resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "nope").ok === false,
  "bad slug",
);
assert(
  resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "bamboo-grove").reason ===
    "coming_soon",
  "coming_soon blocked",
);
assert(resolveChapterAccess(UNIT_1_JOURNEY_MAP, zero, "hoan-kiem").ok, "open ok");

console.log("journey-map selftest OK");
```

Run: `bun src/lib/journey-map/selftest.ts`  
Expected: `journey-map selftest OK`

- [ ] **Step 5: Commit** (if enabled)

```bash
git add src/lib/journey-map package.json
git commit -m "feat(learn): add journey map config and status derive"
```

---

### Task 2: Viewport persistence helpers

**Files:**
- Create: `src/lib/journey-map/viewport.ts`

**Interfaces:**
- Consumes: `JourneyViewport`, `JourneyMapConfig.unitId`
- Produces: `loadJourneyViewport(unitId, fallback)`, `saveJourneyViewport(unitId, viewport)`

- [ ] **Step 1: Implement sessionStorage helpers**

```ts
// src/lib/journey-map/viewport.ts
import type { JourneyViewport } from "./types";

function key(unitId: string) {
  return `learn:journey:${unitId}:viewport`;
}

export function loadJourneyViewport(
  unitId: string,
  fallback: JourneyViewport,
): JourneyViewport {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key(unitId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<JourneyViewport>;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.zoom !== "number"
    ) {
      return fallback;
    }
    return { x: parsed.x, y: parsed.y, zoom: parsed.zoom };
  } catch {
    return fallback;
  }
}

export function saveJourneyViewport(
  unitId: string,
  viewport: JourneyViewport,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key(unitId), JSON.stringify(viewport));
}
```

- [ ] **Step 2: Manual check in DevTools** — set item, reload helper via temporary console import or unit in next task.

- [ ] **Step 3: Commit** (if enabled)

```bash
git add src/lib/journey-map/viewport.ts
git commit -m "feat(learn): persist journey map viewport in sessionStorage"
```

---

### Task 3: Asset tree + generate art pack v1

**Files:**
- Create dirs under `public/images/learn/journey/unit-1/v1/` per spec
- Create: `.gitkeep` in reserved landmark folders
- Add generated: `key-visual/vietnam-diorama-kv.webp`, `map/island-base.webp`, `landmarks/hoan-kiem/hero.webp`

**Interfaces:**
- Produces: files at paths referenced by `UNIT_1_JOURNEY_MAP.assetBasePath`

- [ ] **Step 1: Create folder skeleton**

```bash
cd puchi-frontend
mkdir -p public/images/learn/journey/unit-1/v1/key-visual
mkdir -p public/images/learn/journey/unit-1/v1/map
mkdir -p public/images/learn/journey/unit-1/v1/landmarks/hoan-kiem/states
for slug in one-pillar-pagoda old-quarter coffee-shop street-food bamboo-grove traditional-bridge; do
  mkdir -p "public/images/learn/journey/unit-1/v1/landmarks/$slug/states"
  touch "public/images/learn/journey/unit-1/v1/landmarks/$slug/.gitkeep"
done
```

- [ ] **Step 2: Generate key visual** (Higgsfield GPT Image 2 or Nano Banana Pro — landscape 1:1 or 4:3)

Prompt essentials from spec §6: floating Vietnam island diorama, isometric 3/4, Nintendo/Monument Valley/Animal Crossing, landmarks listed, Puchi stylized 3D waving near Hoàn Kiếm, no text/UI/watermarks/people/cars. Save raw then convert/resize to `vietnam-diorama-kv.webp`.

- [ ] **Step 3: Generate `island-base`** — same camera/style as KV, **no Puchi**, no text. Save `map/island-base.webp` at `mapDimensions` aspect (2048×2048 target).

- [ ] **Step 4: Generate or crop `hoan-kiem/hero.webp`** — chapter close-up of Hoàn Kiếm landmark, same style, no Puchi required.

- [ ] **Step 5: Visually place hotspots** — open island-base, estimate normalized (x,y) for 7 landmarks; update `unit-1-config.ts` only (never pixel-auto). Re-run selftest.

- [ ] **Step 6: Commit** (if enabled)

```bash
git add public/images/learn/journey/unit-1/v1 src/lib/journey-map/unit-1-config.ts
git commit -m "assets(learn): add unit-1 v1 journey map art pack"
```

---

### Task 4: Map canvas — pan/zoom + hotspots + Puchi overlay

**Files:**
- Create: `src/components/learn/journey/JourneyMapCanvas.tsx`
- Create: `src/components/learn/journey/JourneyHotspot.tsx`
- Create: `src/components/learn/journey/JourneyPuchiOverlay.tsx`
- Create: `src/components/learn/journey/JourneyMapHeader.tsx`

**Interfaces:**
- Consumes: `JourneyMapConfig`, `DerivedLandmarkView[]`, viewport load/save
- Produces: interactive map UI callbacks `onSelectLandmark(slug)`

- [ ] **Step 1: `JourneyHotspot`**

```tsx
// visualSize for marker; hitArea for button min width/height (≥44)
<button
  type="button"
  aria-label={ariaLabel}
  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
  style={{
    left: `${hotspot.x * 100}%`,
    top: `${hotspot.y * 100}%`,
    width: hitArea,
    height: hitArea,
  }}
  onClick={onSelect}
>
  <span
    className={cn("block rounded-full mx-auto", statusClass)}
    style={{ width: visualSize, height: visualSize }}
  />
</button>
```

- [ ] **Step 2: `JourneyMapCanvas`**

- Render `next/image` of `islandBaseSrc(config)` with width/height = `mapDimensions`.
- Wrapper: `overflow-hidden` touch-pan container.
- Transform: `translate` + `scale` from viewport state (`x/y` as focal point 0–1 or pixel offset — pick one model and keep consistent with `defaultViewport`).
- Pointer: drag to pan; wheel/pinch to zoom; clamp zoom ~0.8–2.2; clamp pan so island stays partly visible.
- `onPointerUp` / zoom end → `saveJourneyViewport(unitId, viewport)`.
- Reset button restores `defaultViewport` and saves.
- Mount: `loadJourneyViewport(unitId, defaultViewport)`.
- Map landmarks → `JourneyHotspot`.
- `prefers-reduced-motion`: no pulse animation class.

- [ ] **Step 3: `JourneyPuchiOverlay`**

- Find `views.find(v => v.isCurrent)`.
- Position with same `%` as hotspot, offset slightly (e.g. `+6%` x).
- Image: `/images/mascot/puchi_welcome_v2.png` (or `puchi_student_beginner.png` if welcome missing).
- `pointer-events-none`; optional CSS bounce unless reduced-motion.

- [ ] **Step 4: `JourneyMapHeader`**

- Compact bar: unit title + chip `{completedLessons}/{totalLessons}` or chapter progress for current landmark.
- No Duolingo sticky full-color block.

- [ ] **Step 5: Manual** — drag/pinch on phone emulator; hit targets easy to tap; Reset works.

- [ ] **Step 6: Commit** (if enabled)

```bash
git add src/components/learn/journey
git commit -m "feat(learn): add journey map canvas pan-zoom and hotspots"
```

---

### Task 5: Wire `/learn` → `JourneyMapView`

**Files:**
- Create: `src/components/learn/journey/JourneyMapView.tsx`
- Modify: `src/components/learn/UnitLearnView.tsx`
- Modify: `messages/en.json`, `messages/vi.json`

**Interfaces:**
- Consumes: skills, completedLessonIds, unit, soft-gate callback
- Produces: map that navigates to chapter or shows tip

- [ ] **Step 1: i18n keys** under `Learn.Journey`:

```json
"Journey": {
  "progressChip": "{completed}/{total} lessons",
  "resetView": "Reset view",
  "comingSoon": "This chapter is coming soon.",
  "locked": "Finish the previous chapter first.",
  "landmark": {
    "hoan-kiem": "Hoàn Kiếm Lake",
    "one-pillar-pagoda": "One Pillar Pagoda",
    "old-quarter": "Hanoi Old Quarter",
    "coffee-shop": "Coffee Shop",
    "street-food": "Street Food Corner",
    "bamboo-grove": "Bamboo Grove",
    "traditional-bridge": "Traditional Bridge"
  },
  "status": {
    "unlocked": "Available",
    "locked": "Locked",
    "coming_soon": "Coming soon",
    "completed": "Completed"
  }
}
```

Mirror Vietnamese in `vi.json`.

- [ ] **Step 2: `JourneyMapView`**

```tsx
// pseudo-structure
const views = deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, completedLessonIds);
const router = useRouter();

function onSelect(slug: string) {
  const access = resolveChapterAccess(UNIT_1_JOURNEY_MAP, views, slug);
  if (!access.ok) {
    toast.message(
      access.reason === "coming_soon"
        ? t("Journey.comingSoon")
        : t("Journey.locked"),
    );
    return;
  }
  router.push(`/learn/chapter/${slug}`);
}
```

Keep `GuestSoftGateDialog` in `UnitLearnView` as today.

- [ ] **Step 3: Replace path in `UnitLearnView`**

Remove `TrialUnitHeader` + `TrialUnitPath` usage for this view; render:

```tsx
<JourneyMapView
  unit={unit}
  skills={skills}
  completedLessonIds={completedLessonIds}
  onLockedLessonClick={atSoftGate ? () => setGateOpen(true) : undefined}
/>
```

(Do not delete `TrialUnitPath.tsx` file yet — unused is fine for MVP rollback.)

- [ ] **Step 4: Manual** — `/learn` shows map; tap coming soon → toast; tap Hoàn Kiếm → navigates (chapter page may 404 until Task 6).

- [ ] **Step 5: Commit** (if enabled)

```bash
git add src/components/learn messages/en.json messages/vi.json
git commit -m "feat(learn): replace unit path with journey map view"
```

---

### Task 6: Chapter route + `ChapterView`

**Files:**
- Create: `src/app/[locale]/(protected)/(nav)/(learn)/learn/chapter/[landmarkSlug]/page.tsx`
- Create: `src/components/learn/journey/ChapterView.tsx`
- Modify: `messages/en.json`, `messages/vi.json` (chapter copy)

**Interfaces:**
- Consumes: `resolveChapterAccess`, `deriveLandmarkViews`, lesson links
- Produces: Continue → first incomplete lesson; Review when completed

- [ ] **Step 1: Add i18n**

```json
"Chapter": {
  "back": "Back to map",
  "continue": "Continue",
  "review": "Review",
  "emptyLessons": "No lessons in this chapter yet.",
  "progress": "{completed} of {total} lessons",
  "intros": {
    "hoan-kiem": "Begin your journey at Hoàn Kiếm Lake — greet Vietnam with your first words."
  }
}
```

- [ ] **Step 2: Page loads unit + guards**

```tsx
// page.tsx — client component OK (matches UnitLearnView pattern)
// 1) load unit via getUnit(DEFAULT_UNIT_ID)
// 2) derive views
// 3) access = resolveChapterAccess(...)
// 4) if !access.ok → toast + router.replace("/learn")
// 5) else <ChapterView view={access.view} unitTitle={...} />
```

- [ ] **Step 3: `ChapterView` layout**

1. Back button → `/learn` (viewport restore handled by map mount)
2. Hero `next/image` from `view.assets.hero` or placeholder gradient + landmark name
3. Title from `t(\`Journey.landmark.${slug}\`)` + intro
4. Progress bar `completedCount/totalCount`
5. Lesson list: completed / current (first incomplete) / locked later lessons
6. CTA:
   - if `status === "completed"` → label Review, href first lesson (or last) for replay
   - else → Continue → first incomplete lesson id `/lesson/${id}`
7. If `totalCount === 0` → show `emptyLessons`, no crash

Lesson row lock: index > first incomplete index ⇒ locked UI (non-navigating) unless completed.

- [ ] **Step 4: Soft-gate** — if guest at gate and taps Continue to blocked lesson, open existing dialog (pass callback or rely on lesson page). Prefer: Chapter Continue checks `completedLessonIds.length >= 3 && !user` → open gate dialog instead of navigate.

- [ ] **Step 5: Manual** — open `/learn/chapter/hoan-kiem`, Continue starts lesson; `/learn/chapter/bamboo-grove` redirects + toast; completed state shows Review.

- [ ] **Step 6: Commit** (if enabled)

```bash
git add src/app/[locale]/(protected)/(nav)/(learn)/learn/chapter src/components/learn/journey/ChapterView.tsx messages
git commit -m "feat(learn): add journey chapter screen with access guards"
```

---

### Task 7: Polish + verification

**Files:**
- Touch as needed: journey components, config hotspots, CSS
- Verify: lint + build

- [ ] **Step 1: Run selftest**

```bash
bun src/lib/journey-map/selftest.ts
```

Expected: `journey-map selftest OK`

- [ ] **Step 2: Lint + build**

```bash
bun run lint
bun run build
```

Expected: no errors from journey-map files.

- [ ] **Step 3: Manual QA checklist**

- [ ] `/learn` is diorama, not zigzag buttons
- [ ] Pan/zoom + Reset; Back from chapter restores viewport
- [ ] Hotspot visual small but hit ≥ 44px
- [ ] Puchi 2D only on map; KV may differ
- [ ] 6 coming_soon tips via toast (URL clean)
- [ ] Chapter Continue / Review labels correct for 0/3, 1/3, 3/3
- [ ] Guest soft-gate still works at lesson 4
- [ ] `prefers-reduced-motion` stops bounce/pulse
- [ ] Mobile + desktop no horizontal page scroll bleed

- [ ] **Step 4: Commit** (if enabled)

```bash
git add -A
git commit -m "fix(learn): polish journey map UX and verify build"
```

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Approach 1 pan/zoom + hotspots | 4, 5 |
| Approach 2-ready `unit-1/v1/` assets | 3 |
| Config `unitId`, `version`, `mapDimensions`, `defaultViewport` | 1 |
| `baseStatus` + derive `completed/unlocked` + `isCurrent` | 1 |
| Hotspots only from config | 1, 3 step 5 |
| Asset versioning `v1/` | 3 |
| Chapter full-screen + guards | 6 |
| Continue vs Review | 6 |
| Viewport restore | 2, 4, 6 |
| Tip not durable in URL | 5, 6 (sonner) |
| visual vs hit area | 4 |
| Puchi 2D overlay; KV may be 3D | 3, 4 |
| Keep soft-gate / APIs | 5, 6 |
| No heroes for 6 locked landmarks | 3, 6 placeholder |

No TBD placeholders in tasks. Types aligned across tasks (`DerivedLandmarkView`, `resolveChapterAccess`, `JourneyViewport`).
