"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { getStorageItem, setStorageItem } from "@/lib/local-storage";
import WelcomeIntro from "./WelcomeIntro";
import OnboardingFlow from "./OnboardingFlow";
import OnboardingComplete from "./OnboardingComplete";
import { STORAGE_KEYS } from "@/constants/local-storage";

type WelcomeStage = "intro" | "onboarding" | "complete";

const WelcomeFlow = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<WelcomeStage>("intro");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const savedAnswers = getStorageItem<Record<number, string>>(
      STORAGE_KEYS.ONBOARDING_ANSWERS
    );
    // If answers exist, skip the flow and go directly to learning
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      router.push("/learn");
      return;
    }
    setIsCheckingStorage(false);
  }, [router]);

  const handleStartOnboarding = () => {
    setCurrentStage("onboarding");
  };

  const handleOnboardingComplete = (
    onboardingAnswers: Record<number, string>
  ) => {
    setAnswers(onboardingAnswers);
    // Save answers to localStorage
    setStorageItem(STORAGE_KEYS.ONBOARDING_ANSWERS, onboardingAnswers);
    setCurrentStage("complete");
  };

  const handleStartLearning = () => {
    // Redirect to learn page
    router.push("/learn");
  };

  const renderCurrentStage = () => {
    // Show nothing while checking localStorage
    if (isCheckingStorage) {
      return null;
    }

    switch (currentStage) {
      case "intro":
        return <WelcomeIntro onStartOnboarding={handleStartOnboarding} />;

      case "onboarding":
        return <OnboardingFlow onComplete={handleOnboardingComplete} />;

      case "complete":
        return (
          <OnboardingComplete
            answers={answers}
            onStartLearning={handleStartLearning}
          />
        );

      default:
        return <WelcomeIntro onStartOnboarding={handleStartOnboarding} />;
    }
  };

  return renderCurrentStage();
};

export default WelcomeFlow;
