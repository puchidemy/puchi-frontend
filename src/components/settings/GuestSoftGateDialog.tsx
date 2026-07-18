"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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

interface GuestSoftGateDialogProps {
  open: boolean;
  /** Ignored for dismiss — dialog is blocking until navigation. */
  onOpenChange?: (open: boolean) => void;
}

/** Blocking sign-up / sign-in dialog when guest hits GUEST_SOFT_GATE. */
export function GuestSoftGateDialog({
  open,
  onOpenChange,
}: GuestSoftGateDialogProps) {
  const t = useTranslations("Learn.softGate");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) return;
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        data-testid="guest-soft-gate"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
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
