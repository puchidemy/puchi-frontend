"use client";

import { useEffect, useState } from "react";
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

export type BasicInfoData = {
  firstName: string;
  lastName: string;
  username: string;
  ageRange: string;
};

interface BasicInfoStepProps {
  prefilledFirstName?: string;
  prefilledLastName?: string;
  prefilledUsername?: string;
  /** Server/API error to show (e.g. username taken) */
  externalError?: string;
  onComplete: (data: BasicInfoData) => void;
}

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

const BasicInfoStep = ({
  prefilledFirstName = "",
  prefilledLastName = "",
  prefilledUsername = "",
  externalError = "",
  onComplete,
}: BasicInfoStepProps) => {
  const t = useTranslations("Welcome");
  const [firstName, setFirstName] = useState(prefilledFirstName);
  const [lastName, setLastName] = useState(prefilledLastName);
  const [username, setUsername] = useState(prefilledUsername);
  const [ageRange, setAgeRange] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefilledFirstName) setFirstName(prefilledFirstName);
  }, [prefilledFirstName]);

  useEffect(() => {
    if (prefilledLastName) setLastName(prefilledLastName);
  }, [prefilledLastName]);

  useEffect(() => {
    if (prefilledUsername) setUsername(prefilledUsername);
  }, [prefilledUsername]);

  useEffect(() => {
    if (externalError) setError(externalError);
  }, [externalError]);

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
    if (!username.trim()) {
      setError(t("usernameRequired"));
      return;
    }
    if (!ageRange) {
      setError(t("ageRequired"));
      return;
    }

    onComplete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      ageRange,
    });
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
          <Label htmlFor="username">{t("username")}</Label>
          <Input
            id="username"
            name="username"
            placeholder={t("usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
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
