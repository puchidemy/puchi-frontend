import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create Account"
      description="Start your Japanese learning journey"
    >
      <SignUpForm />
      <SocialLoginButtons />
    </AuthCard>
  );
}
