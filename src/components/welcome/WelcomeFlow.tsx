"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { clientFetch } from "@/lib/client-api";
import { getToken } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
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
  const authLoading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthHydrated();

  const [bootstrapping, setBootstrapping] = useState(true);
  const [currentStage, setCurrentStage] = useState<WelcomeStage>("intro");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [basicInfo, setBasicInfo] = useState<BasicInfoData | null>(null);
  const [prefilledFirstName, setPrefilledFirstName] = useState(
    () => searchParams.get("firstName") || "",
  );
  const [prefilledLastName, setPrefilledLastName] = useState(
    () => searchParams.get("lastName") || "",
  );
  const [prefilledUsername, setPrefilledUsername] = useState("");
  const [basicInfoError, setBasicInfoError] = useState("");
  const [syncError, setSyncError] = useState("");
  const [starting, setStarting] = useState(false);

  /** Prevent profile bootstrap from re-running and wiping in-progress stages. */
  const bootstrapDoneRef = useRef(false);

  // Route once after auth is ready. Do NOT depend on onboarding isComplete —
  // Finish sets that flag and would otherwise bounce back to basic-info.
  useEffect(() => {
    if (!hydrated || authLoading) {
      setBootstrapping(true);
      return;
    }

    if (bootstrapDoneRef.current) {
      setBootstrapping(false);
      return;
    }

    const token = getToken() || accessToken;
    const loggedIn = Boolean(user || token);

    if (!loggedIn) {
      bootstrapDoneRef.current = true;
      setBootstrapping(false);
      setCurrentStage(
        useOnboardingStore.getState().isComplete ? "complete" : "intro",
      );
      return;
    }

    let cancelled = false;
    setBootstrapping(true);

    clientFetch<ProfileFields>("/v1/profile")
      .then((profile) => {
        if (cancelled) return;
        if (isOnboardingDone(profile)) {
          bootstrapDoneRef.current = true;
          router.replace("/learn");
          return;
        }

        const first =
          profile.first_name ||
          profile.firstName ||
          searchParams.get("firstName") ||
          "";
        const last =
          profile.last_name ||
          profile.lastName ||
          searchParams.get("lastName") ||
          "";
        const username = profile.username || "";
        if (first) setPrefilledFirstName(first);
        if (last) setPrefilledLastName(last);
        if (username) setPrefilledUsername(username);

        // Logged-in first visit: Basic Info first. Keep local survey answers until
        // Start Learning syncs to server (then reset). Do not wipe LS on entry.
        setCurrentStage("basic-info");
        bootstrapDoneRef.current = true;
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentStage("basic-info");
        bootstrapDoneRef.current = true;
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, authLoading, user, accessToken, router, searchParams]);

  const handleStartOnboarding = () => {
    if (getToken() || accessToken || user) {
      setCurrentStage("basic-info");
    } else {
      setCurrentStage("onboarding");
    }
  };

  const handleBasicInfoComplete = (data: BasicInfoData) => {
    setBasicInfoError("");
    setSyncError("");
    setBasicInfo(data);
    // After basic info → survey questions (reset earlier cleared guest isComplete)
    setCurrentStage("onboarding");
  };

  const handleOnboardingComplete = (onboardingAnswers: Record<number, string>) => {
    setAnswers(onboardingAnswers);
    setCurrentStage("complete");
  };

  const handleStartLearning = async () => {
    setSyncError("");

    if (getToken() || accessToken || user) {
      if (!basicInfo) {
        setCurrentStage("basic-info");
        return;
      }

      setStarting(true);
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
            level,
          }),
        });
        useOnboardingStore.getState().reset();
        router.replace("/learn");
      } catch (err) {
        console.error("Failed to sync onboarding:", err);
        if (isUsernameTakenError(err)) {
          setBasicInfoError(t("usernameTaken"));
          setPrefilledUsername(basicInfo.username);
          setPrefilledFirstName(basicInfo.firstName);
          setPrefilledLastName(basicInfo.lastName);
          setCurrentStage("basic-info");
        } else {
          setSyncError(err instanceof Error ? err.message : t("syncFailed"));
        }
      } finally {
        setStarting(false);
      }
      return;
    }

    router.push("/learn");
  };

  if (!hydrated || bootstrapping || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  switch (currentStage) {
    case "intro":
      return <WelcomeIntro onStartOnboarding={handleStartOnboarding} />;
    case "basic-info":
      return (
        <BasicInfoStep
          key={`${prefilledFirstName}|${prefilledLastName}|${prefilledUsername}`}
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
        <div className="space-y-4">
          {syncError && (
            <p className="text-center text-sm text-destructive pt-6">{syncError}</p>
          )}
          <OnboardingComplete
            answers={answers}
            onStartLearning={handleStartLearning}
            starting={starting}
          />
        </div>
      );
    default:
      return <WelcomeIntro onStartOnboarding={handleStartOnboarding} />;
  }
};

export default WelcomeFlow;
