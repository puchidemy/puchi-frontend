import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";

export const metadata = {
  title: "Đăng ký",
  description: "Đăng ký",
};

const SignUpPage = () => {
  return (
    <AuthCard title="Create an Account" description="Start your learning journey">
      <SocialLoginButtons />
      <SignUpForm />
    </AuthCard>
  );
};

export default SignUpPage;
