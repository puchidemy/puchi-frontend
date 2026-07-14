"use client";

import LearnTitle from "@/components/learn/LearnTitle";
import Unit from "@/components/learn/Unit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef, useCallback } from "react";

const data = Array.from({ length: 10 }, (_, index) => ({
  numSection: 1,
  titleUnit: "Learn photography!",
  descriptionUnit:
    "Vietnamese men rushed to learn smartphone photography to impress",
  numUnit: index + 1,
  lessons: [
    { id: 1, type: "DICTATION", activePercentage: 0 },
    { id: 2, type: "LISTENING", activePercentage: 0 },
    { id: 3, type: "STORY", activePercentage: 0 },
    { id: 4, type: "UNSCRAMBLE", activePercentage: 0 },
  ],
}));

export default function ScrollHighlight() {
  const titlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const index = titlesRef.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1) {
          setCurrentIndex(index);
        }
      }
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-60px 0px 0px 0px",
      threshold: 0,
    });

    const currentTitles = titlesRef.current;
    currentTitles.forEach((title) => {
      if (title) observer.observe(title);
    });

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect]);

  return (
    <div className="w-full xl:pr-8 pr-0 font-din">
      <div
        ref={stickyRef}
        className="sticky z-50 top-0 pt-4 transition-colors duration-300"
      >
        <LearnTitle data={data[currentIndex]} />
      </div>

      <div className="w-full relative top-8">
        {data.map((title, index) => (
          <div
            key={index}
            ref={(el) => {
              titlesRef.current[index] = el;
            }}
          >
            <Unit data={title} />
          </div>
        ))}
      </div>
      <Card className="p-8 text-center mb-20">
        <Badge variant="secondary" className="uppercase text-gray-100">
          up next
        </Badge>
        <div className="my-4 text-gray-200 text-3xl font-bold">Section 2</div>
        <p className="my-8 mx-auto max-w-[300px] text-gray-600">
          Learn words, phrases, and grammar concepts for basic interactions
        </p>
        <Button className="w-full" variant="highlight">
          Jump here?
        </Button>
      </Card>
    </div>
  );
}
