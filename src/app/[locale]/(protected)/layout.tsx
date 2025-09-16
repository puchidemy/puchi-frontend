import ClerkLocalizationProvider from "@/components/providers/ClerkLocalizationProvider";

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params;

  return (
    <ClerkLocalizationProvider locale={locale}>
      {children}
    </ClerkLocalizationProvider>
  );
}
