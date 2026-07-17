"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setToken, syncTokenToCookie, setBaseUrl } from "@/lib/token-manager";
import { Loader2 } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SocialCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;

  const errorParam = searchParams.get("error");
  const [status, setStatus] = useState<"processing" | "error" | "success">(
    errorParam ? "error" : "processing"
  );
  const [error, setError] = useState(errorParam || "");

  useEffect(() => {
    if (errorParam) return;
    if (status !== "processing") return;

    let cancelled = false;

    async function obtainToken() {
      try {
        // The auth-service callback already set refresh_token cookie.
        // Use it to get an access_token via /auth/refresh.
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (cancelled) return;

        if (!res.ok) {
          setStatus("error");
          setError("Failed to complete authentication. Please try again.");
          return;
        }

        const data = await res.json();
        const accessToken = data.access_token;

        if (!accessToken) {
          setStatus("error");
          setError("No authentication token received.");
          return;
        }

        // Store in-memory and sync to SSR cookie
        setBaseUrl(API_URL);
        setToken(accessToken);
        await syncTokenToCookie();

        // Fallback: also set session_active directly in case server Set-Cookie
        // hasn't been committed to the cookie jar before navigation.
        document.cookie =
          "session_active=1; path=/; max-age=900; SameSite=Lax; " +
          (location.protocol === "https:" ? "secure;" : "");

        // Small guard to let cookie jar settle before hard navigation
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (cancelled) return;

        setStatus("success");
        window.location.href = `/welcome?provider=${provider}`;
      } catch {
        if (!cancelled) {
          setStatus("error");
          setError("Network error. Please try again.");
        }
      }
    }

    obtainToken();

    return () => {
      cancelled = true;
    };
  }, [searchParams, provider, errorParam, status]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Link
            href="/auth/sign-in"
            className="text-primary hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
