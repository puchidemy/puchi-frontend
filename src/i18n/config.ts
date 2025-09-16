import { Pathnames, LocalePrefixMode } from "next-intl/routing";

export const defaultLocale = "en" as const;

export const locales = [
  "en",
  "zh",
  "de",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "ru",
] as const;

export const pathnames: Pathnames<typeof locales> = {};

export type Locale = (typeof locales)[number];

export const localePrefix: LocalePrefixMode = "always";
