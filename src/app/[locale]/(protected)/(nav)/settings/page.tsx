import { redirect } from "@/i18n/routing";

/** Default settings entry → Profile. */
export default function SettingsIndexPage() {
  redirect("/settings/profile");
}
