"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const FooterLink = () => {
  const t = useTranslations("Footer");

  return (
    <div className="w-full py-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500 text-center font-bold font-din">
      <Link className="hover:text-sky-500" href="/about">{t("about")}</Link>
      <Link className="hover:text-sky-500" href="/help">{t("help")}</Link>
      <Link className="hover:text-sky-500" href="/attribution">{t("attribution")}</Link>
      <Link className="hover:text-sky-500" href="/guidelines">{t("guidelines")}</Link>
      <Link className="hover:text-sky-500" href="/terms-of-service">{t("terms")}</Link>
      <Link className="hover:text-sky-500" href="/privacy-policy">{t("privacy")}</Link>
    </div>
  );
};

export default FooterLink;
