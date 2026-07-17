const PENDING_OAUTH_PROVIDER_KEY = "pending_oauth_provider";

export type OAuthProviderId = "google" | "facebook" | "tiktok";

const PROVIDERS = new Set<string>(["google", "facebook", "tiktok"]);

export function isOAuthProviderId(value: string): value is OAuthProviderId {
  return PROVIDERS.has(value);
}

export function getPendingOAuthProvider(): OAuthProviderId | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(PENDING_OAUTH_PROVIDER_KEY);
  if (!value || !isOAuthProviderId(value)) return null;
  return value;
}

export function setPendingOAuthProvider(provider: OAuthProviderId): void {
  sessionStorage.setItem(PENDING_OAUTH_PROVIDER_KEY, provider);
}

export function clearPendingOAuthProvider(): void {
  sessionStorage.removeItem(PENDING_OAUTH_PROVIDER_KEY);
}

export function providerDisplayName(provider: string): string {
  switch (provider) {
    case "google":
      return "Google";
    case "facebook":
      return "Facebook";
    case "tiktok":
      return "TikTok";
    default:
      return provider;
  }
}
