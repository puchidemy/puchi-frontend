"use client";

import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";

interface SoftGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** @deprecated Use GuestSoftGateDialog */
export function SoftGateDialog({ open, onOpenChange }: SoftGateDialogProps) {
  return <GuestSoftGateDialog open={open} onOpenChange={onOpenChange} />;
}
