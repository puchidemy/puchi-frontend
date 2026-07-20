"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CityHub } from "@/components/learn/city/CityHub";
import { useRouter } from "@/i18n/routing";
import { isKnownCitySlug } from "@/lib/journey-cities";
import {
  ensureGuestSession,
  getCity,
  type GetCityResponse,
} from "@/lib/learn-api";
import { useAuthStore } from "@/store/auth";

export default function CityPage() {
  const params = useParams<{ citySlug: string }>();
  const citySlug = params.citySlug;
  const t = useTranslations("Learn");
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [data, setData] = useState<GetCityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const redirectedRef = useRef(false);

  const loadCity = useCallback(async () => {
    if (authLoading) return;
    if (!isKnownCitySlug(citySlug)) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        toast.message(t("City.unknown"));
        router.replace("/learn");
      }
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const res = await getCity(citySlug);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, citySlug, t, router]);

  useEffect(() => {
    loadCity();
  }, [loadCity]);

  if (!isKnownCitySlug(citySlug)) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center p-8">
        <div className="mx-auto max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error || t("loadError")}</AlertDescription>
          </Alert>
          <Button variant="secondary" onClick={loadCity}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <CityHub data={data} />
    </div>
  );
}
