"use client";

import { useState, useEffect } from "react";
import { getProfile } from "@/actions/profile/get-profile";
import { getAchievements } from "@/actions/profile/get-achievements";
import { getFollowing, getFollowers } from "@/actions/social/get-following";
import { getLeaderboard } from "@/actions/social/get-leaderboard";
import { mockFullProfile } from "@/data/mockProfile";
import { FullProfile, Friend, LeaderboardEntry } from "@/types/profile";
import type { SocialUser } from "@/actions/social/get-following";
import type { LeaderboardUser } from "@/actions/social/get-leaderboard";

// In-memory cache with TTL to avoid fetching all 5 endpoints on every mount
const profileCache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 30_000; // 30 seconds

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

function toFriend(user: SocialUser): Friend {
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

function toLeaderboardEntry(entry: LeaderboardUser): LeaderboardEntry {
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

export function useProfileData() {
  const [profile, setProfile] = useState<FullProfile>(mockFullProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const [profileResult, achievementsResult, followingResult, followersResult, leaderboardResult] =
        await Promise.allSettled([
          cachedFetch("profile", () => getProfile()),
          cachedFetch("achievements", () => getAchievements()),
          cachedFetch("following", () => getFollowing()),
          cachedFetch("followers", () => getFollowers()),
          cachedFetch("leaderboard", () => getLeaderboard()),
        ]);

      if (cancelled) return;

      setProfile((prev) => {
        let updated = { ...prev };

        if (profileResult.status === "fulfilled" && profileResult.value.success) {
          const data = profileResult.value.data;
          updated = {
            ...updated,
            user: {
              ...updated.user,
              id: data.id,
              username: data.username,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              imageUrl: data.avatarUrl,
              bio: data.bio,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            },
          };
        }

        if (achievementsResult.status === "fulfilled" && achievementsResult.value.success) {
          updated = {
            ...updated,
            achievements: achievementsResult.value.data,
          };
        }

        if (followingResult.status === "fulfilled" && followingResult.value.success) {
          updated = {
            ...updated,
            friends: followingResult.value.data.map(toFriend),
          };
        }

        if (followersResult.status === "fulfilled" && followersResult.value.success) {
          updated = {
            ...updated,
            followers: followersResult.value.data.map(toFriend),
          };
        }

        if (leaderboardResult.status === "fulfilled" && leaderboardResult.value.success) {
          updated = {
            ...updated,
            leaderboard: leaderboardResult.value.data.map(toLeaderboardEntry),
          };
        }

        return updated;
      });

      if (!cancelled) setIsLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, setProfile, isLoading };
}
