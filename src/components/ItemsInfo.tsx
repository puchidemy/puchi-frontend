"use client";

import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

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
  value: string;
  valueClass: string;
  iconW: number;
  iconH: number;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5",
        "border-[3px] border-b-[5px] border-border bg-card",
        "transition-[border-width,transform] duration-150",
        "hover:border-b-[3px] hover:translate-y-px cursor-pointer",
      )}
    >
      <Image src={icon} alt={alt} width={iconW} height={iconH} />
      <span
        className={cn(
          "text-lg font-display font-extrabold tabular-nums",
          valueClass,
        )}
      >
        {value}
      </span>
    </div>
  );
}

const ItemsInfo = () => {
  const heart = "5";
  const gem = "10";
  const streak = "3";

  return (
    <div className="flex w-full gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="min-w-0 flex-1">
            <StatPill
              icon="/icons/heart.svg"
              alt="hearts"
              value={heart}
              valueClass="text-red-500"
              iconW={26}
              iconH={26}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[280px]">
          <p className="text-sm text-muted-foreground">Hearts</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="min-w-0 flex-1">
            <StatPill
              icon="/icons/gem.svg"
              alt="gems"
              value={gem}
              valueClass="text-sky-500"
              iconW={22}
              iconH={26}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[280px]">
          <p className="text-sm text-muted-foreground">Gems</p>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="min-w-0 flex-1">
            <StatPill
              icon="/icons/fire.svg"
              alt="streak"
              value={streak}
              valueClass="text-orange-500"
              iconW={22}
              iconH={26}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[280px]">
          <p className="text-sm text-muted-foreground">Day streak</p>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default ItemsInfo;
