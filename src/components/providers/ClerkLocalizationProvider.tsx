"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import {
  enUS,
  zhCN,
  deDE,
  esES,
  frFR,
  itIT,
  jaJP,
  koKR,
  ruRU,
} from "@clerk/localizations";
import { LocalizationResource } from "@clerk/types";
import { THEME_DARK } from "@/constants/theme";

export type Localizations = {
  [key: string]: LocalizationResource;
};

export const localizations: Localizations = {
  en: enUS,
  zh: zhCN,
  de: deDE,
  es: esES,
  fr: frFR,
  it: itIT,
  ja: jaJP,
  ko: koKR,
  ru: ruRU,
};

type Props = {
  children: React.ReactNode;
  locale: string;
};

const ClerkLocalizationProvider = ({ children, locale }: Props) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === THEME_DARK;

  return (
    <ClerkProvider
      appearance={{
        theme: isDark ? dark : undefined,
        variables: {
          borderRadius: "var(--radius)",
          colorPrimary: "var(--primary)",
          colorBackground: "var(--background)",
        },
      }}
      localization={localizations[locale]}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkLocalizationProvider;
