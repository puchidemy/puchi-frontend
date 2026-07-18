import { redirect } from "next/navigation";

type SettingsIndexPageProps = {
  params: Promise<{ locale: string }>;
};

/** Default settings entry → Preferences (guest-friendly; Profile has auth CTA). */
export default async function SettingsIndexPage({
  params,
}: SettingsIndexPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/settings/preferences`);
}
