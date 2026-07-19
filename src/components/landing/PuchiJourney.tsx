import Image from "next/image";

import { MotionDiv } from "@/components/motion";
import AnimatedTitle from "@/components/motion/AnimatedTitle";

const skills = [
  {
    title: "Listen for the rhythm",
    description:
      "Train your ear with real Vietnamese sounds, one friendly prompt at a time.",
    image: "/images/mascot/puchi_listening.png",
    alt: "Puchi wearing bamboo headphones",
    visualClass: "bg-secondary/20 dark:bg-secondary/25",
    shapeClass:
      "rounded-[58%_42%_50%_50%/56%_42%_58%_44%] rotate-[-7deg]",
  },
  {
    title: "Read with confidence",
    description:
      "Build vocabulary from useful words and everyday conversations you can recognise.",
    image: "/images/mascot/puchi_reading_book.png",
    alt: "Puchi reading a Vietnamese book",
    visualClass: "bg-primary-light/45 dark:bg-primary/25",
    shapeClass:
      "rounded-[42%_58%_46%_54%/48%_45%_55%_52%] rotate-[6deg]",
  },
  {
    title: "Write it your way",
    description:
      "Turn new phrases into your own voice, with Puchi beside you for every step.",
    image: "/images/mascot/puchi_writing.png",
    alt: "Puchi practicing Vietnamese calligraphy",
    visualClass: "bg-highlight/20 dark:bg-highlight/15",
    shapeClass:
      "rounded-[62%_38%_57%_43%/43%_58%_42%_57%] rotate-[-5deg]",
  },
];

const PuchiJourney = () => {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-[10%] md:py-24">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/3 size-72 rounded-full bg-secondary/10 blur-3xl dark:bg-secondary/15"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-1/4 size-80 rounded-full bg-highlight/10 blur-3xl dark:bg-primary/12"
      />
      <div className="relative mx-auto max-w-(--breakpoint-xl)">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 font-semibold uppercase tracking-[0.18em] text-primary-depth dark:text-primary-light">
            Learn with Puchi
          </p>
          <AnimatedTitle>
            <h2 className="heading-section">
              Small steps. <span className="text-secondary-depth">Real Vietnamese.</span>
            </h2>
          </AnimatedTitle>
          <p className="mt-6 text-pretty leading-7 text-foreground/70">
            Puchi turns the four skills of language learning into a playful,
            supportive daily practice.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-5xl space-y-14 md:mt-20 md:space-y-24">
          {skills.map((skill, index) => {
            const isReversed = index % 2 === 1;

            return (
              <MotionDiv
                key={skill.title}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.22 }}
                transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
              >
                <article className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={isReversed ? "md:order-2" : undefined}>
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/80 text-sm font-bold text-foreground shadow-sm dark:border-border/35 dark:bg-background/30">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 max-w-md font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {skill.title}
                  </h3>
                  <p className="mt-4 max-w-md text-lg leading-8 text-foreground/70">
                    {skill.description}
                  </p>
                </div>

                <div className={isReversed ? "md:order-1" : undefined}>
                  <div className="relative mx-auto aspect-[5/4] w-full max-w-md">
                    <div
                      aria-hidden="true"
                      className={`absolute inset-[6%] ${skill.shapeClass} ${skill.visualClass}`}
                    />
                    <div className="absolute inset-[15%] rounded-[55%_45%_48%_52%/48%_52%_48%_52%] border border-background/55 bg-background/20" />
                    <MotionDiv
                      animate={{ y: [0, -8, 0], rotate: [0, -1, 0] }}
                      transition={{
                        duration: 4.4 + index * 0.35,
                        delay: index * 0.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={skill.image}
                        alt={skill.alt}
                        fill
                        sizes="(max-width: 768px) 90vw, 28rem"
                        className="object-contain drop-shadow-[0_22px_28px_rgb(0_0_0_/_0.14)]"
                      />
                    </MotionDiv>
                  </div>
                </div>
                </article>
              </MotionDiv>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PuchiJourney;
