type LinkedAccount = {
  provider: string;
  providerAccountId?: string;
};

/** Normalize Limen `social.listAccounts()` payload (array or wrapped). */
export function normalizeLinkedAccounts(raw: unknown): LinkedAccount[] {
  const list = Array.isArray(raw)
    ? raw
    : raw &&
        typeof raw === "object" &&
        Array.isArray((raw as { accounts?: unknown }).accounts)
      ? (raw as { accounts: unknown[] }).accounts
      : [];

  const accounts: LinkedAccount[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const provider = String(row.provider ?? "").toLowerCase();
    if (!provider) continue;
    const providerAccountId =
      (row.providerAccountId as string | undefined) ??
      (row.provider_account_id as string | undefined);
    accounts.push({ provider, providerAccountId });
  }
  return accounts;
}

export function appOrigin(): string {
  return window.location.origin;
}

export function absoluteAppPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appOrigin()}${normalized}`;
}
