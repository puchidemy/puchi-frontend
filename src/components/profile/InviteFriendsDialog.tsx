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
import { Copy, Facebook, Twitter } from "lucide-react";
import { toast } from "sonner";

const INVITE_LINK = "https://puchi.io.vn/invite/hoanv";

const InviteFriendsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslations("Profile");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(INVITE_LINK);
    toast.success(t("inviteFriends.linkCopied"));
  };

  const shareUrl = encodeURIComponent(INVITE_LINK);
  const shareText = encodeURIComponent(
    "I'm learning Vietnamese on Puchi! Join me for free and have fun! 🎉"
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
          {/* Copy link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground truncate font-mono border border-border">
              {INVITE_LINK}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl shrink-0"
              onClick={handleCopyLink}
            >
              <Copy size={16} />
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>{t("inviteFriends.orShareOn")}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2"
                onClick={() => {}}
              >
                <Facebook size={18} className="text-[#1877F2]" />
                Facebook
              </Button>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2"
              >
                <Twitter size={18} className="text-[#1DA1F2]" />
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
