"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StoryPlayer } from "@/components/learn/story/StoryPlayer";
import {
  ensureGuestSession,
  getStory,
  type GetStoryResponse,
} from "@/lib/learn-api";
import { useAuthStore } from "@/store/auth";

export default function StoryPage() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId;
  const t = useTranslations("Learn");

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [data, setData] = useState<GetStoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStory = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError("");
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const res = await getStory(storyId);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Story.loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, storyId, t]);

  useEffect(() => {
    loadStory();
  }, [loadStory]);

  if (loading || authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="mx-auto max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {error || t("Story.loadError")}
            </AlertDescription>
          </Alert>
          <Button variant="secondary" onClick={loadStory}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return <StoryPlayer data={data} />;
}
