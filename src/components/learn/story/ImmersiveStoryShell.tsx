"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ImmersiveStoryShellProps = {
  /** Story-level progress 0–100. Ignored when `showProgress` is false. */
  progress?: number;
  /**
   * When false, hides the lesson-style progress bar (e.g. Learn Hub).
   * Defaults to true.
   */
  showProgress?: boolean;
  /** When true, leaving shows a light confirm dialog. */
  confirmExit?: boolean;
  /**
   * When true, confirm copy describes returning to the story learn menu
   * instead of leaving the whole story for the city map.
   */
  exitToHub?: boolean;
  onExit: () => void;
  children: React.ReactNode;
  /**
   * Optional fixed footer (transport / Continue), matching dictation's
   * bordered bottom action bar. When omitted, children may render their own.
   */
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Lesson-chrome frame aligned with `/lesson/dictation/[id]`:
 * constrained centered column, bordered header/footer, clean bg,
 * fixed chrome with only the middle region scrolling.
 */
export function ImmersiveStoryShell({
  progress = 0,
  showProgress = true,
  confirmExit = false,
  exitToHub = false,
  onExit,
  children,
  footer,
  className,
}: ImmersiveStoryShellProps) {
  const t = useTranslations("Learn.Story");
  const [exitOpen, setExitOpen] = useState(false);

  const handleExitClick = () => {
    if (confirmExit) {
      setExitOpen(true);
      return;
    }
    onExit();
  };

  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn(
        "flex h-dvh w-full flex-col overflow-hidden bg-background font-din",
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-(--breakpoint-lg) flex-col">
        <header
          className="z-20 flex shrink-0 items-center justify-between border-b border-border p-4 pt-[max(1rem,env(safe-area-inset-top))]"
          data-testid="immersive-story-chrome"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={t("exit")}
            onClick={handleExitClick}
          >
            <X className="h-5 w-5" />
          </Button>

          {showProgress ? (
            <>
              <div className="mx-4 min-w-0 flex-1">
                <Progress
                  value={clamped}
                  className="h-2"
                  aria-label={t("progressBar")}
                />
              </div>
              {/* Balance X so the bar stays optically centered (dictation uses lives here) */}
              <div className="h-11 w-11 shrink-0" aria-hidden />
            </>
          ) : null}
        </header>

        {/* Middle scrolls (or children manage scroll + inner footer). */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>

        {footer ? (
          <footer className="z-20 flex shrink-0 items-center border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </div>

      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {exitToHub ? t("exitModeConfirmTitle") : t("exitConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {exitToHub ? t("exitModeConfirmBody") : t("exitConfirmBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setExitOpen(false)}
            >
              {t("exitConfirmStay")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setExitOpen(false);
                onExit();
              }}
            >
              {exitToHub ? t("hub.backToMenu") : t("exitConfirmLeave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
