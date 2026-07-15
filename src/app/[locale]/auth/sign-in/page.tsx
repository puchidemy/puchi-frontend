import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function SignInPage() {
  return (
    <div className="space-y-4">
      <AuthCard title="Sign In" description="Welcome back to Puchi">
        <SignInForm />
        <SocialLoginButtons />
      </AuthCard>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/sign-up" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
