# Profile Page Redesign — Puchi Identity (Duolingo-inspired)

> **Status:** Design approved | **Date:** 2026-07-15
> **Approach:** 3 — Puchi Identity (gamification + social + visual, leveraging existing design system)

## 1. Goal

Redesign the profile page from a static form into a gamified, social, visually-rich experience inspired by Duolingo, while maintaining Puchi's unique design language.

## 2. Architecture

### 2.1 File Structure

```
src/app/[locale]/(protected)/(nav)/profile/
└── page.tsx                          # Container: tab state + mock data fetch

src/components/profile/
├── ProfileHero.tsx                   # Hero: avatar ring, level, streak flame, XP bar
├── ProfileTabs.tsx                   # Tab navigation (Overview | Stats | Achievements | Social | Settings)
├── tabs/
│   ├── OverviewTab.tsx               # Summary: stat cards, weekly recap, current course
│   ├── StatsTab.tsx                  # Calendar heatmap, XP chart, accuracy waffle
│   ├── AchievementsTab.tsx           # Badge grid, progress bars, locked/unlocked
│   ├── SocialTab.tsx                 # Friends, followers, leaderboard
│   └── SettingsTab.tsx               # Wraps ProfileForm + ProfileActions, restyled
├── shared/
│   ├── StreakFlame.tsx               # Flame icon + streak count + pulse animation
│   ├── LevelRing.tsx                 # SVG circular progress ring around avatar
│   ├── XpProgressBar.tsx             # XP bar toward next level
│   ├── StatCard.tsx                  # Reusable stat card (icon + value + label)
│   ├── BadgeGrid.tsx                 # Achievement badge grid
│   └── LearningCalendar.tsx          # GitHub-style contribution heatmap

src/data/
└── mockProfile.ts                    # Full mock data for all tabs

src/types/
└── profile.ts                        # FullProfile, ProfileGamification, etc.
```

### 2.2 Files to Keep / Replace / Delete

| File | Action |
|---|---|
| `ProfileForm.tsx` | **Keep** — used inside SettingsTab |
| `ProfileActions.tsx` | **Keep** — used inside SettingsTab |
| `ProfileHeader.tsx` | **Replace** by `ProfileHero.tsx` |
| `ProfileStats.tsx` | **Replace** by `OverviewTab` + `StatsTab` |
| `profile/page.tsx` | **Rewrite entirely** |

### 2.3 Data Flow

```
ProfilePage (mock data hook)
  ├── ProfileHero ← user, gamification
  ├── ProfileTabs ← tabState
  │     ├── OverviewTab ← stats, weekly recap
  │     ├── StatsTab ← dailyActivity[], weeklyXP[], stats
  │     ├── AchievementsTab ← achievements[]
  │     ├── SocialTab ← friends[], followers[], leaderboard[]
  │     └── SettingsTab ← profile (edit via ProfileForm), actions
```

## 3. Visual Design

### 3.1 Design Principles

- **Gamification-first**: Streak flame, XP bar, level ring are the visual anchors
- **Claymorphism touch**: Soft shadows (0 8px 32px rgba(0,0,0,0.08)), rounded corners (16px), subtle press squish (scale 0.97)
- **Puchi tokens**: All colors use existing OKLCH design tokens; fonts use Gabarito + Capriola + DIN
- **Dark mode ready**: All components use CSS variables, no hardcoded colors
- **Reduced motion**: All animations respect `prefers-reduced-motion`

### 3.2 Color Mapping

| Element | Token | Value |
|---|---|---|
| Tab active, progress bars, CTA | `--primary` | `#58cc02` (green) |
| Streak flame | `--unit-4` | `#ff4b4b` (red) → orange gradient |
| XP / Crown / Level | `--unit-3` | `#ff9600` (orange) |
| Accuracy / Learning stats | `--unit-5` | `#1cb0f6` (blue) |
| Achievements / Badges | `--unit-2` | `#ce82ff` (purple) |
| Social / Friends | `--unit-1` | `#58cc02` (green) |
| Calendar heatmap scale | Custom green gradient | `#ebedf0` → `#9be9a8` → `#40c463` → `#30a14e` → `#216e39` |

### 3.3 Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Page title | `--font-display` (Capriola) | 32-40px | 700 |
| Tab labels | `--font-sans` (Gabarito) | 14px | 600 |
| Streak number | `--font-display` (Capriola) | 48px | 800 |
| Stat numbers | `--font-din` (DIN) | 24px | 700 |
| Body text | `--font-sans` (Gabarito) | 16px | 400 |

### 3.4 Key Visual Elements

1. **Avatar Level Ring** — SVG circle progress, stroke 4px, stroke-linecap round, spring scale on hover
2. **Streak Flame** — Lucide flame icon + number, pulse animation (scale 1→1.05→1, 2s loop), gradient red→orange bg
3. **XP Progress Bar** — Horizontal bar, green gradient fill, "Lv.8 → Lv.9" label, "2,450/3,000 XP" right-aligned
4. **Stat Cards** — Claymorphism: 16px radius, 0 8px 32px shadow, pastel icon circle, hover translateY(-2px)
5. **Achievement Badges** — 3-col grid, 80×80px, locked=grayscale+opacity 0.4, unlocked=color+glow, tap→bottom sheet
6. **Learning Calendar** — 7×52 grid, green intensity scale, hover→tooltip "12 lessons · 450 XP · Mon, Jul 14"

### 3.5 Animations

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Card mount | Stagger fade-in + slide-up (30ms stagger) | 400ms | ease-out |
| Tab switch | Crossfade content | 200ms | ease-in-out |
| Streak flame | Continuous pulse | 2s loop | ease-in-out |
| XP bar fill | Width expand on mount | 800ms | ease-out |
| Badge unlock | Scale bounce (0→1.15→1) | 500ms | spring |
| Button press | Scale 0.95 | 100ms | ease-out |

All animations respect `prefers-reduced-motion`: substitute with instant opacity transitions.

### 3.6 Responsive Breakpoints

| Width | Layout |
|---|---|
| < 768px | Single column, tabs as horizontal scroll at top, full-width content |
| 768-1024px | 2-column for Overview/Stats, tabs as left sidebar |
| ≥ 1024px | Fixed left tab sidebar, content area max-width 800px centered |

## 4. Tab Specifications

### 4.1 Overview Tab

Components: `ProfileHero`, `StatCard` (×4), `StreakFlame`, `XpProgressBar`, weekly day strip

Sections:
1. Hero section (avatar ring, name, username, join date)
2. Gamification strip (streak flame, XP, gems)
3. XP progress bar to next level
4. 4 StatCards in grid (lessons, accuracy, total hours, words learned)
5. Weekly recap: total XP + lesson count + 7-day pill strip (green/gray)
6. Current course: course name + completion progress bar

### 4.2 Stats Tab

Components: `LearningCalendar`, weekly XP line chart (Recharts or pure SVG), accuracy waffle (CSS Grid)

Sections:
1. Calendar heatmap (12 months, 7 rows × 52 cols)
2. Color legend (Ít → Nhiều)
3. Weekly XP line chart (last 12 weeks)
4. Accuracy waffle chart (10×10 CSS grid, 85 green / 15 gray cells)

### 4.3 Achievements Tab

Components: `BadgeGrid`

Sections:
1. Header: "Achievements (8/15 unlocked)"
2. Badge grid (3 cols desktop, 2 cols mobile)
3. Unlocked: full color, glow effect, tap→bottom sheet with date
4. Locked: grayscale, opacity 0.4, lock overlay, tap→bottom sheet with requirements
5. In-progress achievement pinned at top: progress bar + specific progress label

### 4.4 Social Tab

Sections:
1. Stats bar: "12 Bạn bè · 45 Người theo dõi · Đang theo dõi 30"
2. Leaderboard (top 20, current user highlighted green + "← bạn" indicator)
3. Friends list with follow/unfollow toggle, level badge, streak mini

### 4.5 Settings Tab

Wraps existing `ProfileForm` and `ProfileActions` with restyled claymorphism cards.

Sections:
1. Edit profile (ProfileForm, in-place editing)
2. Action items (account settings, security, sign out) — restyled as clay cards
3. Danger zone (delete account) — red border + warning icon

## 5. Mock Data Schema

```typescript
interface FullProfile {
  user: UserProfile;
  gamification: ProfileGamification;
  stats: ProfileStats;
  dailyActivity: DailyActivity[];   // ~365 entries for heatmap
  weeklyXP: WeeklyXP[];             // ~12 entries for line chart
  achievements: Achievement[];      // ~15-20 badges
  friends: Friend[];
  followers: Friend[];
  leaderboard: LeaderboardEntry[];  // Top 20
}

interface ProfileGamification {
  level: number;           // e.g. 8
  currentXP: number;       // e.g. 2450
  xpToNextLevel: number;   // e.g. 3000
  totalXP: number;         // e.g. 12500
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  crowns: number;
  gems: number;
}

interface ProfileStats {
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  accuracy: number;        // percentage
  wordsLearned: number;
}

interface DailyActivity {
  date: string;            // "2026-07-14"
  lessonsCompleted: number;
  xpEarned: number;
  minutesSpent: number;
}

interface WeeklyXP {
  weekLabel: string;       // "Jul 7-13"
  xp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;           // from --unit-* tokens
  progress: number;        // 0-100
  progressLabel: string;   // "3/5" or "80%"
  unlocked: boolean;
  unlockedAt?: string;
}

interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  level: number;
  streak: number;
  isFollowing: boolean;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  imageUrl: string;
  level: number;
  weeklyXP: number;
  isCurrentUser: boolean;
}
```

## 6. Constraints

- All data mocked in `src/data/mockProfile.ts`; API integration deferred
- Existing `ProfileForm.tsx` and `ProfileActions.tsx` preserved — only UI restyle
- All colors via design tokens (no hardcoded hex outside token definitions)
- Fonts: Gabarito (body/tabs), Capriola (headlines), DIN (numbers) — already loaded
- Dark mode: automatic via `@custom-variant dark` in Tailwind config, no separate color values needed
- Accessibility: WCAG AA minimum, touch targets ≥44px, all icons have labels
- No emojis as icons — use Lucide Icons only
- Responsive: test at 375px, 768px, 1024px, 1440px

## 7. Dependencies

- **Recharts** — for weekly XP line chart (install if not present)
- **Lucide Icons** — already installed, use for all icons
- **Shadcn UI** — Card, Progress, Badge, Button, Input, Dialog, Avatar (already installed)
- **Tailwind v4** — utility classes, `@keyframes` in globals.css for new animations
- **next-intl** — translations for all text content
