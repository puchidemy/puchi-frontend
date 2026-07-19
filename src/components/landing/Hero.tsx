import { Globe } from "lucide-react";
import type { Variants } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { MotionDiv } from "@/components/motion";
import AnimatedTitle from "@/components/motion/AnimatedTitle";
import AnimatedHeroDecor from "@/components/motion/AnimatedHeroDecor";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import LangSVG from "@public/images/lang.svg";
import VoiceSVG from "@public/images/voice.svg";
import BulbSVG from "@public/images/bulb.svg";
import RewardSVG from "@public/images/reward.svg";

const item = {
  visible: { opacity: 1, y: "0%", scale: 1, transition: { duration: 0.45 } },
  hidden: { opacity: 0, y: "100%", scale: 0.85 },
} satisfies Variants;

const Hero = () => {
  const t = useTranslations("Hero");

  return (
    <section className="relative isolate flex min-h-[calc(100svh-8rem)] items-center overflow-hidden px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 inset-y-5 -z-1 mx-auto max-w-7xl rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_40%,hsl(var(--highlight)/0.2),transparent_28%),radial-gradient(circle_at_50%_90%,hsl(var(--secondary)/0.16),transparent_36%)] dark:bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.2),transparent_28%),radial-gradient(circle_at_50%_90%,hsl(var(--secondary)/0.12),transparent_36%)]"
      />
      <div className="pointer-events-none absolute left-[7%] top-[17%] hidden opacity-65 lg:block">
        <AnimatedHeroDecor className="origin-bottom-right" delay={0.8}>
          <div className="size-16 -rotate-12 rounded-lg bg-linear-to-br from-highlight/70 to-transparent p-2 text-background xl:size-20">
            <LangSVG />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="pointer-events-none absolute right-[8%] top-[15%] hidden opacity-60 lg:block">
        <AnimatedHeroDecor className="origin-bottom-left" move={40} delay={1}>
          <div className="size-16 rotate-12 rounded-lg bg-linear-to-bl from-highlight/70 to-transparent p-2 text-background xl:size-20">
            <BulbSVG />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="pointer-events-none absolute bottom-[13%] left-[17%] hidden opacity-55 xl:block">
        <AnimatedHeroDecor className="origin-top-right" move={40} delay={1.2}>
          <div className="size-16 -rotate-6 rounded-lg bg-linear-to-r from-secondary/35 to-transparent p-2 text-background">
            <RewardSVG />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="pointer-events-none absolute right-[17%] bottom-[13%] hidden opacity-55 xl:block">
        <AnimatedHeroDecor className="origin-top-left" delay={1.4}>
          <div className="size-16 rotate-12 rounded-lg bg-linear-to-l from-secondary/35 to-transparent p-2 text-background">
            <VoiceSVG />
          </div>
        </AnimatedHeroDecor>
      </div>
      <MotionDiv
        initial={{ opacity: 0, x: -28, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.55, delay: 0.18 }}
        className="pointer-events-none absolute -left-2 hidden h-60 w-48 xl:block 2xl:left-8 2xl:h-72 2xl:w-60"
      >
        <MotionDiv
          animate={{ x: [0, -7, 5, 0], rotate: [0, -3, 2.2, 0] }}
          transition={{ duration: 4.6, delay: 0.7, repeat: Infinity, ease: "easeInOut" }}
          className="relative size-full"
        >
          <Image
            src="/images/mascot/puchi_student_beginner.png"
            alt="Puchi beginner student with a red scarf and bamboo backpack"
            fill
            priority
            sizes="18rem"
            className="object-contain object-bottom"
          />
        </MotionDiv>
      </MotionDiv>
      <MotionDiv
        initial={{ opacity: 0, x: 28, scale: 0.92 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.55, delay: 0.32 }}
        className="pointer-events-none absolute -right-2 hidden h-72 w-48 xl:block 2xl:right-8 2xl:h-88 2xl:w-60"
      >
        <MotionDiv
          animate={{ x: [0, 5, -4, 0], rotate: [0, 2.5, -1.8, 0] }}
          transition={{ duration: 5.2, delay: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="relative size-full"
        >
          <Image
            src="/images/mascot/puchi_teacher_ao_dai.png"
            alt="Puchi teacher in a teal áo dài with a teaching pointer"
            fill
            priority
            sizes="18rem"
            className="object-contain object-center"
          />
        </MotionDiv>
      </MotionDiv>
      <div className="relative z-1 mx-auto w-full max-w-3xl -translate-y-6 text-center">
        <AnimatedTitle className="mx-auto w-full max-w-4xl">
          <h1 className="flex w-full flex-col items-center justify-center gap-1 text-balance text-center font-display text-3xl font-bold capitalize leading-normal tracking-tighter sm:text-4xl sm:leading-snug md:gap-2 md:text-6xl">
            <span>
              Master{" "}
              <span className="rounded-full border border-highlight/25 bg-highlight/50 px-[0.35em] py-[0.125em] text-highlight-depth dark:bg-highlight/85 dark:text-background">
                Vietnamese.
              </span>
            </span>
            <span className="flex flex-wrap items-center justify-center">
              Learn{" "}
              <span className="group relative ml-[0.25em] flex h-[1.35em] w-[1.5em] items-center justify-center rounded-full bg-secondary/30 dark:text-secondary">
                <Globe
                  className="z-1 h-[1.25em] w-[1.25em] group-hover:animate-spin-slow"
                  strokeWidth={2.15}
                />
              </span>
              <span className="mr-[0.25em]">
                <span className="sr-only">on</span>
                <span className="lowercase" aria-hidden="true">
                  n
                </span>
              </span>{" "}
              the go.
            </span>
          </h1>
        </AnimatedTitle>
        <MotionDiv
          initial="hidden"
          whileInView="visible"
          variants={item}
          transition={{ delay: 0.5 }}
          className="py-20"
        >
          <Button variant="primary" size="lg" className="px-8" asChild>
            <Link href="/start" prefetch={false} className="truncate">
              {t("continueLearning")}
            </Link>
          </Button>
        </MotionDiv>
      </div>
    </section>
  );
};

export default Hero;
