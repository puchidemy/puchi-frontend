"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useThemeToggle from "@/hooks/use-toggle";
import {
  useSettingsStore,
  type SettingsTheme,
} from "@/store/settings";

const SelectTheme = () => {
  const { hydrated, setTheme } = useThemeToggle();
  const theme = useSettingsStore((s) => s.values.theme);
  const setField = useSettingsStore((s) => s.setField);

  // Keep next-themes in sync with persisted settings (guest reload / server hydrate).
  useEffect(() => {
    if (!hydrated) return;
    setTheme(theme);
  }, [hydrated, theme, setTheme]);

  if (!hydrated)
    return (
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
        <span className="font-bold">Theme</span>
        <svg
          className="h-4 w-4 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );

  const handleThemeChange = (value: string) => {
    if (value !== "system" && value !== "light" && value !== "dark") return;
    const next = value as SettingsTheme;
    setField("theme", next);
    setTheme(next);
  };

  return (
    <Select onValueChange={handleThemeChange} value={theme}>
      <SelectTrigger className="font-bold">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="system" className="font-bold">
          SYSTEM DEFAULT
        </SelectItem>
        <SelectItem value="light" className="font-bold">
          LIGHT
        </SelectItem>
        <SelectItem value="dark" className="font-bold">
          DARK
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectTheme;
