"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/routing";
import { countries } from "@/constants/countries";

const NavigationLocaleSwitcherPublic = () => {
  const pathname = usePathname();
  const t = useTranslations("Locale");
  const locale = useLocale();

  return (
    <div className="group">
      <div className="w-full p-2 cursor-pointer">
        <span className="max-sm:hidden text-lg text-gray-400 font-semibold uppercase">
          {t("siteLanguage")}: {t("name")}
        </span>
        <Image
          className="sm:hidden"
          src={`/images/flag/${locale}.svg`}
          alt={`${locale} flag`}
          width={36}
          height={24}
        />
      </div>
      <div className="hidden group-hover:block absolute right-2">
        <div className="grid grid-cols-2 p-4 border rounded-lg bg-background">
          {countries.map(([locale, country]) => {
            return (
              <Link
                key={locale}
                href={pathname}
                locale={locale}
                className="md:w-48 w-36 flex items-center p-4 gap-4 rounded-lg hover:bg-primary/10 dark:hover:bg-border/70"
              >
                <Image
                  src={`/images/flag/${country.flag}.svg`}
                  alt={`${country.title} flag`}
                  width={36}
                  height={24}
                />
                <span>{country.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationLocaleSwitcherPublic;
