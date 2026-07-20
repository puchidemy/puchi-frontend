"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { getCityPin } from "@/lib/journey-cities";
import type { GetCityResponse } from "@/lib/learn-api";
import { StoryLibrary } from "./StoryLibrary";

export type CityHubProps = {
  data: GetCityResponse;
};

export function CityHub({ data }: CityHubProps) {
  const t = useTranslations("Learn");
  const { city, stories, continue_story_id, recommended_story_ids } = data;
  const pin = getCityPin(city.slug);
  const name = t.has(`City.names.${city.slug}`)
    ? t(`City.names.${city.slug}`)
    : city.name;
  const blurb = t.has(`City.blurbs.${city.slug}`)
    ? t(`City.blurbs.${city.slug}`)
    : city.blurb;
  const cover = city.cover_url || pin?.coverSrc;

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-4 font-din pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
          <Link href="/learn">
            <ArrowLeft className="h-4 w-4" />
            {t("City.backToMap")}
          </Link>
        </Button>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-linear-to-br from-emerald-700/80 via-teal-600/70 to-sky-700/60">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="text-lg font-bold text-white drop-shadow-md">
              {name}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        {blurb && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {blurb}
          </p>
        )}
        {city.story_count > 0 && (
          <p className="text-sm font-medium text-muted-foreground">
            {t("City.hubProgress", {
              completed: city.completed_story_count,
              total: city.story_count,
            })}
          </p>
        )}
      </div>

      <StoryLibrary
        stories={stories}
        continueStoryId={continue_story_id}
        recommendedStoryIds={recommended_story_ids}
      />
    </div>
  );
}
