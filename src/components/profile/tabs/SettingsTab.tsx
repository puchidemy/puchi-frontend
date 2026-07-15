"use client";

import { UserProfile } from "@/types/user";
import ProfileForm from "../ProfileForm";
import ProfileActions from "../ProfileActions";

interface SettingsTabProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export default function SettingsTab({ profile, onUpdate }: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <ProfileForm profile={profile} onUpdate={onUpdate} />
      <ProfileActions />
    </div>
  );
}
