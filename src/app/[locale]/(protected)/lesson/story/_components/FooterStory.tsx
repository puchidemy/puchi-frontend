"use client";

import { useState } from "react";
import {
  CirclePause,
  CirclePlay,
  RefreshCcw,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const FooterStory = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);

  const steps = 10;

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setCurrentStep(1);
    setIsPlaying(false);
  };

  const handleSpeedChange = () => {
    const speeds = [0.8, 1, 1.2];
    const nextIndex = (speeds.indexOf(speed) + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps));
  };

  return (
    <div className="sticky bottom-0 left-0 w-full h-20 z-50 bg-background/90 border-t">
      <div className="flex w-full h-full justify-center">
        <div className="md:w-[900px] w-full flex justify-between items-center px-4">
          <button
            className="text-xs text-sky-600 font-medium w-9 h-9 border border-sky-600 rounded-full"
            onClick={handleSpeedChange}
            title="speed"
          >
            {speed}x
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              title="left"
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronsLeft size={32} strokeWidth={3} />
            </button>

            <button onClick={handlePlayPause}>
              {isPlaying ? (
                <CirclePause size={32} strokeWidth={3} />
              ) : (
                <CirclePlay size={32} strokeWidth={3} />
              )}
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStep === steps}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronsRight size={32} strokeWidth={3} />
            </button>
          </div>

          <div className="text-sm font-medium">
            <button onClick={handleReplay}>
              <RefreshCcw size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterStory;
