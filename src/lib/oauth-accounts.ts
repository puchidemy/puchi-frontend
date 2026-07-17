export type LinkedAccount = {
  provider: string;
  providerAccountId?: string;
  name?: string;
  email?: string;
  imageUrl?: string;
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
    const name =
      (row.name as string | undefined) ??
      (row.displayName as string | undefined) ??
      (row.display_name as string | undefined);
    const email = (row.email as string | undefined) ?? undefined;
    const imageUrl =
      (row.imageUrl as string | undefined) ??
      (row.image_url as string | undefined) ??
      (row.avatarUrl as string | undefined) ??
      (row.avatar_url as string | undefined) ??
      (row.picture as string | undefined);
    accounts.push({ provider, providerAccountId, name, email, imageUrl });
  }
  return accounts;
}

/** Facebook public picture by provider user id. */
export function facebookPictureUrl(providerAccountId: string): string {
  return `https://graph.facebook.com/${encodeURIComponent(providerAccountId)}/picture?type=square`;
}

type TokenGetter = (provider: string) => Promise<{ accessToken: string }>;

async function enrichGoogle(
  account: LinkedAccount,
  getTokens: TokenGetter,
): Promise<LinkedAccount> {
  try {
    const { accessToken } = await getTokens("google");
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return account;
    const info = (await res.json()) as {
      name?: string;
      email?: string;
      picture?: string;
    };
    return {
      ...account,
      name: info.name || account.name,
      email: info.email || account.email,
      imageUrl: info.picture || account.imageUrl,
    };
  } catch {
    return account;
  }
}

async function enrichFacebook(
  account: LinkedAccount,
  getTokens: TokenGetter,
): Promise<LinkedAccount> {
  const withPicture =
    account.providerAccountId && !account.imageUrl
      ? { ...account, imageUrl: facebookPictureUrl(account.providerAccountId) }
      : account;

  try {
    const { accessToken } = await getTokens("facebook");
    const res = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(square)&access_token=${encodeURIComponent(accessToken)}`,
    );
    if (!res.ok) return withPicture;
    const info = (await res.json()) as {
      name?: string;
      email?: string;
      picture?: { data?: { url?: string } };
    };
    return {
      ...withPicture,
      name: info.name || withPicture.name,
      email: info.email || withPicture.email,
      imageUrl: info.picture?.data?.url || withPicture.imageUrl,
    };
  } catch {
    return withPicture;
  }
}

/** Best-effort name/avatar from provider APIs (Limen accounts only store ids). */
export async function enrichLinkedAccounts(
  accounts: LinkedAccount[],
  getTokens: TokenGetter,
): Promise<LinkedAccount[]> {
  return Promise.all(
    accounts.map(async (account) => {
      if (account.provider === "google") {
        return enrichGoogle(account, getTokens);
      }
      if (account.provider === "facebook") {
        return enrichFacebook(account, getTokens);
      }
      return account;
    }),
  );
}

export function appOrigin(): string {
  return window.location.origin;
}

export function absoluteAppPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${appOrigin()}${normalized}`;
}
