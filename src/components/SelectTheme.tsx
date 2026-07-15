"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useThemeToggle from "@/hooks/use-toggle";

const SelectTheme = () => {
  const { hydrated, theme, setTheme } = useThemeToggle();

  if (!hydrated)
    return (
      <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm opacity-50">
        <span className="font-bold">Theme</span>
        <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    );

  const handleThemeChange = (value: string) => {
    if (value === "system") {
      setTheme("system");
    } else if (value === "light") {
      setTheme("light");
    } else if (value === "dark") {
      setTheme("dark");
    }
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
