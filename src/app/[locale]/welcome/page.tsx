"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useOnboardingStore } from "@/store/onboarding";
import { WelcomeFlow } from "@/components/welcome";

const WelcomePage = () => {
  const router = useRouter();
  const { isComplete } = useOnboardingStore();

  // Check if onboarding is complete, redirect to /learn if it is
  useEffect(() => {
    if (isComplete) {
      router.push("/learn");
    }
  }, [isComplete, router]);

  return <WelcomeFlow />;
};

export default WelcomePage;
