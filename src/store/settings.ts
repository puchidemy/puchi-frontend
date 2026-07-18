import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import {
  DEFAULT_SETTINGS,
  getSettings,
  patchSettings,
  settingsChangedFromDefaults,
  type UserSettings,
  type UserSettingsPatch,
} from "@/lib/settings-api";
import { useAuthStore } from "./auth";

const GUEST_STORAGE_KEY = "puchi-settings";
const AUTH_CACHE_PREFIX = "puchi-settings:";
const PATCH_DEBOUNCE_MS = 300;

interface SettingsState {
  values: UserSettings;
  /** Apply one field; guest persists locally, auth schedules debounced PATCH. */
  setField: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  /** Replace in-memory values from server (and optional auth cache). */
  hydrateFromServer: (settings: UserSettings, userId?: string) => void;
  /** Load guest snapshot from `puchi-settings` into memory. */
  loadGuest: () => void;
  /** Remove guest localStorage key (does not clear auth cache). */
  clearGuest: () => void;
  /** Guest snapshot differs from product defaults. */
  isDirtyGuest: () => boolean;
  /** GET /v1/profile/settings when authenticated; optional cache-first. */
  fetchFromServer: (userId: string) => Promise<void>;
  reset: () => void;
}

/** localStorage guest key only while logged out (mirror trial-learn). */
const guestOnlyStorage: StateStorage = {
  getItem: (name) => {
    if (useAuthStore.getState().accessToken) return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (useAuthStore.getState().accessToken) return;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

function authCacheKey(userId: string): string {
  return `${AUTH_CACHE_PREFIX}${userId}`;
}

function writeAuthCache(userId: string, values: UserSettings): void {
  try {
    localStorage.setItem(authCacheKey(userId), JSON.stringify(values));
  } catch {
    // ignore quota / private mode
  }
}

function readAuthCache(userId: string): UserSettings | null {
  try {
    const raw = localStorage.getItem(authCacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSettings;
    if (!parsed || typeof parsed !== "object") return null;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

/** Read persisted guest settings without auth-guard (used after login / sync dialog). */
export function readGuestSettings(): UserSettings | null {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { values?: UserSettings };
      values?: UserSettings;
    };
    const values = parsed.state?.values ?? parsed.values;
    if (!values || typeof values !== "object") return null;
    return { ...DEFAULT_SETTINGS, ...values };
  } catch {
    return null;
  }
}

export function clearGuestSettings(): void {
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

let patchTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: UserSettingsPatch = {};

function flushPendingPatch(): void {
  const body = pendingPatch;
  pendingPatch = {};
  patchTimer = null;
  if (Object.keys(body).length === 0) return;
  if (!useAuthStore.getState().accessToken) return;

  void patchSettings(body)
    .then((updated) => {
      const userId = useAuthStore.getState().user?.id;
      useSettingsStore.getState().hydrateFromServer(updated, userId);
    })
    .catch(() => {
      // Keep optimistic local values; next change / hydration can reconcile.
    });
}

function scheduleDebouncedPatch(partial: UserSettingsPatch): void {
  pendingPatch = { ...pendingPatch, ...partial };
  if (patchTimer) clearTimeout(patchTimer);
  patchTimer = setTimeout(flushPendingPatch, PATCH_DEBOUNCE_MS);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      values: { ...DEFAULT_SETTINGS },

      setField: (key, value) => {
        const next = { ...get().values, [key]: value };
        set({ values: next });

        const { accessToken, user } = useAuthStore.getState();
        if (accessToken) {
          if (user?.id) writeAuthCache(user.id, next);
          scheduleDebouncedPatch({ [key]: value } as UserSettingsPatch);
        }
      },

      hydrateFromServer: (settings, userId) => {
        const values = { ...DEFAULT_SETTINGS, ...settings };
        set({ values });
        const id = userId ?? useAuthStore.getState().user?.id;
        if (id) writeAuthCache(id, values);
      },

      loadGuest: () => {
        const guest = readGuestSettings();
        set({ values: guest ? { ...guest } : { ...DEFAULT_SETTINGS } });
      },

      clearGuest: () => {
        clearGuestSettings();
        if (!useAuthStore.getState().accessToken) {
          set({ values: { ...DEFAULT_SETTINGS } });
        }
      },

      isDirtyGuest: () => {
        const guest = readGuestSettings();
        if (!guest) return false;
        return settingsChangedFromDefaults(guest);
      },

      fetchFromServer: async (userId) => {
        const cached = readAuthCache(userId);
        if (cached) {
          set({ values: cached });
        }
        const settings = await getSettings();
        get().hydrateFromServer(settings, userId);
      },

      reset: () => set({ values: { ...DEFAULT_SETTINGS } }),
    }),
    {
      name: GUEST_STORAGE_KEY,
      storage: createJSONStorage(() => guestOnlyStorage),
      partialize: (state) => ({ values: state.values }),
    },
  ),
);

export {
  DEFAULT_SETTINGS,
  guestSettingsChangedKeys,
  settingsChangedFromDefaults,
  type SettingsTheme,
  type UserSettings,
} from "@/lib/settings-api";
