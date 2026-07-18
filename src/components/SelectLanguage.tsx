"use client";

import Image from "next/image";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/constants/countries";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSettingsStore } from "@/store/settings";
import type { Locale } from "@/i18n/config";

const SelectLanguage = () => {
  const currLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const setField = useSettingsStore((s) => s.setField);

  const handleChangeLanguage = (locale: string) => {
    setField("locale", locale);
    router.replace(pathname, { locale: locale as Locale });
  };

  return (
    <Select onValueChange={handleChangeLanguage} value={currLocale}>
      <SelectTrigger className="font-bold">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {countries.map(([locale, country]) => {
          return (
            <SelectItem key={locale} value={locale}>
              <div className="flex">
                <Image
                  src={`/images/flag/${country.flag}.svg`}
                  alt={`${country.title} flag`}
                  width={24}
                  height={16}
                />
                <p className="ml-4 mr-1 uppercase">{country.title}</p>
                <p>({country.flag})</p>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectLanguage;
