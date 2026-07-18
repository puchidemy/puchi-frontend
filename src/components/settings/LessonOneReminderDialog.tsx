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

interface LessonOneReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Dismissible reminder after a guest completes their first lesson. */
export function LessonOneReminderDialog({
  open,
  onOpenChange,
}: LessonOneReminderDialogProps) {
  const t = useTranslations("Learn.lessonOneReminder");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-testid="lesson-one-reminder"
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button variant="primary" className="w-full" asChild>
            <Link href="/auth/sign-up">{t("signUp")}</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            {t("continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
