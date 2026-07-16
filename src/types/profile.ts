export interface ProfileGamification {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  crowns: number;
  gems: number;
}

export interface ProfileStats {
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  accuracy: number;
  wordsLearned: number;
}

export interface DailyActivity {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
  minutesSpent: number;
}

export interface WeeklyXP {
  weekLabel: string;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  progressLabel: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  level: number;
  streak: number;
  isFollowing: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  imageUrl: string;
  level: number;
  weeklyXP: number;
  isCurrentUser: boolean;
}

export interface FullProfile {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    bio?: string;
    onboardingCompleted?: boolean;
    createdAt: string;
    updatedAt: string;
  };
  gamification: ProfileGamification;
  stats: ProfileStats;
  dailyActivity: DailyActivity[];
  weeklyXP: WeeklyXP[];
  achievements: Achievement[];
  friends: Friend[];
  followers: Friend[];
  leaderboard: LeaderboardEntry[];
}
