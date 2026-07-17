import { OnboardingBypassGuard } from "@/components/auth/OnboardingBypassGuard";
import { AuthProvider } from "@/providers/AuthProvider";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  return (
    <AuthProvider baseUrl={AUTH_API_URL}>
      <OnboardingBypassGuard>{children}</OnboardingBypassGuard>
    </AuthProvider>
  );
}
