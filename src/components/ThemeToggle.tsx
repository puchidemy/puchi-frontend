"use client";

import { Sun, Moon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import useThemeToggle from "@/hooks/use-toggle";
import { useSettingsStore } from "@/store/settings";
import { THEME_DARK, THEME_LIGHT } from "@/constants/theme";

const ThemeToggle = ({ className, ...props }: ButtonProps) => {
  const { isDark, setTheme } = useThemeToggle();
  const setField = useSettingsStore((s) => s.setField);

  const handleToggle = () => {
    const next = isDark ? THEME_LIGHT : THEME_DARK;
    setField("theme", next);
    setTheme(next);
  };

  // Render both icons and use CSS to show/hide based on theme
  // This avoids hydration mismatch by ensuring server and client render the same HTML
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-2xl", className)}
      title="Toggle theme"
      aria-label="Toggle theme"
      {...props}
      onClick={handleToggle}
    >
      <span className="relative cursor-pointer inline-block size-[1em]">
        <Sun
          className={cn(
            "absolute inset-0 size-[1em] fill-current transition-opacity",
            isDark ? "opacity-0" : "opacity-100",
          )}
          suppressHydrationWarning
        />
        <Moon
          className={cn(
            "absolute inset-0 size-[1em] fill-current transition-opacity",
            isDark ? "opacity-100" : "opacity-0",
          )}
          suppressHydrationWarning
        />
      </span>
    </Button>
  );
};

export default ThemeToggle;
