"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setToken, syncTokenToCookie } from "@/lib/token-manager";
import { Loader2 } from "lucide-react";

export default function SocialCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const provider = params.provider as string;

  // Derive error state directly from searchParams — avoid sync setState in effect
  const initialErrorMsg = searchParams.get("error");
  const [status, setStatus] = useState<"processing" | "error">(
    initialErrorMsg ? "error" : "processing"
  );
  const [error, setError] = useState(initialErrorMsg || "");

  useEffect(() => {
    // Already handled by initial state derivation
    if (initialErrorMsg) return;

    const accessToken = searchParams.get("access_token");

    if (!accessToken) {
      // Try to restore from cookie (in case backend already set it via Set-Cookie)
      fetch("/api/auth/restore-session")
        .then((r) => r.json())
        .then((data) => {
          if (data.access_token) {
            setToken(data.access_token);
            window.location.href = "/learn";
          } else {
            setStatus("error");
            setError("No authentication token received");
          }
        })
        .catch(() => {
          setStatus("error");
          setError("Failed to complete authentication");
        });
      return;
    }

    // Store access_token in-memory
    setToken(access_token);

    // Sync to SSR cookie
    syncTokenToCookie();

    // Include provider in redirect so WelcomeFlow can display the right greeting
    const p = new URLSearchParams({ provider });
    // Hard redirect to ensure SSR cookies are picked up by middleware
    window.location.href = `/welcome?${p.toString()}`;
  }, [searchParams, provider, initialErrorMsg]);

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
