"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth";
import { restoreTokenFromStore } from "@/lib/token-manager";

function subscribe(onStoreChange: () => void) {
  const persistApi = useAuthStore.persist;
  if (!persistApi) return () => {};
  return persistApi.onFinishHydration(onStoreChange);
}

function getClientSnapshot() {
  return useAuthStore.persist?.hasHydrated() ?? true;
}

function getServerSnapshot() {
  return false;
}

/** Wait for zustand persist rehydration (SSR-safe). */
export function useAuthHydrated(): boolean {
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!hydrated) return;
    restoreTokenFromStore();
  }, [hydrated]);

  return hydrated;
}
