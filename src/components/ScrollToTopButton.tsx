"use client";

import { useState, useEffect, forwardRef } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const ScrollToTopButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const toggleVisibility = () => {
        setIsVisible(window.scrollY > 300);
      };

      window.addEventListener("scroll", toggleVisibility);
      return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    return (
      isVisible && (
        <Button
          ref={ref}
          onClick={scrollToTop}
          className={cn("fixed bottom-6 right-6 px-2 py-4 text-green-500 z-50", className)}
          aria-label="Scroll to top"
          {...props}
        >
          <ArrowUp size={28} strokeWidth={3} />
        </Button>
      )
    );
  }
);

ScrollToTopButton.displayName = "ScrollToTopButton";

export default ScrollToTopButton;
