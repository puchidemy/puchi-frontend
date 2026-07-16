import { AuthProvider } from "@/providers/AuthProvider";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
