import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function SignInPage() {
  return (
    <AuthCard title="Sign In" description="Welcome back to Puchi">
      <SocialLoginButtons />
      <SignInForm />
    </AuthCard>
  );
}
