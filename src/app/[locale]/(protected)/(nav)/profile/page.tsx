"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { mockFullProfile } from "@/data/mockProfile";
import { FullProfile } from "@/types/profile";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs from "@/components/profile/ProfileTabs";
import OverviewTab from "@/components/profile/tabs/OverviewTab";
import StatsTab from "@/components/profile/tabs/StatsTab";
import AchievementsTab from "@/components/profile/tabs/AchievementsTab";
import ProfileRightBar from "@/components/profile/ProfileRightBar";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "overview", icon: LayoutDashboard },
  { id: "stats", icon: BarChart3 },
  { id: "achievements", icon: Trophy },
] as const;

type TabId = (typeof tabs)[number]["id"];

function RightBarFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [profile] = useState<FullProfile>(mockFullProfile);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const handleAvatarChange = useCallback((_file: File) => {
    toast.success("Avatar uploaded! (API integration pending)");
  }, []);

  return (
    <>
      <div className="flex justify-center">
        <div className="h-full flex xl:w-[1024px] w-full relative">
          <main className="min-w-[300px] absolute left-0 right-0 xl:right-[350px]">
            <div className="container mx-auto px-4 py-6 space-y-6">
              <ProfileHero
                profile={profile}
                onAvatarChange={handleAvatarChange}
              />

              <ProfileTabs
                tabs={tabs.map((tab) => ({
                  ...tab,
                  label: t(`tabs.${tab.id}`),
                }))}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as TabId)}
              />

              <div className="min-h-[300px]">
                {activeTab === "overview" && <OverviewTab profile={profile} />}
                {activeTab === "stats" && <StatsTab profile={profile} />}
                {activeTab === "achievements" && (
                  <AchievementsTab profile={profile} />
                )}
              </div>
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
