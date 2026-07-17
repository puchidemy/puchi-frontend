"use client";

import { useProfileData } from "@/hooks/use-profile-data";
import ProfilePageView from "@/components/profile/ProfilePageView";

interface ProfileRouteClientProps {
  username: string;
}

export default function ProfileRouteClient({
  username,
}: ProfileRouteClientProps) {
  const {
    profile,
    isLoading,
    isOwnProfile,
    notFound,
    error,
    handleAvatarUpload,
  } = useProfileData(username);

  if (!isLoading && notFound) {
    return (
      <div className="py-24 text-center text-muted-foreground">
        User not found
      </div>
    );
  }

  if (!isLoading && error && !profile.user.id) {
    return (
      <div className="py-24 text-center text-muted-foreground">{error}</div>
    );
  }

  return (
    <ProfilePageView
      profile={profile}
      isLoading={isLoading}
      isOwnProfile={isOwnProfile}
      onAvatarChange={
        isOwnProfile
          ? async (file) => {
              await handleAvatarUpload(file);
            }
          : undefined
      }
    />
  );
}
