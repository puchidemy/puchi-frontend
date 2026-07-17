"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

interface SoftGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SoftGateDialog({ open, onOpenChange }: SoftGateDialogProps) {
  const t = useTranslations("TrialLearn.softGate");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="trial-soft-gate">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <SocialLoginButtons />
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button variant="primary" className="w-full" asChild>
            <Link href="/auth/sign-up">{t("signUp")}</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/auth/sign-in">{t("signIn")}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
