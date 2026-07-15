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

const iconBtnVariants = {
  hover: { scale: 1.05, x: 4 },
  tap: { scale: 0.97 },
};

const iconGlow = {
  initial: { scale: 1, opacity: 0.15 },
  animate: {
    scale: [1, 1.4, 1],
    opacity: [0.15, 0.35, 0.15],
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const ProfileRightBar = () => {
  const t = useTranslations("Profile");
  const [socialTab, setSocialTab] = useState<SocialTab>("following");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { friends, followers } = mockFullProfile;
  const currentList = socialTab === "following" ? friends : followers;

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <motion.div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
          <Image src="/icons/heart.svg" alt="heart" width={30} height={30} />
          <span className="ml-2 text-xl font-bold text-red-500">5</span>
        </motion.div>
        <motion.div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
          <Image src="/icons/gem.svg" alt="gem" width={24} height={30} />
          <span className="ml-2 text-xl font-bold text-blue-400">10</span>
        </motion.div>
        <motion.div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}>
          <Image src="/icons/fire.svg" alt="streak" width={25} height={30} />
          <span className="ml-2 text-xl font-bold">3</span>
        </motion.div>
      </div>

      <motion.div
        className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide"
        initial="initial"
        animate="animate"
      >
        {/* Following / Followers */}
        <Card>
          <CardContent className="p-0">
            <div className="flex border-b border-border">
              <motion.button
                onClick={() => setSocialTab("following")}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  socialTab === "following"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <UserCheck size={16} />
                  {t("inviteFriends.following")}
                </div>
              </motion.button>
              <motion.button
                onClick={() => setSocialTab("followers")}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                  socialTab === "followers"
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  <Users size={16} />
                  {t("inviteFriends.followers")}
                </div>
              </motion.button>
            </div>

            <div className="divide-y divide-border max-h-[240px] overflow-y-auto scrollbar-thin">
              {currentList.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">No one yet</p>
              ) : (
                currentList.map((person, i) => (
                  <motion.div
                    key={person.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
                    whileHover={{ x: 4, backgroundColor: "var(--muted)" }}
                    whileTap={{ scale: 0.98 }}
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
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Find & Invite friends */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            <motion.div variants={iconBtnVariants} whileHover="hover" whileTap="tap">
              <Link
                href="/user-search?s="
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors block"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: "color-mix(in srgb, var(--unit-3) 15%, transparent)", color: "var(--unit-3)" }}
                >
                  <ExternalLink size={18} className="relative z-10" />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "var(--unit-3)", opacity: 0.15 }}
                    animate={iconGlow.animate}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t("inviteFriends.findFriends")}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("inviteFriends.findFriendsDescription")}
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={iconBtnVariants} whileHover="hover" whileTap="tap">
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                  style={{ backgroundColor: "color-mix(in srgb, var(--unit-4) 15%, transparent)", color: "var(--unit-4)" }}
                >
                  <Share2 size={18} className="relative z-10" />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: "var(--unit-4)", opacity: 0.15 }}
                    animate={iconGlow.animate}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t("inviteFriends.invite")}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t("inviteFriends.inviteDescription")}
                  </p>
                </div>
              </button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Settings link */}
        <Card>
          <CardContent className="p-0">
            <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/settings"
                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors rounded-xl block"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted">
                  <Settings size={18} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Account settings</span>
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        <FooterLink />
      </motion.div>

      <InviteFriendsDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
};

export default ProfileRightBar;
