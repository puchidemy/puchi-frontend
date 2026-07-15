import { FullProfile } from "@/types/profile";

function generateDailyActivity() {
  const data = [];
  const now = new Date("2026-07-14");
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const active = rand() > 0.35;
    data.push({
      date: d.toISOString().split("T")[0],
      lessonsCompleted: active ? Math.floor(rand() * 5) + 1 : 0,
      xpEarned: active ? Math.floor(rand() * 200) + 20 : 0,
      minutesSpent: active ? Math.floor(rand() * 30) + 5 : 0,
    });
  }
  return data;
}

function generateWeeklyXP() {
  const weeks = [
    "Apr 21-27", "Apr 28-May 4", "May 5-11", "May 12-18",
    "May 19-25", "May 26-Jun 1", "Jun 2-8", "Jun 9-15",
    "Jun 16-22", "Jun 23-29", "Jun 30-Jul 6", "Jul 7-13",
  ];
  return weeks.map((w, i) => ({
    weekLabel: w,
    xp: 300 + Math.floor(Math.sin(i * 0.8) * 200) + Math.floor(Math.random() * 300),
  }));
}

const achievementsDef = [
  { id: "a1", title: "First Steps", description: "Complete your first lesson", icon: "Footprints", color: "var(--unit-1)", progress: 100, progressLabel: "1/1", unlocked: true, unlockedAt: "2026-06-15" },
  { id: "a2", title: "3-Day Streak", description: "Maintain a 3-day streak", icon: "Flame", color: "var(--unit-4)", progress: 100, progressLabel: "3/3", unlocked: true, unlockedAt: "2026-06-20" },
  { id: "a3", title: "Perfect Lesson", description: "Get 100% on a lesson", icon: "Star", color: "var(--unit-3)", progress: 100, progressLabel: "1/1", unlocked: true, unlockedAt: "2026-06-22" },
  { id: "a4", title: "7-Day Streak", description: "Maintain a 7-day streak", icon: "Flame", color: "var(--unit-4)", progress: 100, progressLabel: "7/7", unlocked: true, unlockedAt: "2026-06-28" },
  { id: "a5", title: "Word Collector", description: "Learn 500 words", icon: "BookOpen", color: "var(--unit-6)", progress: 100, progressLabel: "500/500", unlocked: true, unlockedAt: "2026-07-05" },
  { id: "a6", title: "Night Owl", description: "Complete 10 lessons after 10 PM", icon: "Moon", color: "var(--unit-2)", progress: 100, progressLabel: "10/10", unlocked: true, unlockedAt: "2026-07-08" },
  { id: "a7", title: "Speed Demon", description: "Finish a lesson in under 2 min", icon: "Zap", color: "var(--unit-3)", progress: 100, progressLabel: "1/1", unlocked: true, unlockedAt: "2026-07-10" },
  { id: "a8", title: "Social Butterfly", description: "Follow 5 friends", icon: "Users", color: "var(--unit-5)", progress: 100, progressLabel: "5/5", unlocked: true, unlockedAt: "2026-07-12" },
  { id: "a9", title: "30-Day Streak", description: "Maintain a 30-day streak", icon: "Flame", color: "var(--unit-4)", progress: 23, progressLabel: "7/30", unlocked: false },
  { id: "a10", title: "Century", description: "Complete 100 lessons", icon: "Trophy", color: "var(--unit-3)", progress: 35, progressLabel: "35/100", unlocked: false },
  { id: "a11", title: "Polyglot", description: "Learn 2000 words", icon: "Languages", color: "var(--unit-6)", progress: 60, progressLabel: "1200/2000", unlocked: false },
  { id: "a12", title: "Marathon", description: "Study for 10 hours total", icon: "Timer", color: "var(--unit-5)", progress: 100, progressLabel: "12.5/10h", unlocked: true, unlockedAt: "2026-07-13" },
  { id: "a13", title: "Champion", description: "Reach #1 on weekly leaderboard", icon: "Crown", color: "var(--unit-3)", progress: 0, progressLabel: "Best: #2", unlocked: false },
  { id: "a14", title: "Scholar", description: "Complete all basic lessons", icon: "GraduationCap", color: "var(--unit-1)", progress: 70, progressLabel: "35/50", unlocked: false },
  { id: "a15", title: "Early Bird", description: "Complete 10 lessons before 7 AM", icon: "Sunrise", color: "var(--unit-8)", progress: 40, progressLabel: "4/10", unlocked: false },
];

const friendsList = [
  { id: "u2", username: "minhnguyen", firstName: "Minh", lastName: "Nguyen", imageUrl: "", level: 15, streak: 30, isFollowing: true },
  { id: "u3", username: "thutran", firstName: "Thu", lastName: "Tran", imageUrl: "", level: 12, streak: 15, isFollowing: true },
  { id: "u4", username: "anpham", firstName: "An", lastName: "Pham", imageUrl: "", level: 10, streak: 8, isFollowing: false },
  { id: "u5", username: "linhvo", firstName: "Linh", lastName: "Vo", imageUrl: "", level: 9, streak: 5, isFollowing: true },
  { id: "u6", username: "quangdo", firstName: "Quang", lastName: "Do", imageUrl: "", level: 7, streak: 3, isFollowing: false },
  { id: "u7", username: "huongle", firstName: "Huong", lastName: "Le", imageUrl: "", level: 14, streak: 45, isFollowing: true },
  { id: "u8", username: "tuanbui", firstName: "Tuan", lastName: "Bui", imageUrl: "", level: 11, streak: 12, isFollowing: false },
];

const leaderboard = [
  { rank: 1, userId: "u7", username: "huongle", imageUrl: "", level: 14, weeklyXP: 2400, isCurrentUser: false },
  { rank: 2, userId: "u2", username: "minhnguyen", imageUrl: "", level: 15, weeklyXP: 2100, isCurrentUser: false },
  { rank: 3, userId: "u3", username: "thutran", imageUrl: "", level: 12, weeklyXP: 1800, isCurrentUser: false },
  { rank: 4, userId: "u8", username: "tuanbui", imageUrl: "", level: 11, weeklyXP: 1550, isCurrentUser: false },
  { rank: 5, userId: "u4", username: "anpham", imageUrl: "", level: 10, weeklyXP: 1400, isCurrentUser: false },
  { rank: 6, userId: "u5", username: "linhvo", imageUrl: "", level: 9, weeklyXP: 1200, isCurrentUser: false },
  { rank: 7, userId: "u1", username: "puchiuser", imageUrl: "", level: 8, weeklyXP: 950, isCurrentUser: true },
  { rank: 8, userId: "u6", username: "quangdo", imageUrl: "", level: 7, weeklyXP: 800, isCurrentUser: false },
  ...Array.from({ length: 12 }, (_, i) => ({
    rank: i + 9,
    userId: `u${i + 9}`,
    username: `learner${i + 9}`,
    imageUrl: "",
    level: Math.max(1, 8 - i),
    weeklyXP: 700 - i * 50,
    isCurrentUser: false,
  })),
];

export const mockFullProfile: FullProfile = {
  user: {
    id: "u1",
    username: "puchiuser",
    firstName: "Puchi",
    lastName: "Learner",
    email: "puchi@example.com",
    imageUrl: "",
    createdAt: "2026-06-15T08:00:00Z",
    updatedAt: "2026-07-14T12:00:00Z",
  },
  gamification: {
    level: 8,
    currentXP: 2450,
    xpToNextLevel: 3000,
    totalXP: 12500,
    streak: 7,
    longestStreak: 15,
    streakFreezes: 2,
    crowns: 24,
    gems: 320,
  },
  stats: {
    totalLessons: 50,
    completedLessons: 35,
    totalMinutes: 750,
    accuracy: 85,
    wordsLearned: 1200,
  },
  dailyActivity: generateDailyActivity(),
  weeklyXP: generateWeeklyXP(),
  achievements: achievementsDef.map((a) => ({ ...a })),
  friends: friendsList,
  followers: friendsList.slice(0, 5),
  leaderboard,
};
