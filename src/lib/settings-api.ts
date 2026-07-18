"client-only";

import { fetchWithAuth } from "./fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type SettingsTheme = "system" | "light" | "dark";

/** FE/domain shape (camelCase). Wire JSON may be snake_case or camelCase. */
export interface UserSettings {
  soundEffects: boolean;
  animations: boolean;
  motivationalMessages: boolean;
  listeningExercises: boolean;
  theme: SettingsTheme;
  locale: string;
  privacyJson: string;
}

export type UserSettingsPatch = {
  [K in keyof UserSettings]?: UserSettings[K];
};

export interface MergeSettingsResponse {
  settings: UserSettings;
  fieldsMerged: string[];
}

/** Product defaults — must match core `productDefaults()` / DB defaults. */
export const DEFAULT_SETTINGS: UserSettings = {
  soundEffects: true,
  animations: true,
  motivationalMessages: true,
  listeningExercises: true,
  theme: "system",
  locale: "en",
  privacyJson: "{}",
};

type RawRecord = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function pick(raw: RawRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

function normalizeTheme(value: unknown): SettingsTheme {
  const t = str(value, "system");
  if (t === "light" || t === "dark" || t === "system") return t;
  return "system";
}

export function normalizeUserSettings(raw: unknown): UserSettings {
  const r = (raw ?? {}) as RawRecord;
  return {
    soundEffects: bool(
      pick(r, "soundEffects", "sound_effects"),
      DEFAULT_SETTINGS.soundEffects,
    ),
    animations: bool(
      pick(r, "animations"),
      DEFAULT_SETTINGS.animations,
    ),
    motivationalMessages: bool(
      pick(r, "motivationalMessages", "motivational_messages"),
      DEFAULT_SETTINGS.motivationalMessages,
    ),
    listeningExercises: bool(
      pick(r, "listeningExercises", "listening_exercises"),
      DEFAULT_SETTINGS.listeningExercises,
    ),
    theme: normalizeTheme(pick(r, "theme")),
    locale: str(pick(r, "locale"), DEFAULT_SETTINGS.locale) || DEFAULT_SETTINGS.locale,
    privacyJson:
      str(pick(r, "privacyJson", "privacy_json"), DEFAULT_SETTINGS.privacyJson) ||
      DEFAULT_SETTINGS.privacyJson,
  };
}

/** Serialize for proto/HTTP (snake_case; protojson accepts proto names). */
export function settingsToWire(settings: UserSettings): Record<string, unknown> {
  return {
    sound_effects: settings.soundEffects,
    animations: settings.animations,
    motivational_messages: settings.motivationalMessages,
    listening_exercises: settings.listeningExercises,
    theme: settings.theme,
    locale: settings.locale,
    privacy_json: settings.privacyJson,
  };
}

export function patchToWire(patch: UserSettingsPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (patch.soundEffects !== undefined) body.sound_effects = patch.soundEffects;
  if (patch.animations !== undefined) body.animations = patch.animations;
  if (patch.motivationalMessages !== undefined) {
    body.motivational_messages = patch.motivationalMessages;
  }
  if (patch.listeningExercises !== undefined) {
    body.listening_exercises = patch.listeningExercises;
  }
  if (patch.theme !== undefined) body.theme = patch.theme;
  if (patch.locale !== undefined) body.locale = patch.locale;
  if (patch.privacyJson !== undefined) body.privacy_json = patch.privacyJson;
  return body;
}

function normalizeMergeResponse(raw: unknown): MergeSettingsResponse {
  const r = (raw ?? {}) as RawRecord;
  const fields = pick(r, "fieldsMerged", "fields_merged");
  return {
    settings: normalizeUserSettings(pick(r, "settings") ?? r),
    fieldsMerged: Array.isArray(fields)
      ? fields.filter((f): f is string => typeof f === "string")
      : [],
  };
}

async function settingsRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithAuth<T>(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/** GET /v1/profile/settings */
export async function getSettings(): Promise<UserSettings> {
  const raw = await settingsRequest<unknown>("/v1/profile/settings");
  return normalizeUserSettings(raw);
}

/** PATCH /v1/profile/settings — partial optional fields. */
export async function patchSettings(
  partial: UserSettingsPatch,
): Promise<UserSettings> {
  const raw = await settingsRequest<unknown>("/v1/profile/settings", {
    method: "PATCH",
    body: JSON.stringify(patchToWire(partial)),
  });
  return normalizeUserSettings(raw);
}

/**
 * POST /v1/profile/settings/merge
 * Body: `{ guest: UserSettings }` full snapshot (bool false is meaningful).
 */
export async function mergeSettings(
  guest: UserSettings,
): Promise<MergeSettingsResponse> {
  const raw = await settingsRequest<unknown>("/v1/profile/settings/merge", {
    method: "POST",
    body: JSON.stringify({ guest: settingsToWire(guest) }),
  });
  return normalizeMergeResponse(raw);
}

/** True when any field differs from product defaults. */
export function settingsChangedFromDefaults(values: UserSettings): boolean {
  return (
    values.soundEffects !== DEFAULT_SETTINGS.soundEffects ||
    values.animations !== DEFAULT_SETTINGS.animations ||
    values.motivationalMessages !== DEFAULT_SETTINGS.motivationalMessages ||
    values.listeningExercises !== DEFAULT_SETTINGS.listeningExercises ||
    values.theme !== DEFAULT_SETTINGS.theme ||
    values.locale !== DEFAULT_SETTINGS.locale ||
    values.privacyJson !== DEFAULT_SETTINGS.privacyJson
  );
}
