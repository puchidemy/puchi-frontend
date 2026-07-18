/** Minimal privacy keys stored in `UserSettings.privacyJson`. */
export interface PrivacyPrefs {
  profilePublic: boolean;
  findableByUsername: boolean;
  shareActivity: boolean;
}

export const DEFAULT_PRIVACY: PrivacyPrefs = {
  profilePublic: false,
  findableByUsername: true,
  shareActivity: true,
};

export function parsePrivacyJson(raw: string): PrivacyPrefs {
  try {
    const parsed = JSON.parse(raw || "{}") as Partial<PrivacyPrefs>;
    return {
      profilePublic:
        typeof parsed.profilePublic === "boolean"
          ? parsed.profilePublic
          : DEFAULT_PRIVACY.profilePublic,
      findableByUsername:
        typeof parsed.findableByUsername === "boolean"
          ? parsed.findableByUsername
          : DEFAULT_PRIVACY.findableByUsername,
      shareActivity:
        typeof parsed.shareActivity === "boolean"
          ? parsed.shareActivity
          : DEFAULT_PRIVACY.shareActivity,
    };
  } catch {
    return { ...DEFAULT_PRIVACY };
  }
}

export function serializePrivacyPrefs(prefs: PrivacyPrefs): string {
  return JSON.stringify(prefs);
}
