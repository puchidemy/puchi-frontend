"use client";

import { useEffect } from "react";
import type { UseInViewOptions } from "motion/react";
import { useInView, useAnimate, useMotionValue } from "motion/react";

export type AnimatedNumberProps = {
  number: number;
  from?: number;
  prefix?: string;
  suffix?: string;
};

const AnimatedNumber = ({
  from = 0,
  number,
  prefix = "",
  suffix = "",
  ...rest
}: AnimatedNumberProps & UseInViewOptions) => {
  const start = useMotionValue(from);
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope, {
    margin: "0px 0px -100px 0px",
    ...rest,
  });

  useEffect(() => {
    if (!isInView) {
      // reset when not in view
      animate(scope.current, { opacity: 0 }, { duration: 0.1 });
      start.set(from);
      return;
    }

    // Animate when in view
    const controls = [
      animate(scope.current, { opacity: 1 }, { duration: 0.1 }),
      animate(start, number, {
        type: "spring",
        mass: 0.8,
        stiffness: 75,
        damping: 15,
        onUpdate: (latest) => {
          if (scope.current) {
            const formatted = Intl.NumberFormat("en-US").format(
              Math.round(latest)
            );
            scope.current.textContent = `${prefix}${formatted}${suffix}`;
          }
        },
      }),
    ];

    return () => {
      controls.forEach((control) => {
        if (typeof control.stop === "function") {
          control.stop();
        }
      });
    };
  }, [isInView, animate, scope, start, from, number, prefix, suffix]);

  return (
    <span
      ref={scope}
      className="opacity-0"
    >{`${prefix}${number}${suffix}`}</span>
  );
};

export default AnimatedNumber;
