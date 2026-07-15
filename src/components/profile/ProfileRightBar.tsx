"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import FooterLink from "@/components/FooterLink";
import InviteFriendsDialog from "./InviteFriendsDialog";
import { mockFullProfile } from "@/data/mockProfile";
import {
  Settings,
  UserCheck,
  Users,
  ExternalLink,
  Share2,
} from "lucide-react";

type SocialTab = "following" | "followers";

const ProfileRightBar = () => {
  const t = useTranslations("Profile");
  const [socialTab, setSocialTab] = useState<SocialTab>("following");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { friends, followers } = mockFullProfile;
  const currentList = socialTab === "following" ? friends : followers;

  return (
    <>
      {/* Top icons */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer transition-colors">
          <Image src="/icons/heart.svg" alt="heart" width={30} height={30} />
          <span className="ml-2 text-xl font-bold text-red-500">5</span>
        </div>
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer transition-colors">
          <Image src="/icons/gem.svg" alt="gem" width={24} height={30} />
          <span className="ml-2 text-xl font-bold text-blue-400">10</span>
        </div>
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer transition-colors">
          <Image src="/icons/fire.svg" alt="streak" width={25} height={30} />
          <span className="ml-2 text-xl font-bold">3</span>
        </div>
      </div>

      <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide">
        {/* Following / Followers */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b border-border">
              <button
                onClick={() => setSocialTab("following")}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  socialTab === "following"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <UserCheck size={16} className="text-[var(--unit-1)]" />
                  {t("inviteFriends.following")}
                </div>
              </button>
              <button
                onClick={() => setSocialTab("followers")}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  socialTab === "followers"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users size={16} className="text-[var(--unit-5)]" />
                  {t("inviteFriends.followers")}
                </div>
              </button>
            </div>

            <div className="divide-y divide-border max-h-[240px] overflow-y-auto scrollbar-thin">
              {currentList.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No one yet</p>
              ) : (
                currentList.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--unit-1)] to-[var(--unit-5)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {person.firstName.charAt(0)}
                      {person.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {person.firstName} {person.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lv.{person.level} · 🔥{person.streak}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Find & Invite friends */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            <Link
              href="/user-search?s="
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "color-mix(in srgb, var(--unit-3) 20%, transparent)", color: "var(--unit-3)" }}
              >
                <ExternalLink size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-[var(--unit-3)] transition-colors">{t("inviteFriends.findFriends")}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t("inviteFriends.findFriendsDescription")}
                </p>
              </div>
            </Link>

            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "color-mix(in srgb, var(--unit-4) 20%, transparent)", color: "var(--unit-4)" }}
              >
                <Share2 size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-[var(--unit-4)] transition-colors">{t("inviteFriends.invite")}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t("inviteFriends.inviteDescription")}
                </p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Settings link */}
        <Card>
          <CardContent className="p-0">
            <Link
              href="/settings"
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors rounded-xl group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--unit-2)] to-[var(--unit-6)] text-white">
                <Settings size={18} />
              </div>
              <span className="text-sm font-medium group-hover:text-[var(--unit-2)] transition-colors">Account settings</span>
            </Link>
          </CardContent>
        </Card>

        <FooterLink />
      </div>

      <InviteFriendsDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
};

export default ProfileRightBar;
