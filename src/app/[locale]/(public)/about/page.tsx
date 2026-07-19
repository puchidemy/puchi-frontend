import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import AboutView from "@/components/about/AboutView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const AboutPage = () => {
  return <AboutView />;
};

export default AboutPage;
