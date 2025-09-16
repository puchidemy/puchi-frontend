import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AboutPage = () => {
  const t = useTranslations("AboutPage");

  return (
    <div className="container my-8 font-din">
      <Card className="p-0 md:p-10">
        <CardHeader>
          <CardTitle className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {t("title")}
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-justify text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>{t("intro")}</p>
          <p>{t("technologies")}</p>
          <p>{t("creator")}</p>
          <p>
            {t.rich("joinCommunity", {
              facebookLink: (chunks) => (
                <a
                  href="https://www.facebook.com/profile.php?id=61569075361529"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
              githubLink: (chunks) => (
                <a
                  href="https://github.com/puchidemy/puchi-frontend"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutPage;
