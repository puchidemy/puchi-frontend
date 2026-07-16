"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { mockFullProfile } from "@/data/mockProfile";
import { Search, UserPlus, UserCheck, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function UserSearchPage() {
  const t = useTranslations("Profile");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("s") || "";
  const [query, setQuery] = useState(initialQuery);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  // Mock users to search from
  const allUsers = useMemo(() => {
    const { friends, followers } = mockFullProfile;
    const seen = new Set<string>();
    return [...friends, ...followers, ...mockFullProfile.leaderboard]
      .filter((u) => {
        if (seen.has(u.userId || u.id)) return false;
        seen.add(u.userId || u.id);
        return true;
      })
      .map((u) => ({
        id: u.userId || u.id,
        username: u.username,
        firstName: u.firstName || u.username,
        lastName: (u as any).lastName || "",
        level: u.level,
        imageUrl: u.imageUrl || "",
        isFollowing: (u as any).isFollowing ?? false,
      }));
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)
    );
  }, [query, allUsers]);

  const toggleFollow = (id: string) => {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // results already update via useMemo
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link
          href="/in"
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-display font-bold">
          {t("inviteFriends.findFriends")}
        </h1>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("inviteFriends.addFriendsPlaceholder")}
            className="w-full rounded-2xl h-12 pl-11 text-base border-2"
          />
        </div>
      </form>

      {/* Results */}
      <div className="space-y-1">
        {query && results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {!query && (
          <div className="text-center py-12 text-muted-foreground">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">Search for friends</p>
            <p className="text-sm">
              Find other learners by username or name
            </p>
          </div>
        )}

        {results.map((user) => {
          const isFollowing = following.has(user.id) || user.isFollowing;
          return (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="text-sm">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{user.username} · Lv.{user.level}
                </p>
              </div>
              <Button
                size="sm"
                variant={isFollowing ? "outline" : "default"}
                className="rounded-full h-8 text-xs gap-1.5 shrink-0"
                onClick={() => toggleFollow(user.id)}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={14} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Follow
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
