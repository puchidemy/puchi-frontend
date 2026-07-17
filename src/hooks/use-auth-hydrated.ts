"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { restoreTokenFromStore } from "@/lib/token-manager";

/** Wait for zustand persist rehydration (SSR-safe: persist may be undefined on server). */
export function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useAuthStore.persist;
    if (!persistApi) {
      restoreTokenFromStore();
      setHydrated(true);
      return;
    }

    const finish = () => {
      restoreTokenFromStore();
      setHydrated(true);
    };

    const unsub = persistApi.onFinishHydration(finish);
    if (persistApi.hasHydrated()) finish();
    return unsub;
  }, []);

  return hydrated;
}
