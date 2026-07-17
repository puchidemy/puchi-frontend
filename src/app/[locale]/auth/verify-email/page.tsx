"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/providers/AuthProvider";

export default function VerifyEmailPage() {
  const { verifyEmail, resendVerification, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState("");

  useEffect(() => {
    if (!token || sending || success) return;
    let cancelled = false;
    (async () => {
      setSending(true);
      const result = await verifyEmail(token);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error || "Verification failed");
        setSending(false);
        return;
      }
      setSuccess(true);
      setSending(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail, sending, success]);

  async function handleResend() {
    setResending(true);
    setError("");
    setResentMessage("");
    const result = await resendVerification();
    if (!result.ok) {
      setError(result.error || "Failed to resend");
      setResending(false);
      return;
    }
    setResentMessage("A new verification email has been sent.");
    setResending(false);
  }

  if (loading || (token && sending && !error && !success)) {
    return (
      <AuthCard title="Verify Email" description="Verifying your email...">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <AuthCard title="Email Verified" description="Your email has been verified">
          <Alert>
            <AlertDescription>
              Thank you! Your email address has been verified.
            </AlertDescription>
          </Alert>
          <Button variant="primary" className="w-full" onClick={() => router.push("/learn")}>
            Continue
          </Button>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AuthCard
        title="Verify Your Email"
        description={
          token
            ? "We could not verify that link."
            : `Check your inbox${user?.email ? ` (${user.email})` : ""} for a verification link.`
        }
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {resentMessage && (
          <Alert>
            <AlertDescription>{resentMessage}</AlertDescription>
          </Alert>
        )}
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleResend}
          disabled={resending || !user}
        >
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
      </AuthCard>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
