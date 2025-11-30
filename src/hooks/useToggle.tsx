"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";

import { THEME_DARK, THEME_LIGHT } from "@/constants/theme";

const useThemeToggle = () => {
  const { resolvedTheme, setTheme, theme: currentTheme } = useTheme();

  const isDark = resolvedTheme === THEME_DARK;
  // In React 19 + Next.js 16, resolvedTheme is undefined during SSR
  // and becomes available after hydration, so we can use it as hydration indicator
  const hydrated = resolvedTheme !== undefined;

  const toggle = useCallback(() => {
    setTheme(isDark ? THEME_LIGHT : THEME_DARK);
  }, [isDark, setTheme]);

  return {
    isDark,
    toggle,
    hydrated,
    setTheme,
    theme: resolvedTheme,
    currentTheme,
  };
};

export default useThemeToggle;
