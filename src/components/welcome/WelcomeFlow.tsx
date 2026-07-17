"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { clientFetch } from "@/lib/client-api";
import { getToken } from "@/lib/token-manager";
import { useOnboardingStore } from "@/store/onboarding";
import WelcomeIntro from "./WelcomeIntro";
import BasicInfoStep, { type BasicInfoData } from "./BasicInfoStep";
import OnboardingFlow from "./OnboardingFlow";
import OnboardingComplete from "./OnboardingComplete";

type WelcomeStage = "intro" | "basic-info" | "onboarding" | "complete";

type ProfileFields = {
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
  username?: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
};

function isOnboardingDone(profile: ProfileFields): boolean {
  return Boolean(profile.onboarding_completed ?? profile.onboardingCompleted);
}

function isUsernameTakenError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    msg.includes("username already taken") ||
    msg.includes("already exists") ||
    msg.includes("username_taken")
  );
}

const WelcomeFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Welcome");
  const { isComplete } = useOnboardingStore();
  const [currentStage, setCurrentStage] = useState<WelcomeStage>(() =>
    isComplete ? "complete" : "intro"
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoggedIn] = useState(() => !!getToken());
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [prefilledFirstName, setPrefilledFirstName] = useState(
    () => searchParams.get("firstName") || "",
  );
  const [prefilledLastName, setPrefilledLastName] = useState(
    () => searchParams.get("lastName") || "",
  );
  const [prefilledUsername, setPrefilledUsername] = useState("");
  const [basicInfoError, setBasicInfoError] = useState("");

  // When logged in, load profile: redirect if onboarded, else prefill basic info
  useEffect(() => {
    if (!isLoggedIn) return;

    clientFetch<ProfileFields>("/v1/profile")
      .then((profile) => {
        if (isOnboardingDone(profile)) {
          router.replace("/learn");
          return;
        }
        const first =
          profile.first_name || profile.firstName || searchParams.get("firstName") || "";
        const last =
          profile.last_name || profile.lastName || searchParams.get("lastName") || "";
        const username = profile.username || "";
        if (first) setPrefilledFirstName(first);
        if (last) setPrefilledLastName(last);
        if (username) setPrefilledUsername(username);
        setCurrentStage("basic-info");
      })
      .catch(() => setCurrentStage("basic-info"));
  }, [isLoggedIn, router, searchParams]);

  const handleStartOnboarding = () => {
    if (isLoggedIn) {
      setCurrentStage("basic-info");
    } else {
      setCurrentStage("onboarding");
    }
  };

  const handleBasicInfoComplete = (data: BasicInfoData) => {
    setBasicInfoError("");
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
        await clientFetch("/v1/onboarding/complete", {
          method: "POST",
          body: JSON.stringify({
            first_name: basicInfo.firstName,
            last_name: basicInfo.lastName,
            age_range: basicInfo.ageRange,
            username: basicInfo.username,
            how_heard: howHeard,
            why_learn: whyLearn,
            level: level,
          }),
        });
      } catch (err) {
        console.error("Failed to sync onboarding:", err);
        if (isUsernameTakenError(err)) {
          setBasicInfoError(t("usernameTaken"));
          setPrefilledUsername(basicInfo.username);
          setPrefilledFirstName(basicInfo.firstName);
          setPrefilledLastName(basicInfo.lastName);
          setCurrentStage("basic-info");
          return;
        }
      }

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
            prefilledUsername={prefilledUsername}
            externalError={basicInfoError}
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
