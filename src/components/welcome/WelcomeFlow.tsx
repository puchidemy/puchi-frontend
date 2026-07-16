"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding";
import WelcomeIntro from "./WelcomeIntro";
import BasicInfoStep from "./BasicInfoStep";
import OnboardingFlow from "./OnboardingFlow";
import OnboardingComplete from "./OnboardingComplete";

type WelcomeStage = "intro" | "basic-info" | "onboarding" | "complete";

const WelcomeFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isComplete } = useOnboardingStore();
  const [currentStage, setCurrentStage] = useState<WelcomeStage>("intro");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [basicInfo, setBasicInfo] = useState<{ firstName: string; lastName: string; ageRange: string } | null>(null);

  // Kiểm tra login state
  useEffect(() => {
    fetch("/api/auth/session")
      .then(r => r.json())
      .then(data => setIsLoggedIn(!!data.session))
      .catch(() => setIsLoggedIn(false));
  }, []);

  // Pre-fill từ social callback params
  const prefilledFirstName = searchParams.get("firstName") || "";
  const prefilledLastName = searchParams.get("lastName") || "";

  // Determine initial stage based on auth state
  useEffect(() => {
    if (!isLoggedIn) {
      // Chưa login: intro → onboarding (nếu chưa complete) → complete
      if (isComplete) {
        setCurrentStage("complete");
      }
      // else stays at "intro" — user clicks "Get Started" to begin
    }
  }, [isLoggedIn, isComplete]);

  const handleStartOnboarding = () => {
    if (isLoggedIn) {
      // User vừa login → cần nhập basic info trước
      setCurrentStage("basic-info");
    } else {
      // User chưa login → vào onboarding luôn
      setCurrentStage("onboarding");
    }
  };

  const handleBasicInfoComplete = (data: { firstName: string; lastName: string; ageRange: string }) => {
    setBasicInfo(data);
    if (!isComplete) {
      setCurrentStage("onboarding");
    } else {
      setCurrentStage("complete");
    }
  };

  const handleOnboardingComplete = (onboardingAnswers: Record<number, string>) => {
    setAnswers(onboardingAnswers);
    setCurrentStage("complete");
  };

  const handleStartLearning = async () => {
    if (isLoggedIn && basicInfo) {
      const store = useOnboardingStore.getState();
      const howHeard = store.answers[0] || answers[0] || "";
      const whyLearn = store.answers[1] || answers[1] || "";
      const level = store.answers[2] || answers[2] || "";

      try {
        await fetch("/v1/onboarding/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            first_name: basicInfo.firstName,
            last_name: basicInfo.lastName,
            age_range: basicInfo.ageRange,
            how_heard: howHeard,
            why_learn: whyLearn,
            level: level,
          }),
        });
      } catch (err) {
        console.error("Failed to sync onboarding:", err);
      }

      // Clear onboarding store
      useOnboardingStore.getState().reset();
    }
    router.push("/learn");
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case "intro":
        return <WelcomeIntro onStartOnboarding={handleStartOnboarding} />;
      case "basic-info":
        return (
          <BasicInfoStep
            prefilledFirstName={prefilledFirstName}
            prefilledLastName={prefilledLastName}
            onComplete={handleBasicInfoComplete}
          />
        );
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
