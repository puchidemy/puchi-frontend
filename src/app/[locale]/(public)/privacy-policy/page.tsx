import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const PrivacyPage = () => {
  const t = useTranslations("PrivacyPage");

  return (
    <div className="container my-8 font-din">
      <Card className="p-0 md:p-10">
        <CardHeader>
          <CardTitle className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {t("title")}
            </h1>
          </CardTitle>
          <CardDescription>
            <strong className="text-base">{t("lastRevised")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal text-[18px] ml-6 space-y-4">
            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {t("sections.general.title")}
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.general.part1")}
              </p>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.general.part2")}
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {t("sections.updates.title")}
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.updates.part1")}
              </p>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.updates.part2")}
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {t("sections.retention.title")}
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.retention.part1")}
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {t("sections.doNotTrack.title")}
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.doNotTrack.part1")}
              </p>
            </li>

            <li>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {t("sections.contactUs.title")}
              </h3>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.contactUs.part1")}
              </p>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.contactUs.part2")}
              </p>
              <p className="text-justify text-gray-700 dark:text-gray-300 mb-4">
                {t("sections.contactUs.part3")}
              </p>
              <Link
                href="mailto:lehoan.dev@gmail.com"
                className="underline underline-offset-2"
              >
                {t("sections.contactUs.email")}
              </Link>
            </li>
          </ol>
        </CardContent>

        <CardFooter>
          <p>{t("footer")}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PrivacyPage;
