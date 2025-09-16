import { ClerkProvider } from "@clerk/nextjs";
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

import "@/styles/clerk.css";

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
  return (
    <ClerkProvider
      appearance={{
        variables: {
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
          colorPrimary: "hsl(142, 71%, 45%)",
        },
      }}
      localization={localizations[locale]}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkLocalizationProvider;
