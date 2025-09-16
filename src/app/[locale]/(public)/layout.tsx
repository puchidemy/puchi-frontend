import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { locales, defaultLocale } from "@/i18n/config";
import { getBaseUrl } from "@/lib/helpers";
const ScrollToTopButton = dynamic(
  () => import("@/components/ScrollToTopButton")
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("PublicLayout");
  const currentLocale = (await params).locale || defaultLocale || "en";
  const baseUrl = getBaseUrl();

  const alternates = {
    canonical: `${baseUrl}/${currentLocale}`,
    languages: locales.reduce((acc, locale) => {
      acc[locale] = `${baseUrl}/${locale}`;
      return acc;
    }, {} as Record<string, string>),
  };

  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${baseUrl}/${currentLocale}`,
      siteName: "Puchi",
      locale: currentLocale,
      type: "website",
      images: ["/og-image.jpg"],
    },
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="container flex flex-grow flex-col px-0">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
