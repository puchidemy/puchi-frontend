import { SupertokensProvider } from "@/providers/SupertokensProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupertokensProvider>
      <div className="flex min-h-screen items-center justify-center">
        {children}
      </div>
    </SupertokensProvider>
  );
}
