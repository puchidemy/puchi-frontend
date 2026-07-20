# Puchi Journey Map — Unit 1 Vietnam Diorama Design

**Status:** Draft (awaiting user review)  
**Date:** 2026-07-20  
**Scope:** Frontend Learn Unit 1 + art pipeline  
**Replaces:** Duolingo-style zigzag path (`TrialUnitPath`) for Unit 1

---

## 1. Executive summary

Unit 1 Learn home becomes a **stylized 2D journey map**: a floating Vietnam island diorama (Nintendo / Monument Valley / Animal Crossing mood), not a realistic map and not a winding button path.

**Product decisions**

| Decision | Choice |
|----------|--------|
| Deliverable | Concept art + Learn UI |
| Map interaction | Pan/zoom 2D + tap hotspots |
| Landmark model | 1 landmark = 1 skill/chapter (many lessons) |
| MVP content | All current Unit 1 lessons live in landmark #1; #2–7 `coming_soon` |
| Chapter UX | Full-screen chapter screen (intro, progress, lesson list, CTA) |
| Puchi | Key visual may show stylized 3D Puchi; product UI uses map **without** Puchi + **2D brand overlay** |
| Tech MVP | Approach 1 (static hero map + pan/zoom + % hotspots) |
| Asset prep | Folder/contract shaped like Approach 2 for later sprite layers |

---

## 2. Architecture & user flows

```
/learn  (Unit 1 Journey Map)
  ├─ Map viewport: pan/zoom island art
  ├─ Hotspot landmarks (7)
  │    ├─ unlocked / completed → /learn/chapter/[landmarkSlug]
  │    └─ locked / coming_soon → short tip (toast/store, not durable URL)
  └─ Puchi 2D overlay at current chapter hotspot

/learn/chapter/[landmarkSlug]  (full-screen Chapter)
  ├─ Hero landmark art
  ├─ Title + short intro (i18n)
  ├─ Progress (completed / total lessons)
  ├─ Lesson list (done / current / locked)
  └─ CTA Continue | Review → /lesson/[id]
```

**API:** Keep current `getUnit` / lesson APIs. No backend schema change in MVP.

**Replacement:** `UnitLearnView` swaps `TrialUnitPath` for `JourneyMapView` (Unit 1). Guest soft-gate (3 lessons) unchanged.

**Chapter route guards** (server/client before render — not UI-only):

1. Slug must exist in Unit 1 `JourneyMapConfig`
2. Derive runtime status from progress + `baseStatus`
3. `coming_soon` | `locked` → redirect `/learn` + short-lived tip
4. Unknown slug → `/learn`
5. Only `unlocked` | `completed` chapters render
6. Unlocked chapter with zero lessons (data skew) → empty chapter + message, no crash

---

## 3. Data model

### 3.1 Config (static FE — source of truth for layout)

```ts
type LandmarkBaseStatus = "unlocked" | "locked" | "coming_soon";

type RuntimeLandmarkStatus =
  | "unlocked"
  | "locked"
  | "coming_soon"
  | "completed";

type JourneyLandmark = {
  slug: string;
  skillId?: string; // MVP: only first landmark
  baseStatus: LandmarkBaseStatus;
  hotspot: { x: number; y: number }; // normalized 0–1 in mapDimensions
  visualSize: number; // marker visual at design scale
  hitArea: number; // ≥ 44 CSS px touch target
  assets: {
    hero?: string;
    pin?: string;
    states?: Partial<Record<"idle" | "glow" | "locked" | "completed", string>>;
  };
};

type JourneyMapConfig = {
  unitId: string;
  version: number; // config schema / map pack version
  mapDimensions: { width: number; height: number }; // canonical canvas
  defaultViewport: { x: number; y: number; zoom: number };
  landmarks: JourneyLandmark[];
};
```

**Hard rules**

- Hotspots are **never** inferred from image pixels. `JourneyMapConfig` is the only layout source. Changing art means updating coordinates in config, not scraping the PNG.
- Asset files live under a **versioned** path (e.g. `.../unit-1/v1/`) so artwork can be replaced without breaking cache/config references incorrectly. Bump folder + config paths / `version` together when shipping a new pack.

### 3.2 Derive runtime status

Inputs: `JourneyMapConfig` + unit `skills`/`lessons` + `completedLessonIds`.

Per landmark:

1. `baseStatus === "coming_soon"` → runtime `coming_soon`
2. `baseStatus === "locked"` → runtime `locked`
3. Else if landmark has lessons:
   - all lessons completed → `completed`
   - otherwise → `unlocked`
4. `isCurrent: boolean` is a **separate flag**, not a status value:
   - `true` when landmark is `unlocked` and contains the first incomplete lesson (e.g. progress `1/3` → `status: "unlocked"`, `isCurrent: true`)
   - when landmark is `completed`, `isCurrent: false` (MVP: no next real chapter yet)

**MVP mapping**

| Landmark | baseStatus | Content |
|----------|------------|---------|
| `hoan-kiem` | `unlocked` | All current Unit 1 lessons (trial skill) |
| `one-pillar-pagoda`, `old-quarter`, `coffee-shop`, `street-food`, `bamboo-grove`, `traditional-bridge` | `coming_soon` | No DB skills yet |

### 3.3 Tips on redirect

Use short-lived toast store or ephemeral navigation state. Do **not** persist tip copy in the URL long-term.

### 3.4 Viewport persistence

- Key: `learn:journey:${unitId}:viewport` in **sessionStorage** (MVP)
- Save on pan/zoom end
- Restore when returning from Chapter to `/learn`
- Fallback: `defaultViewport`

---

## 4. Asset structure (Approach 2-ready; MVP uses Approach 1)

```
puchi-frontend/public/images/learn/journey/unit-1/v1/
  key-visual/
    vietnam-diorama-kv.webp          # marketing; may include 3D-stylized Puchi
  map/
    island-base.webp                 # full island; NO Puchi; NO UI text
  landmarks/
    hoan-kiem/
      hero.webp                      # Chapter hero (required MVP)
      pin.webp                       # optional / reserved
      states/                        # reserved for Approach 2 upgrade
        idle.webp
        glow.webp
        locked.webp
        completed.webp
    one-pillar-pagoda/…              # folders reserved; heroes not required MVP
    old-quarter/…
    coffee-shop/…
    street-food/…
    bamboo-grove/…
    traditional-bridge/…
```

Puchi product cutouts stay in `public/images/mascot/` (brand system v2). Do not bake 2D Puchi into `island-base`.

| Asset | MVP required | Notes |
|-------|--------------|-------|
| `key-visual` | Yes | Inspiration / marketing; not the Learn hit-target layer |
| `island-base` | Yes | Composited landmarks OK for MVP |
| `hoan-kiem/hero` | Yes | Chapter screen |
| Other landmark heroes | No | Fallback crop/placeholder |
| Per-landmark state sprites | No | Paths reserved; MVP uses CSS glow/lock/check |

Later Approach 2: empty base + separate landmark layers; swap without changing interaction model.

---

## 5. UI specification

### 5.1 `/learn` — Journey Map

- Full-bleed map in content area (existing app nav stays)
- Compact header: unit title + progress chip (replace Duolingo sticky color bar)
- Pan + pinch zoom; clamp bounds; small Reset view control
- Hotspots: **visual size** vs **hit area** separated; hit area ≥ 44px even if marker is small
- No text/labels/logos on the map art itself; a11y via `aria-label` (name + status)
- Puchi 2D beside current hotspot; idle motion; must not block taps (hit-through or same action as hotspot)
- `prefers-reduced-motion`: disable pulse/bounce
- Guest soft-gate unchanged

### 5.2 `/learn/chapter/[landmarkSlug]`

1. Hero art (real hero for #1; placeholder/crop for unused)
2. Title + short intro
3. Progress bar
4. Lesson list
5. CTA: **Continue** if incomplete; **Review** if `completed`
6. Back → `/learn` with **restored viewport**

### 5.3 Visual states (MVP CSS)

| Runtime | Map | Chapter |
|---------|-----|---------|
| `unlocked` + `isCurrent` | Soft glow + Puchi | Continue |
| `unlocked` | Idle | Continue / list |
| `completed` | Check / soft idle | Review |
| `locked` | Dim + lock | Guard redirect |
| `coming_soon` | Dim + mist/lock | Guard redirect |

---

## 6. Art direction (generation brief)

**Mood:** wonder, adventure, discovery, cozy cultural exploration.

**Composition:** Floating island shaped like Vietnam; isometric 3/4; entire island visible; empty UI margins; bright welcoming light.

**Landmarks (iconic, not every province):** Hoàn Kiếm Lake, One Pillar Pagoda, Hanoi Old Quarter, small Vietnamese coffee shop, street food corner, bamboo grove, small traditional bridge — connected by winding stone paths.

**Environment:** lush grass, hills, tiny rivers, flowers, bamboo, soft clouds, birds, warm sunlight, subtle fog.

**Avoid:** realistic/satellite/Google Maps, photorealism, dark military look, low-poly blockiness, crowded city, text, logos, UI, watermarks, people, cars, heavy shadows, over-detail.

**Palette:** fresh greens, warm beige, soft blue, Vietnamese red accents, golden sunlight, natural wood, bamboo green.

**Outputs order**

1. Key visual (may include stylized 3D Puchi waving near first landmark)
2. `island-base` — same camera/style, **no Puchi**, no text
3. `hoan-kiem/hero` — close-up / chapter crop in same style

---

## 7. Scope

### In scope (MVP)

- Replace zigzag path with Journey Map for Unit 1
- Config + derive + guards + pan/zoom + chapter screen
- Versioned assets under `unit-1/v1/`
- Generate KV + island-base + hero #1
- i18n + a11y basics; viewport session restore; toast tips

### Out of scope (MVP)

- True 3D (Three.js / R3F) or Pixi world
- Split landmark sprites + state PNGs (reserve only)
- Heroes for six `coming_soon` landmarks
- Backend skill↔landmark schema; multi-unit maps
- Account-persisted viewport
- Chapter story / boss / rewards systems
- LessonPlayer / exercise changes

### Success criteria

- `/learn` shows Vietnam diorama, not Duolingo button path
- Chapter 1 → Continue opens a real lesson
- Six landmarks show locked/coming soon with tip
- Mobile pan/zoom usable; hit targets ≥ 44px
- Product Puchi is 2D brand overlay; KV may be 3D-stylized separately

### Tests (MVP)

- Derive: 0/3, 1/3, 3/3 → correct status + `isCurrent`
- Guards: bad slug, `coming_soon`
- Hit area ≥ 44px with small visual
- Viewport restored after Back from chapter

---

## 8. Future upgrade path (Approach 2)

Without changing routes or config shape:

1. Ship empty `island-base` + per-landmark layered art
2. Fill `assets.pin` / `assets.states.*`
3. Optionally bind landmarks #2–7 to real `skillId`s and flip `baseStatus`

---

## 9. Open implementation notes

- Exact hotspot coordinates filled after `island-base` v1 art is approved (still authored in config, never auto-detected).
- Chapter intro copy keys under `Learn.Journey.*` (i18n).
- Whether Chapter is a Next.js route segment under `(learn)` or a parallel route is an implementation detail; guards and UX above are normative.
