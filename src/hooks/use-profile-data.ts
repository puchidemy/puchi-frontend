"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMyProfile,
  getPublicProfile,
  getStats,
  getDailyActivity,
  getWeeklyXp,
  getAchievements,
  getFollowing,
  getFollowers,
  getLeaderboard,
  uploadAndSetAvatar,
  type ProfileUser,
  type ProfileStatsResponse,
  type SocialUserItem,
  type LeaderboardItem,
} from "@/lib/profile-api";
import {
  FullProfile,
  Friend,
  LeaderboardEntry,
} from "@/types/profile";

const CACHE_TTL = 30_000;
const profileCache = new Map<string, { data: unknown; expiry: number }>();

function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = profileCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return Promise.resolve(cached.data as T);
  }
  return fetcher().then((data) => {
    profileCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
    return data;
  });
}

/** Clear profile caches after mutations (e.g. avatar upload). */
export function invalidateProfileCache(prefix?: string) {
  if (!prefix) {
    profileCache.clear();
    return;
  }
  for (const key of profileCache.keys()) {
    if (key.startsWith(prefix) || key === prefix) {
      profileCache.delete(key);
    }
  }
}

export function createEmptyFullProfile(): FullProfile {
  return {
    user: {
      id: "",
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      imageUrl: "",
      bio: "",
      onboardingCompleted: false,
      createdAt: "",
      updatedAt: "",
    },
    gamification: {
      level: 0,
      currentXP: 0,
      xpToNextLevel: 100,
      totalXP: 0,
      streak: 0,
      longestStreak: 0,
      streakFreezes: 0,
      crowns: 0,
      gems: 0,
    },
    stats: {
      totalLessons: 0,
      completedLessons: 0,
      totalMinutes: 0,
      accuracy: 0,
      wordsLearned: 0,
    },
    dailyActivity: [],
    weeklyXP: [],
    achievements: [],
    friends: [],
    followers: [],
    leaderboard: [],
  };
}

function userToProfileFields(user: ProfileUser): FullProfile["user"] {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.avatarUrl,
    bio: user.bio,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function applyStats(
  base: FullProfile,
  stats: ProfileStatsResponse,
): FullProfile {
  return {
    ...base,
    gamification: {
      level: stats.level,
      currentXP: stats.currentXp,
      xpToNextLevel: stats.xpToNextLevel || 100,
      totalXP: stats.totalXp,
      streak: stats.streak,
      longestStreak: stats.longestStreak,
      streakFreezes: stats.streakFreezes,
      crowns: stats.crowns,
      gems: stats.gems,
    },
    stats: {
      totalLessons: stats.totalLessons,
      completedLessons: stats.completedLessons,
      totalMinutes: stats.totalMinutes,
      accuracy: stats.accuracy,
      wordsLearned: stats.wordsLearned,
    },
  };
}

function toFriend(user: SocialUserItem): Friend {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.avatarUrl,
    level: user.level,
    streak: user.streak,
    isFollowing: user.isFollowing,
  };
}

function toLeaderboardEntry(entry: LeaderboardItem): LeaderboardEntry {
  return {
    rank: entry.rank,
    userId: entry.userId,
    username: entry.username,
    imageUrl: entry.avatarUrl,
    level: entry.level,
    weeklyXP: entry.weeklyXp,
    isCurrentUser: entry.isCurrentUser,
  };
}

function usernamesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Loads profile data from API (no mock as source of truth).
 * Pass route `username` — own vs public is detected by comparing with GET /v1/profile.
 */
export function useProfileData(username: string) {
  const [profile, setProfile] = useState<FullProfile>(createEmptyFullProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    invalidateProfileCache();
    setReloadToken((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        let me: ProfileUser | null = null;
        try {
          me = await cachedFetch("profile:me", () => getMyProfile());
        } catch {
          me = null;
        }

        if (cancelled) return;

        const own =
          !!me && !!username && usernamesMatch(me.username, username);
        setIsOwnProfile(own);

        if (own && me) {
          const [
            statsResult,
            dailyResult,
            weeklyResult,
            achievementsResult,
            followingResult,
            followersResult,
            leaderboardResult,
          ] = await Promise.allSettled([
            cachedFetch("profile:stats", () => getStats()),
            cachedFetch("profile:daily-activity", () => getDailyActivity()),
            cachedFetch("profile:weekly-xp", () => getWeeklyXp(12)),
            cachedFetch("profile:achievements", () => getAchievements()),
            cachedFetch("social:following", () => getFollowing()),
            cachedFetch("social:followers", () => getFollowers()),
            cachedFetch("social:leaderboard", () => getLeaderboard()),
          ]);

          if (cancelled) return;

          let next = createEmptyFullProfile();
          next = { ...next, user: userToProfileFields(me) };

          if (statsResult.status === "fulfilled") {
            next = applyStats(next, statsResult.value);
          }
          if (dailyResult.status === "fulfilled") {
            next = { ...next, dailyActivity: dailyResult.value };
          }
          if (weeklyResult.status === "fulfilled") {
            next = { ...next, weeklyXP: weeklyResult.value };
          }
          if (achievementsResult.status === "fulfilled") {
            next = { ...next, achievements: achievementsResult.value };
          }
          if (followingResult.status === "fulfilled") {
            next = {
              ...next,
              friends: followingResult.value.map(toFriend),
            };
          }
          if (followersResult.status === "fulfilled") {
            next = {
              ...next,
              followers: followersResult.value.map(toFriend),
            };
          }
          if (leaderboardResult.status === "fulfilled") {
            next = {
              ...next,
              leaderboard: leaderboardResult.value.map(toLeaderboardEntry),
            };
          }

          setProfile(next);
        } else {
          try {
            const publicUser = await cachedFetch(
              `profile:public:${username.toLowerCase()}`,
              () => getPublicProfile(username),
            );
            if (cancelled) return;

            const next = createEmptyFullProfile();
            next.user = userToProfileFields(publicUser);
            setProfile(next);
          } catch {
            if (cancelled) return;
            setNotFound(true);
            setProfile(createEmptyFullProfile());
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [username, reloadToken]);

  const handleAvatarUpload = useCallback(async (file: File) => {
    const updated = await uploadAndSetAvatar(file);
    invalidateProfileCache("profile:");
    setProfile((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...userToProfileFields(updated),
      },
    }));
    return updated;
  }, []);

  return {
    profile,
    setProfile,
    isLoading,
    isOwnProfile,
    notFound,
    error,
    reload,
    handleAvatarUpload,
  };
}
