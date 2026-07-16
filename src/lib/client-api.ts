const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = path.startsWith("/api/") ? "" : API_BASE;
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
