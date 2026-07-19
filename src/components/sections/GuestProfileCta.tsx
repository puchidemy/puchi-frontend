"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { getToken } from "@/lib/token-manager";
import { cn } from "@/lib/utils";

/** Shown only for guests — uses client auth store (Limen), not session_active cookie. */
export function GuestProfileCta() {
  const t = useTranslations("Learn.rightBar");
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const loading = useAuthStore((s) => s.loading);

  if (loading || user || accessToken || getToken()) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border-[3px] border-b-[5px] border-border bg-card">
      <div className="flex items-start gap-3.5 p-4 pb-3">
        <Image
          src="/icons/characters.svg"
          alt=""
          width={40}
          height={40}
          className="shrink-0 object-contain"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-extrabold leading-tight">
            {t("createProfileTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
            {t("createProfileHint")}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-4">
        <Link
          href="/auth/sign-up"
          className={cn(
            "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3",
            "border-[3px] border-b-[5px] border-primary-depth bg-primary",
            "font-display text-sm font-extrabold uppercase tracking-wide text-primary-foreground",
            "transition-[border-width,transform] duration-150",
            "hover:border-b-[3px] hover:translate-y-px",
          )}
        >
          {t("createProfile")}
        </Link>
        <Link
          href="/auth/sign-in"
          className={cn(
            "inline-flex w-full items-center justify-center rounded-2xl px-4 py-3",
            "border-[3px] border-b-[5px] border-border bg-card",
            "font-display text-sm font-extrabold uppercase tracking-wide text-foreground",
            "transition-[border-width,transform] duration-150",
            "hover:border-b-[3px] hover:translate-y-px hover:bg-muted/40",
          )}
        >
          {t("signIn")}
        </Link>
      </div>
    </section>
  );
}
