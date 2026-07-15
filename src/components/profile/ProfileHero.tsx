"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FullProfile } from "@/types/profile";
import LevelRing from "./shared/LevelRing";
import StreakFlame from "./shared/StreakFlame";
import XpProgressBar from "./shared/XpProgressBar";
import { Crown, Gem, Camera } from "lucide-react";

interface ProfileHeroProps {
  profile: FullProfile;
  onAvatarChange?: (file: File) => void;
}

export default function ProfileHero({ profile, onAvatarChange }: ProfileHeroProps) {
  const t = useTranslations("Profile");
  const { user, gamification } = profile;
  const xpProgress = (gamification.currentXP / gamification.xpToNextLevel) * 100;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState(user.imageUrl);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    onAvatarChange?.(file);
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <LevelRing level={gamification.level} progress={xpProgress} size={120}>
            <Avatar className="h-[104px] w-[104px] border-4 border-background">
              <AvatarImage src={avatarSrc} alt={user.username} />
              <AvatarFallback className="text-2xl font-display bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </LevelRing>
          <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
            <Camera className="text-white" size={28} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-display font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {(user.bio || (user as any).bio) && (
            <p className="text-sm text-muted-foreground/80 mt-1 max-w-md">
              {(user as any).bio}
            </p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <StreakFlame streak={gamification.streak} size="md" />
            <p className="text-xs text-muted-foreground mt-1">{t("streak")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Crown size={24} className="text-[var(--unit-3)]" />
              <span className="text-3xl font-display font-extrabold tabular-nums">
                {gamification.crowns}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("crowns")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5">
              <Gem size={24} className="text-[var(--unit-5)]" />
              <span className="text-3xl font-display font-extrabold tabular-nums">
                {gamification.gems}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("gems")}</p>
          </div>
        </div>
      </div>

      <XpProgressBar
        currentLevel={gamification.level}
        currentXP={gamification.currentXP}
        xpToNextLevel={gamification.xpToNextLevel}
      />
    </div>
  );
}
