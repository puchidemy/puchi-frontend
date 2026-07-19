import { redirect } from "next/navigation";

type SettingsIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsIndexPage({
  params,
}: SettingsIndexPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/settings/profile`);
}
