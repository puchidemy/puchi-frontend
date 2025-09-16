"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChatBubble } from "../ChatBubble";
import { MotionDiv } from "../motion";
import {
  useOnboardingStore,
  type ConversationOption,
  type Conversation,
  type ConversationMessage,
} from "@/store/onboarding";

const conversations: Conversation[] = [
  {
    id: 1,
    question: "How did you hear about Puchi?",
    options: [
      {
        text: "Tiktok/Youtube",
        icon: "/images/tiktok-youtube.png",
        response: "Tiktok/YouTube tutorials are the best! 📺",
      },
      {
        text: "Friend/Family",
        icon: "/images/friend.svg",
        response: "That's so sweet! Friends and family are the best! ❤️",
      },
      {
        text: "Google Search",
        icon: "/images/google.svg",
        response: "Google always knows the way! 🔍",
      },
      {
        text: "Facebook/Instagram",
        icon: "/images/social.svg",
        response: "Social media connects us all! 📱",
      },
      {
        text: "Other...",
        icon: "/images/other.svg",
        response: "Interesting! Tell me more! 🤔",
      },
    ],
  },
  {
    id: 2,
    question: "Why are you learning Vietnamese?",
    options: [
      {
        text: "Travel to Vietnam",
        icon: "/images/travel.svg",
        response: "Vietnam is beautiful! You'll love it! 🏖️",
      },
      {
        text: "Work/Business",
        icon: "/images/caarer.svg",
        response: "Business Vietnamese will be very useful! 💼",
      },
      {
        text: "Academic Interest",
        icon: "/images/academic.svg",
        response: "Learning for knowledge is wonderful! 📚",
      },
      {
        text: "Jusr for fun",
        icon: "/images/j4f.svg",
        response: "Having fun while learning is the best! 😄",
      },
      {
        text: "Other...",
        icon: "/images/other.svg",
        response: "Every reason to learn is valid! 🌟",
      },
    ],
  },
  {
    id: 3,
    question: "Okay, we'll build on what you know!",
    options: [
      {
        text: "Complete Beginner",
        icon: "/images/level-0.svg",
        response: "Don't worry! We'll start from the basics! 🌱",
      },
      {
        text: "Know a few words",
        icon: "/images/level-1.svg",
        response: "Great! You already have a foundation! 🏗️",
      },
      {
        text: "Can make simple sentences",
        icon: "/images/level-2.svg",
        response: "Excellent! You're making progress! 📈",
      },
      {
        text: "Intermediate",
        icon: "/images/level-3.svg",
        response: "Wow! You're already quite good! 🎉",
      },
      {
        text: "Advanced",
        icon: "/images/level-4.svg",
        response: "Amazing! You're almost fluent! 🌟",
      },
    ],
  },
  {
    id: 4,
    question: "Here's what you can achieve!",
    options: [],
  },
];

// Feature sections for step 4
const features = [
  {
    icon: "/images/converse.svg",
    title: "Converse with confidence",
    description: "Stress-free speaking and listening exercises",
  },
  {
    icon: "/images/vocabulary.svg",
    title: "Build a large vocabulary",
    description: "Common words and practical phrases",
  },
  {
    icon: "/images/habit.svg",
    title: "Develop a learning habit",
    description: "Smart reminders, fun challenges, and more",
  },
];

interface OnboardingFlowProps {
  onComplete: (answers: Record<number, string>) => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const {
    currentStep,
    answers,
    conversationHistory,
    currentConversation,
    isAnimating,
    setCurrentStep,
    setAnswer,
    setConversationHistory,
    setCurrentConversation,
    setIsAnimating,
    reset,
  } = useOnboardingStore();

  // Reset store when component mounts to avoid stale data
  useEffect(() => {
    reset();
  }, [reset]);

  // Initialize conversation when component mounts or step changes
  useEffect(() => {
    const savedConversation = conversationHistory[currentStep];

    // Clear current conversation first
    setCurrentConversation([]);

    if (savedConversation && savedConversation.length > 0) {
      // If we have saved conversation, show it immediately
      setCurrentConversation(savedConversation);
    } else {
      // Show question with animation
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentConversation([
          {
            type: "question",
            content: conversations[currentStep].question,
            position: "left",
          },
        ]);
        setIsAnimating(false);
      }, 100);
    }
  }, [
    currentStep,
    conversationHistory,
    setCurrentConversation,
    setIsAnimating,
  ]);

  const handleAnswer = (option: ConversationOption) => {
    setAnswer(currentStep, option.text);

    // Create user message
    const userMessage: ConversationMessage = {
      type: "user",
      content: option.text,
      position: "right",
      color: "text-primary",
    };

    // Keep only the question message and add new user message
    const questionMessage = currentConversation.find(
      (msg) => msg.type === "question"
    );
    const updatedConversation = questionMessage
      ? [questionMessage, userMessage]
      : [userMessage];
    setCurrentConversation(updatedConversation);

    // Add Puchi's response after delay
    setTimeout(() => {
      const puchiMessage: ConversationMessage = {
        type: "puchi",
        content: option.response,
        position: "left",
        color: "text-green-600",
      };

      const finalConversation = [...updatedConversation, puchiMessage];
      setCurrentConversation(finalConversation);
      setConversationHistory(currentStep, finalConversation);
    }, 400);
  };

  const handleContinue = () => {
    if (currentStep < conversations.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / conversations.length) * 100;
  const currentConversationData = conversations[currentStep];
  const hasAnswered = currentStep === 3 ? true : answers[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 sm:p-6 max-w-2xl mx-auto w-full">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Step {currentStep + 1} of {conversations.length}
          </span>
          {/* <span className="text-xs sm:text-sm font-medium">
            {Math.round(progress)}%
          </span> */}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Conversation Section with Panda and ChatBubbles */}
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 min-h-[150px] sm:min-h-[180px]">
        {/* Panda Image */}
        <MotionDiv
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-shrink-0 self-center sm:self-start"
        >
          <Image
            src="/images/panda/writing.png"
            alt="Panda writing"
            width={80}
            height={80}
            className="rounded-lg sm:w-[120px] sm:h-[120px]"
          />
        </MotionDiv>

        {/* ChatBubbles Container */}
        <MotionDiv
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 space-y-3 sm:space-y-4 w-full"
        >
          {currentConversation.map(
            (message: ConversationMessage, index: number) => (
              <MotionDiv
                key={`${currentStep}-${index}`}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.1,
                }}
                className={
                  message.position === "right"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <ChatBubble
                  arrowPosition={message.position}
                  width="max-w-[280px] sm:max-w-md"
                >
                  <p
                    className={`text-sm sm:text-lg font-medium ${
                      message.color || ""
                    }`}
                  >
                    {message.content}
                  </p>
                </ChatBubble>
              </MotionDiv>
            )
          )}
        </MotionDiv>
      </div>

      {/* Step 4: Features Section */}
      {currentStep === 3 && (
        <div className="flex-1 mb-4 sm:mb-8">
          <div className="space-y-4">
            {features.map((feature, index) => (
              <MotionDiv
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex-shrink-0">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={32}
                    height={32}
                    className="sm:w-10 sm:h-10"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      )}

      {/* Answer Options - Scrollable Container (only for non-step 4) */}
      {currentStep !== 3 && (
        <div className="flex-1 overflow-y-auto mb-4 sm:mb-8">
          <div className="space-y-2 sm:space-y-3 pr-2">
            {currentConversationData.options.map(
              (option: ConversationOption, index: number) => (
                <MotionDiv
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Button
                    variant={
                      answers[currentStep] === option.text
                        ? "secondary"
                        : "default"
                    }
                    className="w-full justify-start text-sm sm:text-base py-3 sm:py-2"
                    onClick={() => handleAnswer(option)}
                    disabled={isAnimating}
                  >
                    <Image
                      src={option.icon}
                      alt={option.text}
                      width={16}
                      height={16}
                      className="mr-2 sm:w-5 sm:h-5"
                    />
                    <span className="truncate">{option.text}</span>
                  </Button>
                </MotionDiv>
              )
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-auto pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="text-sm sm:text-base"
        >
          Back
        </Button>

        <Button
          onClick={handleContinue}
          disabled={!hasAnswered}
          variant="primary"
          className="ml-auto text-sm sm:text-base"
        >
          {currentStep === conversations.length - 1 ? "Finished" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
