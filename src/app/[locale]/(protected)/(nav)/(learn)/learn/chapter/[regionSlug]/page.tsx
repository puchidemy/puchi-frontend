"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { resolveChapterToCitySlug } from "@/lib/journey-cities";

/**
 * Deprecated landmark/chapter route — redirect to Story-first city hub.
 */
export default function ChapterRedirectPage() {
  const params = useParams<{ regionSlug: string }>();
  const router = useRouter();

  useEffect(() => {
    const citySlug = resolveChapterToCitySlug(params.regionSlug);
    router.replace(citySlug ? `/learn/city/${citySlug}` : "/learn");
  }, [params.regionSlug, router]);

  return (
    <div className="flex h-full min-h-0 w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
