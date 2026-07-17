"use client";

import { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getPendingOAuthProvider,
  isOAuthProviderId,
  providerDisplayName,
  setPendingOAuthProvider,
  type OAuthProviderId,
} from "@/lib/pending-oauth";

function LinkConflictContent() {
  const searchParams = useSearchParams();

  const provider = useMemo((): OAuthProviderId | null => {
    const fromQuery = searchParams.get("provider");
    if (fromQuery && isOAuthProviderId(fromQuery)) return fromQuery;
    return getPendingOAuthProvider();
  }, [searchParams]);

  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (provider) setPendingOAuthProvider(provider);
  }, [provider]);

  const name = provider ? providerDisplayName(provider) : "that social account";

  return (
    <div className="space-y-4">
      <AuthCard
        title="Account already exists"
        description={`An account with this email already exists. Sign in with your existing method, then we will link ${name}.`}
      >
        {errorParam && (
          <Alert variant="destructive">
            <AlertDescription>{errorParam}</AlertDescription>
          </Alert>
        )}
        {!provider && (
          <Alert>
            <AlertDescription>
              Missing provider information. Start social sign-in again from the
              sign-in page.
            </AlertDescription>
          </Alert>
        )}
        <SignInForm />
      </AuthCard>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function LinkConflictPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-muted-foreground text-sm">Loading...</div>
      }
    >
      <LinkConflictContent />
    </Suspense>
  );
}
