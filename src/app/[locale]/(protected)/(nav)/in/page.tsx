import { getProfile } from "@/actions/profile/get-profile";
import ProfilePageView from "@/components/profile/ProfilePageView";

export default async function MyProfilePage() {
  const result = await getProfile();

  if (!result.success) {
    return <div className="py-24 text-center text-muted-foreground">Failed to load profile</div>;
  }

  const profile = {
    user: {
      id: result.data.id,
      username: result.data.username,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email,
      imageUrl: result.data.avatarUrl,
      bio: result.data.bio,
      onboardingCompleted: true,
      createdAt: result.data.createdAt,
      updatedAt: result.data.updatedAt,
    },
    gamification: { level: 0, currentXP: 0, xpToNextLevel: 0, totalXP: 0, streak: 0, longestStreak: 0, streakFreezes: 0, crowns: 0, gems: 0 },
    stats: { totalLessons: 0, completedLessons: 0, totalMinutes: 0, accuracy: 0, wordsLearned: 0 },
    dailyActivity: [],
    weeklyXP: [],
    achievements: [],
    friends: [],
    followers: [],
    leaderboard: [],
  };

  return <ProfilePageView profile={profile} isLoading={false} isOwnProfile={true} />;
}
