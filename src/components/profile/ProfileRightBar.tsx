"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import FooterLink from "@/components/FooterLink";
import InviteFriendsDialog from "./InviteFriendsDialog";
import { mockFullProfile } from "@/data/mockProfile";
import {
  UserPlus,
  Search,
  Share2,
  Settings,
  UserCheck,
  Users,
  ExternalLink,
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
      {/* Top icons (giống ItemsInfo bên learn) */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
          <Image src="/icons/heart.svg" alt="heart" width={30} height={30} />
          <span className="ml-2 text-xl font-bold text-red-500">5</span>
        </div>
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
          <Image src="/icons/gem.svg" alt="gem" width={24} height={30} />
          <span className="ml-2 text-xl font-bold text-blue-400">10</span>
        </div>
        <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
          <Image src="/icons/fire.svg" alt="streak" width={25} height={30} />
          <span className="ml-2 text-xl font-bold">3</span>
        </div>
      </div>

      <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide">
        {/* Following / Followers card with tabs */}
        <Card>
          <CardContent className="p-0">
            {/* Tabs */}
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
                  <UserCheck size={16} />
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
                  <Users size={16} />
                  {t("inviteFriends.followers")}
                </div>
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-border max-h-[240px] overflow-y-auto scrollbar-thin">
              {currentList.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  No one yet
                </p>
              ) : (
                currentList.slice(0, 5).map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
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

            {/* View all */}
            {currentList.length > 5 && (
              <Link
                href={`/friends?tab=${socialTab}`}
                className="block text-center text-sm text-primary font-medium py-2.5 hover:bg-muted/30 transition-colors rounded-b-xl"
              >
                View all
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Add friends */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <UserPlus size={18} className="text-[var(--unit-1)]" />
              {t("inviteFriends.addFriends")}
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder={t("inviteFriends.addFriendsPlaceholder")}
                className="flex-1 rounded-xl h-9 text-sm"
              />
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl h-9 w-9 p-0"
              >
                <Search size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("inviteFriends.addFriendsHint")}
            </p>
          </CardContent>
        </Card>

        {/* Find friends */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ExternalLink size={18} className="text-[var(--unit-3)]" />
              {t("inviteFriends.findFriends")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("inviteFriends.findFriendsDescription")}
            </p>
            <Link href="/user-search?s=">
              <Button
                variant="secondary"
                size="sm"
                className="w-full rounded-xl"
              >
                {t("inviteFriends.discoverFriends")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Invite friends */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Share2 size={18} className="text-[var(--unit-4)]" />
              {t("inviteFriends.invite")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("inviteFriends.inviteDescription")}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-xl"
              onClick={() => setInviteOpen(true)}
            >
              <Share2 size={16} className="mr-1.5" />
              {t("inviteFriends.invite")}
            </Button>
          </CardContent>
        </Card>

        {/* Settings link */}
        <Card>
          <CardContent className="p-0">
            <Link
              href="/settings"
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors rounded-xl"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted">
                <Settings size={18} className="text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">Account settings</span>
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
