"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/types/user";
import { Calendar, Mail, User } from "lucide-react";

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const t = useTranslations("ProfileHeader");

  const getInitials = (firstName: string, lastName: string) => {
    console.log(firstName, lastName);
    // return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `${firstName}${lastName}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar và tên */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.imageUrl} alt={profile.username} />
            <AvatarFallback className="text-lg">
              {getInitials(profile.firstName, profile.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("email")}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("username")}</p>
              <p className="text-sm text-muted-foreground">
                {profile.username}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("joinDate")}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Badge variant="secondary">{t("member")}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
