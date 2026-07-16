"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoStepProps {
  prefilledFirstName?: string;
  prefilledLastName?: string;
  onComplete: (data: { firstName: string; lastName: string; ageRange: string }) => void;
}

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

const BasicInfoStep = ({
  prefilledFirstName = "",
  prefilledLastName = "",
  onComplete,
}: BasicInfoStepProps) => {
  const t = useTranslations("Welcome");
  const [firstName, setFirstName] = useState(prefilledFirstName);
  const [lastName, setLastName] = useState(prefilledLastName);
  const [ageRange, setAgeRange] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!lastName.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!ageRange) {
      setError(t("ageRequired"));
      return;
    }

    onComplete({ firstName: firstName.trim(), lastName: lastName.trim(), ageRange });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center p-6 max-w-md mx-auto w-full">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl font-display font-bold">{t("tellUsAboutYou")}</h1>
        <p className="text-muted-foreground">
          {t("basicInfoDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="firstName">{t("firstName")}</Label>
          <Input
            id="firstName"
            name="firstName"
            placeholder={t("firstNamePlaceholder")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t("lastName")}</Label>
          <Input
            id="lastName"
            name="lastName"
            placeholder={t("lastNamePlaceholder")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ageRange">{t("ageRange")}</Label>
          <Select value={ageRange} onValueChange={setAgeRange}>
            <SelectTrigger id="ageRange">
              <SelectValue placeholder={t("selectAgeRange")} />
            </SelectTrigger>
            <SelectContent>
              {ageRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          {t("continue")}
        </Button>
      </form>
    </div>
  );
};

export default BasicInfoStep;
