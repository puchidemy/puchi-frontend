"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { register } from "@/lib/auth-client";
import { authClient } from "@/lib/limen-auth";
import { setToken, userFromLimen } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const result = await register(email, password);

    if (!result.ok) {
      if (result.error?.toLowerCase().includes("exists")) {
        setError("An account with this email already exists");
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
      setLoading(false);
      return;
    }

    // If signup created a session, go through post-auth gate → /welcome → basic info
    try {
      const session = await authClient.getSession();
      if (session?.user) {
        useAuthStore.getState().setUser(userFromLimen(session.user));
        const token =
          (session as { token?: string }).token ??
          authClient.bearer.getTokens()?.accessToken;
        if (token) setToken(token);
        router.replace("/auth/continue");
        return;
      }
    } catch {
      // fall through to verify message
    }

    setNeedsVerify(true);
    setLoading(false);
  }

  if (needsVerify) {
    return (
      <div className="space-y-4 text-center">
        <Alert>
          <AlertDescription>
            Account created! Check your email for a verification link, then{" "}
            <Link
              href="/auth/sign-in"
              className="text-primary font-medium hover:underline"
            >
              sign in
            </Link>{" "}
            to finish setting up your profile.
          </AlertDescription>
        </Alert>
      </div>
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
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Sign up"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
