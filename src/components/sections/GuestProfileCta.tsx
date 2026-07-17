"use client";

import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { getToken } from "@/lib/token-manager";

/** Shown only for guests — uses client auth store (Limen), not session_active cookie. */
export function GuestProfileCta() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const loading = useAuthStore((s) => s.loading);

  if (loading || user || accessToken || getToken()) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="text-xl font-bold">
        Create a profile to save your progress!
      </CardHeader>
      <CardContent className="w-full flex flex-col gap-4">
        <Link href="/auth/sign-up">
          <Button variant="primary" className="w-full text-gray-200">
            CREATE A PROFILE
          </Button>
        </Link>
        <Link href="/auth/sign-in">
          <Button variant="secondary" className="w-full text-gray-200">
            SIGN IN
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
