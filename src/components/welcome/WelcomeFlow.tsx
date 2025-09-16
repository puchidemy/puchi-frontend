"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import WelcomeIntro from "./WelcomeIntro";
import OnboardingFlow from "./OnboardingFlow";
import OnboardingComplete from "./OnboardingComplete";

type WelcomeStage = "intro" | "onboarding" | "complete";

const WelcomeFlow = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState<WelcomeStage>("intro");
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleStartOnboarding = () => {
    setCurrentStage("onboarding");
  };

  const handleOnboardingComplete = (
    onboardingAnswers: Record<number, string>
  ) => {
    setAnswers(onboardingAnswers);
    setCurrentStage("complete");
  };

  const handleStartLearning = () => {
    // Redirect to learn page
    router.push("/learn");
  };

  const renderCurrentStage = () => {
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
