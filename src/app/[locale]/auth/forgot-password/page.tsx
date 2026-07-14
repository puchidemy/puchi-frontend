import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      description="We'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
