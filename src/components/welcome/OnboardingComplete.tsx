"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface OnboardingCompleteProps {
  answers: Record<number, string>;
  onStartLearning: () => void;
}

const OnboardingComplete = ({
  answers,
  onStartLearning,
}: OnboardingCompleteProps) => {
  const stepTitles = [
    "How did you hear about Puchi?",
    "Why are you learning Vietnamese?",
    "Let's prepare you for conversations!",
    "How much Vietnamese do you know?",
    "Here's what you can achieve!",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 max-w-2xl mx-auto w-full">
      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-2 text-center">
        Welcome to Puchi! 🎉
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-muted-foreground mb-8 text-center">
        We&apos;re excited to help you learn Vietnamese!
      </p>

      {/* Summary */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Learning Profile</h2>
        <div className="space-y-3">
          {Object.entries(answers).map(([stepIndex, answer]) => (
            <div key={stepIndex} className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground flex-1">
                {stepTitles[parseInt(stepIndex)]}
              </span>
              <span className="text-sm font-medium ml-4 text-right">
                {answer}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Learning Button */}
      <div className="flex justify-center">
        <Button variant="primary" onClick={onStartLearning} size="lg" className="px-8">
          Start Learning Vietnamese
        </Button>
      </div>
    </div>
  );
};

export default OnboardingComplete;
