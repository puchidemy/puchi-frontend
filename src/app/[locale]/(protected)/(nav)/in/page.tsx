import { redirect } from "next/navigation";
import { getProfile } from "@/actions/profile/get-profile";

export default async function MyProfilePage() {
  const result = await getProfile();

  if (!result.success) {
    redirect("/auth/sign-in");
  }

  redirect(`/in/${result.data.username}`);
}
