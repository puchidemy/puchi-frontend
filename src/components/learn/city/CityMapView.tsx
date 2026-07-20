"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import {
  JOURNEY_CITIES_MAP,
  deriveCityMapViews,
  type CityMapView as CityView,
  type CityProgressHint,
} from "@/lib/journey-cities";
import { guestRequiresLoginForCity } from "@/lib/learn-soft-gate";
import { useAuthStore } from "@/store/auth";
import { CityMapCanvas } from "./CityMapCanvas";
import { CityMapHeader } from "./CityMapHeader";
import { CityPreviewAnchor } from "./CityPreviewAnchor";

export type CityMapViewProps = {
  cities: CityProgressHint[];
  title?: string;
};

const HOVER_CLOSE_MS = 420;

/** Journey Map → City hub. Guests may open Hanoi freely; other cities need login. */
export function CityMapView({ cities, title }: CityMapViewProps) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const config = JOURNEY_CITIES_MAP;
  const views = deriveCityMapViews(cities, config);

  const [pinnedSlug, setPinnedSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalStories = views.reduce((n, v) => n + v.storyCount, 0);
  const completedStories = views.reduce(
    (n, v) => n + v.completedStoryCount,
    0,
  );

  const previewSlug = pinnedSlug ?? hoveredSlug;
  const previewView =
    previewSlug != null
      ? (views.find((v) => v.slug === previewSlug) ?? null)
      : null;

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openHover = (slug: string) => {
    clearCloseTimer();
    setHoveredSlug(slug);
  };

  const scheduleCloseHover = () => {
    if (pinnedSlug) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setHoveredSlug(null);
      closeTimer.current = null;
    }, HOVER_CLOSE_MS);
  };

  const getAriaLabel = (view: CityView) => {
    const name = t.has(`City.names.${view.slug}`)
      ? t(`City.names.${view.slug}`)
      : view.name;
    return `${name}, ${t("City.open")}`;
  };

  const onSelectCity = (slug: string) => {
    clearCloseTimer();
    setPinnedSlug(slug);
    setHoveredSlug(slug);
  };

  const onExplore = () => {
    if (!previewView) return;
    if (!user && guestRequiresLoginForCity(previewView.slug)) {
      setGateOpen(true);
      return;
    }
    router.push(`/learn/city/${previewView.slug}`);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <CityMapHeader
        className="shrink-0"
        title={title ?? t("City.mapTitle")}
        completed={completedStories}
        total={totalStories}
        progressLabel={t("City.progressChip", {
          completed: completedStories,
          total: totalStories,
        })}
      />
      <div className="relative min-h-0 flex-1 overflow-visible">
        <CityMapCanvas
          config={config}
          views={views}
          onSelectCity={onSelectCity}
          onHoverCity={(slug) => {
            if (slug) openHover(slug);
            else scheduleCloseHover();
          }}
          previewSlug={previewSlug}
          getAriaLabel={getAriaLabel}
          className="h-full overflow-visible"
        >
          {previewView && (
            <CityPreviewAnchor
              view={previewView}
              onExplore={onExplore}
              onDismiss={() => {
                clearCloseTimer();
                setPinnedSlug(null);
                setHoveredSlug(null);
              }}
              onPointerEnter={() => openHover(previewView.slug)}
              onPointerLeave={() => scheduleCloseHover()}
            />
          )}
        </CityMapCanvas>
      </div>
      <GuestSoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
