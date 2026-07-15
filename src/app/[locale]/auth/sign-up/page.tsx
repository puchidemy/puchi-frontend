import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function SignUpPage() {
  return (
    <div className="space-y-4">
      <AuthCard
        title="Create Account"
        description="Start your Vietnamese learning journey"
      >
        <SignUpForm />
        <SocialLoginButtons />
      </AuthCard>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
