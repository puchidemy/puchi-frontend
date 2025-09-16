"use client";

import type { PropsWithChildren } from "react";
import { type Variant } from "framer-motion";
import { MotionLi, MotionUl } from "@/components/motion";

type AnimatedListProps = {
  variants: {
    visible: Variant;
    hidden: Variant;
  };
  className?: string;
};

export const AnimatedList = ({
  children,
  variants,
  className,
}: PropsWithChildren<AnimatedListProps>) => {
  return (
    <MotionUl
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {children}
    </MotionUl>
  );
};

export function AnimatedListItem({
  children,
  variants,
  className,
}: PropsWithChildren<AnimatedListProps>) {
  return (
    <MotionLi className={className} variants={variants}>
      {children}
    </MotionLi>
  );
}
