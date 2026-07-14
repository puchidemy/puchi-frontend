"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { LocalizationResource } from "@clerk/types";
import { THEME_DARK } from "@/constants/theme";
import { useEffect, useState, useMemo } from "react";

type Props = {
  children: React.ReactNode;
  locale: string;
};

async function loadClerkLocale(locale: string): Promise<LocalizationResource | undefined> {
  const mod = await import("@clerk/localizations");
  const map: Record<string, LocalizationResource> = {
    en: mod.enUS,
    zh: mod.zhCN,
    de: mod.deDE,
    es: mod.esES,
    fr: mod.frFR,
    it: mod.itIT,
    ja: mod.jaJP,
    ko: mod.koKR,
    ru: mod.ruRU,
  };
  return map[locale];
}

const ClerkLocalizationProvider = ({ children, locale }: Props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === THEME_DARK;
  const [localization, setLocalization] = useState<LocalizationResource | undefined>();

  useEffect(() => {
    let cancelled = false;
    loadClerkLocale(locale).then((mod) => {
      if (!cancelled) setLocalization(mod);
    });
    return () => { cancelled = true; };
  }, [locale]);

  const appearance = useMemo(() => ({
    theme: isDark ? dark : undefined,
    variables: {
      borderRadius: "var(--radius)",
      colorPrimary: "var(--primary)",
      colorBackground: "var(--background)",
    },
  }), [isDark]);

  return (
    <ClerkProvider
      appearance={appearance}
      localization={localization}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkLocalizationProvider;
