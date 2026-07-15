"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTransition } from "react";
import type { ActionResult } from "@/types/api";

interface UseActionOptions<O> {
  onSuccess?: (data: O) => void;
  successMessage?: string;
}

export function useAction<I = void, O = void>(
  action: (input: I) => Promise<ActionResult<O>>,
  options: UseActionOptions<O> = {},
) {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const execute = (input: I) => {
    startTransition(async () => {
      const result = await action(input);
      if (result.success) {
        if (options.successMessage) toast.success(t(options.successMessage));
        options.onSuccess?.(result.data);
      } else {
        const msg = t.has(result.error)
          ? t(result.error)
          : t("errors.server.internalError");
        toast.error(msg);
      }
    });
  };

  return { execute, isPending };
}
