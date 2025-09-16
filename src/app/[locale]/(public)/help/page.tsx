import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";


const HelpPage = () => {
  const t = useTranslations("HelpPage");

  return (
    <div className="container font-din my-10 space-y-10">
      <div className="font-bold flex gap-2 items-center tracking-wider">
        <span className="text-blue-500 hover:text-blue-400 cursor-pointer">
          {t("breadcrumbs.helpCenter")}
        </span>
        <ChevronRight className="text-gray-400" size={20} strokeWidth={3} />
        <span className="text-blue-500 hover:text-blue-400 cursor-pointer">
          {t("breadcrumbs.home")}
        </span>
      </div>
      <h1 className="text-center text-3xl font-bold">{t("faqTitle")}</h1>

      <div className="max-w-[800px] text-xl mx-auto border-2 rounded-2xl p-6">
        <h2 className="text-sky-500 font-bold pb-4 border-b">
          {t("sections.usingPuchi")}
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>{t("questions.whatIsStreak")}</AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 text-justify text-gray-600 dark:text-gray-400">
              <p>{t("answers.whatIsStreak.part1")}</p>
              <p>{t("answers.whatIsStreak.part2")}</p>
              <p>{t("answers.whatIsStreak.part3")}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              {t("questions.whatAreLeaderboards")}
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 text-justify text-gray-600 dark:text-gray-400">
              <p>{t("answers.whatAreLeaderboards.part1")}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              {t("questions.openSourceLibraries")}
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 text-justify text-gray-600 dark:text-gray-400">
              <p>
                {t("answers.openSourceLibraries.part1")}{" "}
                <Link href="/attribution" className="text-blue-500">
                  {t("answers.openSourceLibraries.linkText")}
                </Link>
                .
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="max-w-[800px] text-xl mx-auto border-2 rounded-2xl p-6">
        <h2 className="text-sky-500 font-bold pb-4 border-b">
          {t("sections.accountManagement")}
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>
              {t("questions.changeUsernameOrEmail")}
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 text-justify text-gray-600 dark:text-gray-400">
              <p>
                {t("answers.changeUsernameOrEmail.part1")}{" "}
                <Link href="/settings/profile" className="text-blue-500">
                  {t("answers.changeUsernameOrEmail.linkText")}
                </Link>
                .
              </p>
              <p>{t("answers.changeUsernameOrEmail.part2")}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              {t("questions.findFollowBlockUsers")}
            </AccordionTrigger>
            <AccordionContent className="text-lg space-y-4 text-justify text-gray-600 dark:text-gray-400">
              <p>{t("answers.findFollowBlockUsers.part1")}</p>
              <p>{t("answers.findFollowBlockUsers.part2")}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="font-bold">{t("feedbackPrompt")}</div>
        <Button variant="secondary">{t("sendFeedback")}</Button>
      </div>
    </div>
  );
};

export default HelpPage;
