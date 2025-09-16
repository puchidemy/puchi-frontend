"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

import { THEME_DARK, THEME_LIGHT } from "@/constants/theme";

const useThemeToggle = () => {
  const [hydrated, setHydrated] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = resolvedTheme === THEME_DARK;

  const toggle = useCallback(() => {
    setTheme(isDark ? THEME_LIGHT : THEME_DARK);
  }, [isDark, setTheme]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return { isDark, toggle, hydrated, setTheme, theme: resolvedTheme };
};

export default useThemeToggle;
