"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile } from "@/services/user.service";
import { UserProfile } from "@/types/user";
import { useAuthToken } from "@/hooks/useAuthToken";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileForm from "@/components/profile/ProfileForm";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileActions from "@/components/profile/ProfileActions";
import { toast } from "sonner";

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuthToken();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(getAuthHeaders);
        setProfile(userProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Không thể tải thông tin profile");
        toast.error("Có lỗi xảy ra khi tải thông tin profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [getAuthHeaders]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          {/* Right column */}
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error || "Không tìm thấy thông tin profile"}
          </h1>
          <p className="text-muted-foreground">
            Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <ProfileHeader profile={profile} />

          {/* Profile Form */}
          <ProfileForm profile={profile} onUpdate={handleProfileUpdate} />

          {/* Profile Stats */}
          <ProfileStats />
        </div>

        {/* Right column - Actions */}
        <div className="space-y-8">
          <ProfileActions />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
