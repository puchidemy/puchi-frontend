"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import FooterLink from "@/components/FooterLink";
import InviteFriendsDialog from "./InviteFriendsDialog";
import type { Friend } from "@/types/profile";
import { cn } from "@/lib/utils";
import { ChevronRight, UserCheck, Users } from "lucide-react";

type SocialTab = "following" | "followers";

interface ProfileRightBarProps {
  following?: Friend[];
  followers?: Friend[];
  streak?: number;
  crowns?: number;
  gems?: number;
  showSettings?: boolean;
}

function StatPill({
  icon,
  alt,
  value,
  valueClass,
  iconW,
  iconH,
}: {
  icon: string;
  alt: string;
  value: number;
  valueClass: string;
  iconW: number;
  iconH: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5",
        "border-[3px] border-b-[5px] border-border bg-card",
        "transition-[border-width,transform] duration-150",
        "hover:border-b-[3px] hover:translate-y-px",
      )}
    >
      <Image src={icon} alt={alt} width={iconW} height={iconH} />
      <span className={cn("text-lg font-display font-extrabold tabular-nums", valueClass)}>
        {value}
      </span>
    </div>
  );
}

function ActionTile({
  href,
  onClick,
  iconSrc,
  title,
  description,
}: {
  href?: string;
  onClick?: () => void;
  iconSrc: string;
  title: string;
  description: string;
}) {
  const className = cn(
    "group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left",
    "border-[3px] border-b-[5px] border-border bg-card",
    "transition-[border-width,transform,background-color] duration-150",
    "hover:border-b-[3px] hover:translate-y-px hover:bg-muted/40",
  );

  const body = (
    <>
      <Image
        src={iconSrc}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 object-contain"
      />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-muted-foreground/60 transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

const ProfileRightBar = ({
  following = [],
  followers = [],
  streak = 0,
  crowns = 0,
  gems = 0,
  showSettings = false,
}: ProfileRightBarProps) => {
  const t = useTranslations("Profile");
  const reduceMotion = useReducedMotion();
  const [socialTab, setSocialTab] = useState<SocialTab>("following");
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentList = socialTab === "following" ? following : followers;
  const fade = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" as const };

  return (
    <>
      <div className="flex w-full gap-2">
        <StatPill
          icon="/icons/heart.svg"
          alt={t("crowns")}
          value={crowns}
          valueClass="text-red-500"
          iconW={26}
          iconH={26}
        />
        <StatPill
          icon="/icons/gem.svg"
          alt={t("gems")}
          value={gems}
          valueClass="text-sky-500"
          iconW={22}
          iconH={26}
        />
        <StatPill
          icon="/icons/fire.svg"
          alt={t("streak")}
          value={streak}
          valueClass="text-orange-500"
          iconW={22}
          iconH={26}
        />
      </div>

      <div className="mt-5 space-y-4 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide pb-6">
        <section className="overflow-hidden rounded-2xl border-[3px] border-b-[5px] border-border bg-card">
          <div className="flex gap-1 border-b-[3px] border-border p-1.5">
            {(
              [
                {
                  id: "following" as const,
                  label: t("inviteFriends.following"),
                  count: following.length,
                  icon: UserCheck,
                  activeColor: "text-[var(--unit-1)]",
                },
                {
                  id: "followers" as const,
                  label: t("inviteFriends.followers"),
                  count: followers.length,
                  icon: Users,
                  activeColor: "text-[var(--unit-5)]",
                },
              ] as const
            ).map((tab) => {
              const active = socialTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSocialTab(tab.id)}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5",
                    "text-xs font-display font-bold uppercase tracking-wide transition-colors duration-150",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon
                    size={15}
                    className={active ? tab.activeColor : undefined}
                  />
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums",
                      active
                        ? "bg-background text-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={socialTab}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={fade}
              >
                {currentList.length === 0 ? (
                  <div className="flex flex-col items-center px-4 py-7 text-center">
                    <Image
                      src="/images/friend.svg"
                      alt=""
                      width={48}
                      height={48}
                      className="mb-3 object-contain"
                    />
                    <p className="font-display text-sm font-bold">
                      {t("inviteFriends.noOneYet")}
                    </p>
                    <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
                      {t("inviteFriends.noOneYetHint")}
                    </p>
                    <Link
                      href="/user-search?s="
                      className={cn(
                        "mt-4 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2",
                        "border-[3px] border-b-4 border-[var(--unit-3)]",
                        "bg-[var(--unit-3)] text-xs font-display font-extrabold uppercase tracking-wide text-white",
                        "transition-[border-width,transform] duration-150",
                        "hover:border-b-[3px] hover:translate-y-px",
                      )}
                    >
                      {t("inviteFriends.findFriends")}
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {currentList.map((person) => (
                      <li key={person.id}>
                        <Link
                          href={`/in/${person.username}`}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-border bg-gradient-to-br from-[var(--unit-1)] to-[var(--unit-5)] text-xs font-bold text-white">
                            {person.imageUrl ? (
                              <Image
                                src={person.imageUrl}
                                alt={person.username}
                                width={40}
                                height={40}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <>
                                {person.firstName?.charAt(0) || ""}
                                {person.lastName?.charAt(0) || ""}
                              </>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                              {person.firstName} {person.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              @{person.username}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tabular-nums">
                              Lv.{person.level}
                            </span>
                            {person.streak > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                                <Image
                                  src="/icons/fire.svg"
                                  alt=""
                                  width={10}
                                  height={12}
                                />
                                {person.streak}
                              </span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <div className="space-y-2.5">
          <ActionTile
            href="/user-search?s="
            iconSrc="/icons/find-friends-v2.svg"
            title={t("inviteFriends.findFriends")}
            description={t("inviteFriends.findFriendsDescription")}
          />
          <ActionTile
            onClick={() => setInviteOpen(true)}
            iconSrc="/icons/invite-gift-v2.svg"
            title={t("inviteFriends.invite")}
            description={t("inviteFriends.inviteDescription")}
          />
          {showSettings && (
            <ActionTile
              href="/settings"
              iconSrc="/icons/account-gear-v2.svg"
              title={t("inviteFriends.accountSettings")}
              description={t("inviteFriends.accountSettingsDescription")}
            />
          )}

        </div>

        <FooterLink />
      </div>

      <InviteFriendsDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  );
};

export default ProfileRightBar;
