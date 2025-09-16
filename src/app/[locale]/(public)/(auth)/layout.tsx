import ClerkLocalizationProvider from "@/components/providers/ClerkLocalizationProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: Props) {
  const { locale } = await params;
  return (
    <ClerkLocalizationProvider locale={locale}>
      <div className="mx-auto my-10">{children}</div>
    </ClerkLocalizationProvider>
  );
}
