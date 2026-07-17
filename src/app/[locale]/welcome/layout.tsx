import { AuthProvider } from "@/providers/AuthProvider";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider baseUrl={AUTH_API_URL}>{children}</AuthProvider>;
}
