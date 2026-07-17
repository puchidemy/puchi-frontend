import ProfileRouteClient from "@/components/profile/ProfileRouteClient";

interface Props {
  params: Promise<{ locale: string; username: string }>;
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfileRouteClient username={username} />;
}
