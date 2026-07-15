"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mockFullProfile } from "@/data/mockProfile";
import { UserProfile } from "@/types/user";
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs from "@/components/profile/ProfileTabs";
import OverviewTab from "@/components/profile/tabs/OverviewTab";
import StatsTab from "@/components/profile/tabs/StatsTab";
import AchievementsTab from "@/components/profile/tabs/AchievementsTab";
import SocialTab from "@/components/profile/tabs/SocialTab";
import SettingsTab from "@/components/profile/tabs/SettingsTab";
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Users,
  Settings,
} from "lucide-react";

const tabs = [
  { id: "overview", icon: LayoutDashboard },
  { id: "stats", icon: BarChart3 },
  { id: "achievements", icon: Trophy },
  { id: "social", icon: Users },
  { id: "settings", icon: Settings },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [profile] = useState(mockFullProfile);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    ...mockFullProfile.user,
  });
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
      <ProfileHero profile={profile} />

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
        {activeTab === "achievements" && <AchievementsTab profile={profile} />}
        {activeTab === "social" && <SocialTab profile={profile} />}
        {activeTab === "settings" && (
          <SettingsTab profile={userProfile} onUpdate={setUserProfile} />
        )}
      </div>
    </div>
  );
}
