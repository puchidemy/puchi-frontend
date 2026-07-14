import { SupertokensProvider } from "@/providers/SupertokensProvider";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  return <SupertokensProvider>{children}</SupertokensProvider>;
}
