"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  StampButton,
  type StampButtonStatus,
} from "@/components/ui/stamp-button";

export interface SyncGuestDialogProps {
  open: boolean;
  lessonsMerged: number;
  /** Localized labels for settings that differ from defaults. */
  changedSettingLabels: string[];
  syncStatus?: StampButtonStatus;
  onSync: () => void;
  onSkip: () => void;
}

/** Blocking dialog to sync guest lessons/settings after sign-in. */
export function SyncGuestDialog({
  open,
  lessonsMerged,
  changedSettingLabels,
  syncStatus = "idle",
  onSync,
  onSkip,
}: SyncGuestDialogProps) {
  const t = useTranslations("Settings.syncGuest");
  const busy = syncStatus === "loading" || syncStatus === "success";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) return;
      }}
    >
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        data-testid="sync-guest-dialog"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-foreground">
          {lessonsMerged > 0 ? (
            <li>{t("lessons", { count: lessonsMerged })}</li>
          ) : null}
          {changedSettingLabels.length > 0 ? (
            <li>
              <span className="text-muted-foreground">{t("settingsChanged")}</span>
              <span className="mt-1 block font-medium">
                {changedSettingLabels.join(", ")}
              </span>
            </li>
          ) : null}
        </ul>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <StampButton
            variant="primary"
            className="w-full"
            status={syncStatus}
            idleLabel={t("sync")}
            loadingLabel={t("syncing")}
            successLabel={t("synced")}
            onClick={onSync}
            disabled={busy}
          />
          <Button
            variant="ghost"
            className="w-full"
            onClick={onSkip}
            disabled={busy}
          >
            {t("skip")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
