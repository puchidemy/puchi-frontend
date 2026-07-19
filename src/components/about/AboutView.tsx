"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { MotionDiv, MotionLi } from "@/components/motion";
import AnimatedTitle from "@/components/motion/AnimatedTitle";

/** Scrollbar width + horizontal inset matching top gap (12px / 16px). */
function useHeroBleedMetrics() {
  const [sbw, setSbw] = useState(0);
  const [inset, setInset] = useState(12);

  useEffect(() => {
    const measure = () => {
      setSbw(
        Math.max(0, window.innerWidth - document.documentElement.clientWidth)
      );
      setInset(window.matchMedia("(min-width: 640px)").matches ? 16 : 12);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return { sbw, inset };
}

const poses = [
  {
    key: "wave" as const,
    image: "/images/mascot/puchi_welcome_v2.png",
  },
  {
    key: "think" as const,
    image: "/images/mascot/puchi_listening.png",
  },
  {
    key: "celebrate" as const,
    image: "/images/mascot/puchi_cheering.png",
  },
  {
    key: "guide" as const,
    image: "/images/mascot/puchi_pointing_right.png",
  },
] as const;

const signatureDetails = [
  { key: "leaf" as const, image: "/images/about/about_sig_leaf.png" },
  { key: "scarf" as const, image: "/images/about/about_sig_scarf.png" },
  { key: "backpack" as const, image: "/images/about/about_sig_backpack.png" },
  { key: "eyes" as const, image: "/images/about/about_sig_eyes.png" },
] as const;

const communityTags = {
  facebookLink: (chunks: ReactNode) => (
    <a
      href="https://www.facebook.com/profile.php?id=61569075361529"
      className="font-semibold text-primary-depth underline-offset-4 hover:underline dark:text-primary-light"
      target="_blank"
      rel="noopener noreferrer"
    >
      {chunks}
    </a>
  ),
  githubLink: (chunks: ReactNode) => (
    <a
      href="https://github.com/puchidemy"
      className="font-semibold text-primary-depth underline-offset-4 hover:underline dark:text-primary-light"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
    >
      {chunks}
    </a>
  ),
};

function SectionHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary-depth dark:text-primary-light">
        {eyebrow}
      </p>
      <AnimatedTitle>
        <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </AnimatedTitle>
      <p className="mt-6 text-pretty text-lg leading-8 text-foreground/70">
        {lead}
      </p>
    </div>
  );
}

function BoardFigure({
  src,
  alt,
  aspectClass,
}: {
  src: string;
  alt: string;
  aspectClass: string;
}) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
      className={`relative mx-auto w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-3xl ${aspectClass}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 64rem"
        className="object-contain object-center bg-[#F7F4EC]"
      />
    </MotionDiv>
  );
}

export default function AboutView() {
  const t = useTranslations("AboutPage");
  const { sbw, inset } = useHeroBleedMetrics();

  return (
    <div>
      {/*
        Near full-bleed overlay hero: left/right inset matches top gap,
        width = 100vw − scrollbar − horizontal insets.
      */}
      <section
        className="relative isolate mt-3 overflow-hidden rounded-2xl sm:mt-4 sm:rounded-3xl"
        style={{
          width: `calc(100vw - ${sbw}px - ${inset * 2}px)`,
          marginLeft: `calc(50% - 50vw + ${sbw / 2}px + ${inset}px)`,
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: `calc(100svh - ${inset}px - ${inset < 16 ? "5.25rem" : "9.75rem"})`,
          }}
        >
          <Image
            src="/images/about/about_hero_forest_v5.png"
            alt={t("heroImageAlt")}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[22%_42%] sm:object-[18%_40%]"
          />

          <div className="absolute inset-0 z-1 mx-auto flex w-full max-w-(--breakpoint-xl) items-end justify-end px-5 pb-10 sm:items-center sm:px-8 sm:pb-12 md:px-10">
            <MotionDiv
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="w-full max-w-md sm:max-w-lg md:ml-auto md:w-[min(34rem,46%)] [text-shadow:0_1px_2px_rgb(255_255_255_/_0.9),0_0_24px_rgb(255_255_255_/_0.55)] dark:[text-shadow:0_1px_2px_rgb(0_0_0_/_0.85),0_0_28px_rgb(0_0_0_/_0.55)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-depth dark:text-primary-light">
                {t("tagline")}
              </p>
              <p className="mt-2 font-display text-5xl font-bold tracking-tighter text-primary-depth sm:text-6xl md:text-7xl dark:text-primary-light">
                {t("brand")}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t("heroHeadline")}
              </h1>
              <p className="mt-4 text-lg leading-8 text-foreground sm:mt-5">
                {t("heroLead")}
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* 2. Story */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-(--breakpoint-xl) items-center gap-10 md:grid-cols-2 md:gap-14">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45 }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary-depth dark:text-primary-light">
              {t("storyEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("storyTitle")}
            </h2>
            <div className="mt-6 space-y-4 text-pretty text-lg leading-8 text-foreground/70">
              <p>{t("storyOrigin")}</p>
              <p>{t("storyDream")}</p>
              <p>{t("storyGrowth")}</p>
            </div>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="relative mx-auto aspect-3/4 w-full max-w-sm"
          >
            <Image
              src="/images/about/about_leaf_2.png"
              alt={t("storyImageAlt")}
              fill
              sizes="24rem"
              className="object-contain"
            />
          </MotionDiv>
        </div>
      </section>

      {/* 3. Culture board */}
      <section className="relative px-4 py-12 md:py-16">
        <div className="mx-auto max-w-(--breakpoint-xl)">
          <BoardFigure
            src="/images/about/about_culture_scene.png"
            alt={t("cultureImageAlt")}
            aspectClass="aspect-[3/2]"
          />
        </div>
      </section>

      {/* 4. Skills board */}
      <section className="relative px-4 py-12 md:py-16">
        <div className="mx-auto max-w-(--breakpoint-xl)">
          <BoardFigure
            src="/images/about/about_skills_board.png"
            alt={t("skillsImageAlt")}
            aspectClass="aspect-[3/2]"
          />
        </div>
      </section>

      {/* 5. Signature details */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-(--breakpoint-xl)">
          <SectionHeader
            eyebrow={t("signatureEyebrow")}
            title={t("signatureTitle")}
            lead={t("signatureLead")}
          />
          <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 md:mt-16 md:gap-6">
            {signatureDetails.map((detail, index) => (
              <MotionLi
                key={detail.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className="text-center"
              >
                <div className="relative mx-auto aspect-square w-full max-w-36">
                  <Image
                    src={detail.image}
                    alt={t(`signature.${detail.key}.title`)}
                    fill
                    sizes="9rem"
                    className="object-contain"
                  />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                  {t(`signature.${detail.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground/65">
                  {t(`signature.${detail.key}.description`)}
                </p>
              </MotionLi>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Meet poses */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="mx-auto max-w-(--breakpoint-xl)">
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {poses.map((pose, index) => (
              <MotionLi
                key={pose.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="text-center"
              >
                <div className="relative mx-auto aspect-square w-full max-w-44">
                  <div
                    aria-hidden
                    className="absolute inset-[12%] rounded-full bg-secondary/15 dark:bg-secondary/20"
                  />
                  <Image
                    src={pose.image}
                    alt={t(`poses.${pose.key}.alt`)}
                    fill
                    sizes="11rem"
                    className="object-contain"
                  />
                </div>
                <p className="mt-3 font-display text-xl font-bold tracking-tight">
                  {t(`poses.${pose.key}.label`)}
                </p>
              </MotionLi>
            ))}
          </ul>
        </div>
      </section>

      {/* 7. Growth board (leaf progression) */}
      <section className="relative overflow-hidden px-4 py-12 md:py-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-transparent via-primary/8 to-transparent"
        />
        <div className="mx-auto max-w-(--breakpoint-xl)">
          <BoardFigure
            src="/images/about/about_growth_board.png"
            alt={t("growthImageAlt")}
            aspectClass="aspect-[3/2]"
          />
        </div>
      </section>

      {/* 8. Mission */}
      <section className="relative px-4 py-16 md:py-24">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-2xl text-center"
        >
          <AnimatedTitle>
            <h2 className="font-display text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              {t("missionTitle")}
            </h2>
          </AnimatedTitle>
          <p className="mt-6 text-pretty text-lg leading-8 text-foreground/70">
            {t("missionLead")}
          </p>
          <p className="mt-10 text-sm text-foreground/55">{t("creator")}</p>
          <p className="mt-2 text-sm text-foreground/60">
            {t.rich("community", communityTags)}
          </p>
          <p className="mt-6 text-xs text-foreground/45">
            <a
              href="/images/about/puchi_brand_system_v2.png"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {t("sheetLink")}
            </a>
          </p>
        </MotionDiv>
      </section>
    </div>
  );
}
