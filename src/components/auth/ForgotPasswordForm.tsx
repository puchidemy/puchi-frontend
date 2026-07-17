"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPassword } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await forgotPassword(email);

    if (!result.ok) {
      setError(result.error || "Failed to send reset email.");
      setLoading(false);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Alert>
        <AlertDescription>
          If an account with that email exists, we&apos;ve sent a password
          reset link. Please check your inbox.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
