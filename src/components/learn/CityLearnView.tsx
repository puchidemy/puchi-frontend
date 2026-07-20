"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import {
  ensureGuestSession,
  listCities,
  type LearnCity,
} from "@/lib/learn-api";
import { useAuthStore } from "@/store/auth";
import { CityMapView } from "./city/CityMapView";

/** Story-first Learn home — city journey map (all unlocked). */
export function CityLearnView() {
  const t = useTranslations("Learn");
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [cities, setCities] = useState<LearnCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateOpen, setGateOpen] = useState(false);

  const loadCities = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError("");
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const data = await listCities();
      setCities(data.cities);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, t]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  if (loading || authLoading) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && cities.length === 0) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center p-8">
        <div className="mx-auto max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error || t("loadError")}</AlertDescription>
          </Alert>
          <Button variant="secondary" onClick={loadCities}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col font-din">
      <CityMapView
        cities={cities.map((c) => ({
          slug: c.slug,
          name: c.name,
          blurb: c.blurb,
          storyCount: c.story_count,
          completedStoryCount: c.completed_story_count,
        }))}
      />
      {!user && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-50 flex justify-center px-3">
          <Button
            variant="highlight"
            className="pointer-events-auto shadow-lg"
            onClick={() => setGateOpen(true)}
          >
            {t("saveProgress")}
          </Button>
        </div>
      )}
      <GuestSoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
