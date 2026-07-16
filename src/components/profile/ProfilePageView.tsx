"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "@/i18n/routing";
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
                  <Link href="/settings/profile" className="text-sm text-primary hover:underline">
                    {t("editProfile")}
                  </Link>
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
