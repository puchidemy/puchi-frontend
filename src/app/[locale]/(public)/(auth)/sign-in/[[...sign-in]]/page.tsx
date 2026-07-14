import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export const metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập",
};

const SignInPage = () => {
  return (
    <AuthCard title="Sign In" description="Welcome back">
      <SocialLoginButtons />
      <SignInForm />
    </AuthCard>
  );
};

export default SignInPage;
