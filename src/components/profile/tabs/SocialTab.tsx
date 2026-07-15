"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FullProfile, Friend, LeaderboardEntry } from "@/types/profile";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, UserPlus, UserCheck } from "lucide-react";

interface SocialTabProps {
  profile: FullProfile;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isTop3 = entry.rank <= 3;
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl ${
        entry.isCurrentUser
          ? "bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] border border-[color-mix(in_srgb,var(--primary)_20%,transparent)]"
          : ""
      }`}
    >
      <span className="w-8 text-center font-din font-bold text-sm">
        {isTop3 ? medals[entry.rank - 1] : `#${entry.rank}`}
      </span>
      <Avatar className="h-9 w-9">
        <AvatarImage src={entry.imageUrl} />
        <AvatarFallback className="text-xs">{entry.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {entry.username}
          {entry.isCurrentUser && (
            <span className="ml-1.5 text-xs text-primary font-normal">\u2190 you</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">Lv. {entry.level}</p>
      </div>
      <div className="text-right">
        <span className="font-din font-bold text-sm">{entry.weeklyXP.toLocaleString()}</span>
        <span className="text-xs text-muted-foreground ml-0.5">XP</span>
      </div>
    </div>
  );
}

function FriendRow({ friend }: { friend: Friend }) {
  const [following, setFollowing] = useState(friend.isFollowing);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={friend.imageUrl} />
        <AvatarFallback>
          {friend.firstName.charAt(0)}
          {friend.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {friend.firstName} {friend.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          Lv. {friend.level} \u00B7 \uD83D\uDD25 {friend.streak}
        </p>
      </div>
      <Button
        size="sm"
        variant={following ? "outline" : "default"}
        className="rounded-full h-8 text-xs gap-1.5"
        onClick={() => setFollowing(!following)}
      >
        {following ? (
          <>
            <UserCheck size={14} /> Following
          </>
        ) : (
          <>
            <UserPlus size={14} /> Follow
          </>
        )}
      </Button>
    </div>
  );
}

export default function SocialTab({ profile }: SocialTabProps) {
  const t = useTranslations("Profile");
  const { friends, followers, leaderboard } = profile;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-din font-bold">{friends.length}</p>
          <p className="text-xs text-muted-foreground">{t("social.friends")}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-din font-bold">{followers.length}</p>
          <p className="text-xs text-muted-foreground">{t("social.followers")}</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-din font-bold">{followers.length}</p>
          <p className="text-xs text-muted-foreground">{t("social.following")}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Crown size={20} className="text-[var(--unit-3)]" />
          {t("social.leaderboard")}
        </h3>
        <div className="space-y-1">
          {leaderboard.slice(0, 10).map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4">{t("social.friendsList")}</h3>
        <div className="space-y-1">
          {friends.map((friend) => (
            <FriendRow key={friend.id} friend={friend} />
          ))}
        </div>
      </div>
    </div>
  );
}
