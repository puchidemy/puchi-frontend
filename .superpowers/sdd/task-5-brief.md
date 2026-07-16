### Task 5: Frontend — Profile Routing `/in/[username]`

**Files:**
- Create: `src/components/profile/ProfilePageView.tsx`
- Create: `src/app/[locale]/(protected)/(nav)/in/page.tsx`
- Create: `src/app/[locale]/(protected)/(nav)/in/[username]/page.tsx`
- Create: `src/actions/profile/get-public-profile.ts`
- Modify: `src/types/profile.ts`
- Delete: `src/app/[locale]/(protected)/(nav)/profile/`

**Context:** Extract current profile page into reusable `ProfilePageView`, add `/in/[username]` routing, remove old `/profile` route.

- [ ] **Step 1: Create `ProfilePageView.tsx`**

Extract from existing `profile/page.tsx`. Accept `profile: FullProfile`, `isLoading: boolean`, `isOwnProfile: boolean` as props. Show "Edit Profile" link when `isOwnProfile` is true.

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FullProfile } from "@/types/profile";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs from "@/components/profile/ProfileTabs";
import OverviewTab from "@/components/profile/tabs/OverviewTab";
import StatsTab from "@/components/profile/tabs/StatsTab";
import AchievementsTab from "@/components/profile/tabs/AchievementsTab";
import ProfileRightBar from "@/components/profile/ProfileRightBar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { LayoutDashboard, BarChart3, Trophy } from "lucide-react";

const tabs = [
  { id: "overview", icon: LayoutDashboard },
  { id: "stats", icon: BarChart3 },
  { id: "achievements", icon: Trophy },
] as const;

type TabId = (typeof tabs)[number]["id"];

const tabComponents: Record<TabId, React.ComponentType<{ profile: FullProfile }>> = {
  overview: OverviewTab,
  stats: StatsTab,
  achievements: AchievementsTab,
};

interface ProfilePageViewProps {
  profile: FullProfile;
  isLoading?: boolean;
  isOwnProfile?: boolean;
}

export default function ProfilePageView({ profile, isLoading = false, isOwnProfile = false }: ProfilePageViewProps) {
  const t = useTranslations("Profile");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const TabComponent = tabComponents[activeTab];

  return (
    <>
      <div className="flex justify-center">
        <div className="h-full flex xl:w-[1024px] w-full relative">
          <main className="min-w-[300px] absolute left-0 right-0 xl:right-[350px]">
            <div className="container mx-auto px-4 py-6 space-y-6">
              {isOwnProfile && (
                <div className="flex justify-end">
                  <a href="/settings/profile" className="text-sm text-primary hover:underline">
                    {t("editProfile")}
                  </a>
                </div>
              )}

              <ProfileHero profile={profile} />

              <ProfileTabs
                tabs={tabs.map((tab) => ({
                  ...tab,
                  label: t(`tabs.${tab.id}`),
                }))}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <TabComponent profile={profile} />
                </motion.div>
              </AnimatePresence>
            </div>
            <ScrollToTopButton className="max-sm:bottom-20 xl:right-[calc(50%-220px)]" />
          </main>

          <div
            className="max-xl:hidden w-[350px] fixed"
            style={{ right: "calc((100vw - 1276px) / 2)" }}
          >
            <Suspense fallback={<RightBarFallback />}>
              <ProfileRightBar />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

function RightBarFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );
}
```

- [ ] **Step 2: Create `get-public-profile.ts` action**

```typescript
"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface PublicUserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicProfile(username: string): Promise<ActionResult<PublicUserProfile>> {
  try {
    const data = await backendFetch<PublicUserProfile>(`/v1/profile/${username}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
```

- [ ] **Step 3: Update `FullProfile.user` type** — add `onboardingCompleted?: boolean`

```typescript
// In src/types/profile.ts, add to the user interface:
export interface FullProfile {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    bio?: string;
    onboardingCompleted?: boolean;  // NEW
    createdAt: string;
    updatedAt: string;
  };
  // ... rest unchanged ...
}
```

- [ ] **Step 4: Create protected `/in/page.tsx`** (current user's own profile)

```typescript
// src/app/[locale]/(protected)/(nav)/in/page.tsx
import { getProfile } from "@/actions/profile/get-profile";
import ProfilePageView from "@/components/profile/ProfilePageView";

export default async function MyProfilePage() {
  const result = await getProfile();

  if (!result.success) {
    return <div className="py-24 text-center text-muted-foreground">Failed to load profile</div>;
  }

  const profile = {
    user: {
      id: result.data.id,
      username: result.data.username,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      imageUrl: result.data.avatarUrl,
      bio: result.data.bio,
      onboardingCompleted: true,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    },
    gamification: { level: 0, currentXP: 0, xpToNextLevel: 0, totalXP: 0, streak: 0, longestStreak: 0, streakFreezes: 0, crowns: 0, gems: 0 },
    stats: { totalLessons: 0, completedLessons: 0, totalMinutes: 0, accuracy: 0, wordsLearned: 0 },
    dailyActivity: [],
    weeklyXP: [],
    achievements: [],
    friends: [],
    followers: [],
    leaderboard: [],
  };

  return <ProfilePageView profile={profile} isLoading={false} isOwnProfile={true} />;
}
```

- [ ] **Step 5: Create protected `/in/[username]/page.tsx`** (profile by username)

```typescript
// src/app/[locale]/(protected)/(nav)/in/[username]/page.tsx
import { getPublicProfile } from "@/actions/profile/get-public-profile";
import ProfilePageView from "@/components/profile/ProfilePageView";

interface Props {
  params: Promise<{ locale: string; username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const result = await getPublicProfile(username);

  if (!result.success) {
    return <div className="py-24 text-center text-muted-foreground">User not found</div>;
  }

  const profile = {
    user: {
      id: result.data.id,
      username: result.data.username,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      imageUrl: result.data.avatarUrl,
      bio: result.data.bio,
      onboardingCompleted: true,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    },
    gamification: { level: 0, currentXP: 0, xpToNextLevel: 0, totalXP: 0, streak: 0, longestStreak: 0, streakFreezes: 0, crowns: 0, gems: 0 },
    stats: { totalLessons: 0, completedLessons: 0, totalMinutes: 0, accuracy: 0, wordsLearned: 0 },
    dailyActivity: [],
    weeklyXP: [],
    achievements: [],
    friends: [],
    followers: [],
    leaderboard: [],
  };

  return <ProfilePageView profile={profile} isLoading={false} />;
}
```

- [ ] **Step 6: Delete old profile route**

```bash
rm -rf "src/app/[locale]/(protected)/(nav)/profile"
```

- [ ] **Step 7: Commit**

```bash
git add src/components/profile/ProfilePageView.tsx
git add src/app/[locale]/\(protected\)/\(nav\)/in/
git add src/actions/profile/get-public-profile.ts
git add src/types/profile.ts
git rm -r "src/app/[locale]/(protected)/(nav)/profile/"
git commit -m "feat(profile): add /in/[username] profile routing with reusable ProfilePageView"
```
