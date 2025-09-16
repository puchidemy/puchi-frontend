"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useThemeToggle from "@/hooks/useToggle";

const SelectTheme = () => {
  const { hydrated, theme, setTheme } = useThemeToggle();

  if (!hydrated) return null;

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
