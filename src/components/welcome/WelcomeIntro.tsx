"use client";

import { Button } from "@/components/ui/button";
import RiveWrapper from "@/components/RiveWrapper";
import { Separator } from "@/components/ui/separator";

interface WelcomeIntroProps {
  onStartOnboarding: () => void;
}

const WelcomeIntro = ({ onStartOnboarding }: WelcomeIntroProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Rive Animation */}
      <div className="flex-1 flex items-center justify-center">
        <RiveWrapper
          fileType="welcome"
          width="100%"
          height="60vh"
          className="max-w-4xl"
        />
      </div>

      <Separator />

      {/* Continue Button */}
      <div className="p-6 flex justify-end mr-10">
        <Button variant="primary" onClick={onStartOnboarding} className="px-8">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default WelcomeIntro;
