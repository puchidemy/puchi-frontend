"use client";

import { LazyMotion } from "motion/react";

const loadFeatures = () => import("@/lib/motion").then((res) => res.default);

type Props = {
  children: React.ReactNode;
};

const LazyMotionProvider = ({ children }: Props) => {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
};

export default LazyMotionProvider;
