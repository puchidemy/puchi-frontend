import { useTranslations } from "next-intl";
import { Asterisk, ArrowDown } from "lucide-react";

import { MotionDiv } from "@/components/motion";
import AnimatedTitle from "@/components/motion/AnimatedTitle";
import LogoSVG from "@public/images/logo/logo.svg";
import { Link } from "@/i18n/routing";
import FooterLink from "../FooterLink";

const StartCTA = ({ label }: { label: string }) => {
  return (
    <span className="group relative block size-20 rounded-inherit sm:size-28 sm:text-lg lg:size-32">
      <span className="absolute inset-0 animate-footer-pulse rounded-inherit bg-highlight group-hover:paused" />
      <span className="absolute inset-0 flex items-center justify-center font-bold uppercase underline decoration-wavy underline-offset-2 transition-transform duration-300 ease-out group-hover:scale-125">
        {label}
      </span>
    </span>
  );
};

const Footer = () => {
  const t = useTranslations("Footer");

  return (
    <footer className="space-y-4 px-1 pb-4">
      <MotionDiv
        initial={{ y: "10%", scale: 0.95, opacity: 0 }}
        whileInView={{ y: "0%", scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="relative mx-auto flex h-80 flex-col justify-between overflow-hidden rounded-4xl bg-primary-depth/90 text-background dark:bg-card sm:h-96 lg:h-[26rem]"
      >
        <div className="flex border-b-2 border-border/70 dark:border-card dark:bg-primary max-md:flex-col-reverse">
          <div className="group flex w-full flex-1 gap-12 overflow-hidden whitespace-nowrap border-border/70 py-2 text-lg capitalize max-md:border-t-2 sm:text-2xl md:border-r-2 md:py-4">
            <p className="flex animate-footer-marquee items-center gap-12 group-hover:paused">
              <span>{t("startYourLanguageJourneyHere")}</span>
              <ArrowDown
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
              <span>{t("learnAnytimeLearnAnywhere")}</span>
              <Asterisk
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
            </p>
            <p
              className="flex animate-footer-marquee items-center gap-12 group-hover:paused"
              aria-hidden="true"
            >
              <span>{t("startYourLanguageJourneyHere")}</span>
              <ArrowDown
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
              <span>{t("learnAnytimeLearnAnywhere")}</span>
              <Asterisk
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
            </p>
            <p
              className="flex animate-footer-marquee items-center gap-12 group-hover:paused"
              aria-hidden="true"
            >
              <span>{t("startYourLanguageJourneyHere")}</span>
              <ArrowDown
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
              <span>{t("learnAnytimeLearnAnywhere")}</span>
              <Asterisk
                className="h-[1.5em] w-[1.5em]"
                aria-hidden="true"
                strokeWidth={2.25}
              />
            </p>
          </div>
          <a
            className="flex items-center justify-end px-4 py-2 text-center font-semibold uppercase opacity-70 before:content-['@_'] after:content-['_*'] hover:opacity-100 sm:px-12 md:py-4 lg:text-2xl"
            href="https://github.com/puchidemy/puchi-frontend"
            target="_blank"
          >
            Github
          </a>
        </div>
        <div className="flex-grow select-none overflow-hidden">
          <AnimatedTitle className="md:absolute md:-bottom-1/4 md:left-0 md:translate-x-0">
            <p className="pr-6 font-display text-[min(37vw,300px)] -tracking-widest dark:text-card-foreground">
              Puchi
            </p>
          </AnimatedTitle>
          <MotionDiv
            className="relative ml-auto flex h-full w-1/3 flex-col justify-end max-md:hidden"
            initial={{ y: "95%", x: "2%" }}
            whileInView={{ y: "15%" }}
            transition={{ type: "spring", duration: 1.2 }}
            viewport={{ margin: "10% 0% 0% 0%" }}
          >
            <div className="drop-shadow-2xl saturate-[0.7] dark:hue-rotate-[50deg]">
              <LogoSVG />
            </div>
          </MotionDiv>
        </div>

        <div className="absolute right-1/4 top-1/3 md:right-1/3 md:top-[30%]">
          <Link href="/welcome" className="rounded-full">
            <span className="sr-only">Start Learning</span>
            <StartCTA label={t("start")} />
          </Link>
        </div>
      </MotionDiv>
      <FooterLink />
      <p className="text-center max-sm:text-sm">
        © 2024 — Puchi by{" "}
        <a
          href="https://facebook.com/hoanit02"
          target="_blank"
          className="font-semibold decoration-dotted transition hover:underline"
        >
          @hoancute
        </a>
      </p>
      <p className="text-center text-2xl">{`{◕ ◡ ◕}`}</p>
    </footer>
  );
};

export default Footer;
