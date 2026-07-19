"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import ItemsInfo from "../ItemsInfo";
import { Link } from "@/i18n/routing";
import FooterLink from "../FooterLink";
import { GuestProfileCta } from "./GuestProfileCta";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border-[3px] border-b-[5px] border-border bg-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

const RightBarSection = () => {
  const t = useTranslations("Learn.rightBar");
  const xpCurrent = 0;
  const xpGoal = 10;
  const lessonsLeft = 9;
  const progressPct = Math.min(100, Math.round((xpCurrent / xpGoal) * 100));

  return (
    <div className="w-full h-full">
      <ItemsInfo />
      <div className="mt-5 space-y-3.5 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide pb-6">
        <Panel>
          <div className="flex items-start gap-3.5 p-4">
            <Image
              alt=""
              src="/icons/unlock.svg"
              width={40}
              height={52}
              className="shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-base font-extrabold leading-tight">
                {t("unlockLeaderboards")}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
                {t("unlockLeaderboardsHint", { count: lessonsLeft })}
              </p>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-2 border-b-[3px] border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Image src="/icons/quests.svg" alt="" width={22} height={22} />
              <h2 className="font-display text-base font-extrabold">
                {t("dailyQuests")}
              </h2>
            </div>
            <Link
              href="/quests"
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-display font-extrabold uppercase tracking-wide text-sky-500",
                "transition-transform duration-150 hover:translate-x-0.5",
              )}
            >
              {t("viewAll")}
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex items-center gap-3.5 p-4">
            <Image
              src="/icons/xp.svg"
              alt=""
              width={36}
              height={36}
              className="shrink-0 object-contain"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold">
                {t("earnXp", { count: xpGoal })}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-4 flex-1 overflow-hidden rounded-full border-2 border-border bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--unit-3)] transition-[width] duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                  <span className="relative z-10 flex h-full items-center justify-center text-[10px] font-extrabold tabular-nums text-foreground/80">
                    {xpCurrent}/{xpGoal}
                  </span>
                </div>
                <Image
                  src="/icons/chest.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="shrink-0"
                />
              </div>
            </div>
          </div>
        </Panel>

        <GuestProfileCta />

        <FooterLink />
      </div>
    </div>
  );
};

export default RightBarSection;
