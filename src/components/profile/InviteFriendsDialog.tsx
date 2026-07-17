"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

const INVITE_LINK = "https://puchi.io.vn/invite/hoanv";

const InviteFriendsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations("Profile");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors — button stays idle
    }
  };

  const shareUrl = encodeURIComponent(INVITE_LINK);
  const shareText = encodeURIComponent(
    "I'm learning Vietnamese on Puchi! Join me for free and have fun!",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-center">
            {t("inviteFriends.title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {t("inviteFriends.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground truncate font-mono border border-border">
              {INVITE_LINK}
            </div>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-xl shrink-0 ${
                copied
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : ""
              }`}
              onClick={handleCopyLink}
              aria-label={t("inviteFriends.linkCopied")}
            >
              {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
            </Button>
          </div>
          {copied && (
            <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
              {t("inviteFriends.linkCopied")}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>{t("inviteFriends.orShareOn")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full rounded-xl gap-2">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full rounded-xl gap-2">
                <svg viewBox="0 0 24 24" width={18} height={18} fill="#1DA1F2">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsDialog;
