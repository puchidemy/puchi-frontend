"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/providers/AuthProvider";
import { verifyEmail, resendVerification } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMessage, setResentMessage] = useState("");

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, loading, router]);

  // If user is already verified, redirect away
  useEffect(() => {
    if (user?.email_verified) {
      router.push("/");
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setSending(true);

    const result = await verifyEmail(code);

    if (!result.ok) {
      setError(result.error || "Verification failed. Please try again.");
      setSending(false);
      return;
    }

    setSuccess(true);
    setSending(false);
  }

  async function handleResend() {
    setResending(true);
    setError("");
    setResentMessage("");

    const result = await resendVerification();

    if (!result.ok) {
      setError(result.error || "Failed to resend code. Please try again.");
      setResending(false);
      return;
    }

    setResentMessage("A new verification code has been sent to your email.");
    setResending(false);
  }

  if (loading) {
    return (
      <AuthCard title="Verify Email" description="Checking your session...">
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <div className="space-y-4">
        <AuthCard
          title="Email Verified"
          description="Your email has been successfully verified"
        >
          <Alert>
            <AlertDescription>
              Thank you! Your email address has been verified. You can now access
              all features of your account.
            </AlertDescription>
          </Alert>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AuthCard
        title="Verify Your Email"
        description={`Enter the 6-digit code sent to ${user?.email || "your email"}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              disabled={sending}
              className="text-center text-2xl tracking-[0.5em]"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={sending || code.length !== 6}
          >
            {sending ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-primary font-medium hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </AuthCard>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
