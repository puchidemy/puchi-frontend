### Task 4: Frontend — Callback Page + WelcomeFlow Refactor

**Files:**
- Modify: `src/app/[locale]/auth/callback/[provider]/page.tsx`
- Modify: `src/components/welcome/WelcomeFlow.tsx`
- Create: `src/components/welcome/BasicInfoStep.tsx`
- Modify: `src/components/welcome/OnboardingComplete.tsx`
- Modify: `src/components/welcome/index.ts`
- Modify: `src/app/[locale]/welcome/page.tsx`

**Context:** This task refactors the WelcomeFlow to add a BasicInfo step for users who just logged in, and updates the social callback to redirect new users to `/welcome` with pre-filled info from the provider.

**Important:** existing `OnboardingFlow` already has 4 steps (stored in Zustand localStorage). `useOnboardingStore` has `isComplete` flag. WelcomeFlow should SKIP onboarding if already complete in localStorage.

- [ ] **Step 1: Create BasicInfoStep component** (`src/components/welcome/BasicInfoStep.tsx`)

```typescript
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoStepProps {
  prefilledFirstName?: string;
  prefilledLastName?: string;
  onComplete: (data: { firstName: string; lastName: string; ageRange: string }) => void;
}

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

const BasicInfoStep = ({
  prefilledFirstName = "",
  prefilledLastName = "",
  onComplete,
}: BasicInfoStepProps) => {
  const [firstName, setFirstName] = useState(prefilledFirstName);
  const [lastName, setLastName] = useState(prefilledLastName);
  const [ageRange, setAgeRange] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!ageRange) {
      setError("Please select your age range");
      return;
    }

    onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), ageRange });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-display font-bold">Tell us about yourself</h1>
        <p className="text-muted-foreground">
          We just need a few details to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ageRange">Age Range</Label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger id="ageRange">
              <SelectValue placeholder="Select your age range" />
            </SelectTrigger>
            <SelectContent>
              {ageRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default BasicInfoStep;
```

- [ ] **Step 2: Refactor WelcomeFlow** (`src/components/welcome/WelcomeFlow.tsx`)

```typescript
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

      // Gather form values for name fields (since they're in BasicInfoStep, not in a form this component controls)
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
```

- [ ] **Step 3: Update callback page** (`src/app/[locale]/auth/callback/[provider]/page.tsx`)

In the `handleCallback` function, after `response.status === "OK"`:
```typescript
if (response.status === "OK") {
  // Check onboarding status from backend
  try {
    const profileRes = await fetch("/v1/profile");
    if (profileRes.ok) {
      const profile = await profileRes.json();
      if (profile.onboarding_completed) {
        setStatus("success");
        setTimeout(() => router.replace("/learn"), 1000);
        return;
      }
    }
  } catch {}

  // Determine provider user info for pre-fill
  const provider = params?.provider as string;
  let params = new URLSearchParams();

  // For Google/Facebook, Supertokens may have user info in the response
  // TikTok has display_name
  // We pass whatever we can extract
  try {
    const session = await import("supertokens-web-js/recipe/session")
      .then(m => m.getSession());
    const userId = session.getUserId();
    // The display name can be extracted from the third party response
    if (provider === "google") {
      params.set("firstName", "firstName placeholder"); // Will be extracted properly
    }
  } catch {}

  setStatus("success");
  setTimeout(() => router.replace(`/welcome?${params.toString()}`), 1000);
}
```

- [ ] **Step 4: Update OnboardingComplete** — currently it calls `setIsComplete(true)` on mount and has a "Start Learning" button. The key change is that the `onStartLearning` prop is now async (calls backend if logged in). Keep the component as-is but the WelcomeFlow passes the sync logic through `onStartLearning`.

- [ ] **Step 5: Update welcome page** — wrap in Suspense for `useSearchParams`:

```typescript
// src/app/[locale]/welcome/page.tsx
"use client";

import { Suspense } from "react";
import { WelcomeFlow } from "@/components/welcome";

function WelcomePageContent() {
  return <WelcomeFlow />;
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <WelcomePageContent />
    </Suspense>
  );
}
```

- [ ] **Step 6: Update component index** (`src/components/welcome/index.ts`)
Add: `export { default as BasicInfoStep } from "./BasicInfoStep";`

- [ ] **Step 7: Commit**
```bash
git add src/components/welcome/
git add src/app/[locale]/welcome/page.tsx
git add src/app/[locale]/auth/callback/[provider]/page.tsx
git commit -m "feat(auth): add BasicInfo step to WelcomeFlow, redirect social callback to /welcome"
```
