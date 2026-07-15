import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FooterLink from "@/components/FooterLink";
import { Link } from "@/i18n/routing";
import { mockFullProfile } from "@/data/mockProfile";
import {
  UserPlus,
  Search,
  Share2,
  Users,
  UserCheck,
  Settings,
  Copy,
  ExternalLink,
} from "lucide-react";

const ProfileRightBar = () => {
  const { friends, followers } = mockFullProfile;

  return (
    <div className="w-full h-full space-y-6 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide">
      {/* Social Stats */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <UserCheck size={18} className="text-[var(--unit-1)]" />
              </div>
              <p className="text-2xl font-din font-bold tabular-nums">{friends.length}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users size={18} className="text-[var(--unit-5)]" />
              </div>
              <p className="text-2xl font-din font-bold tabular-nums">{followers.length}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Friends */}
      <Card>
        <CardHeader className="text-lg font-bold flex flex-row items-center gap-2">
          <UserPlus size={20} className="text-[var(--unit-1)]" />
          Add friends
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search username..."
              className="flex-1 rounded-xl"
            />
            <Button variant="primary" size="sm" className="rounded-xl shrink-0">
              <Search size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Find your friends by username or email
          </p>
        </CardContent>
      </Card>

      {/* Find Friends */}
      <Card>
        <CardHeader className="text-lg font-bold flex flex-row items-center gap-2">
          <Search size={20} className="text-[var(--unit-3)]" />
          Find friends
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Connect with your contacts and see who&apos;s already learning on Puchi
          </p>
          <Link href="/friends/discover">
            <Button variant="secondary" className="w-full rounded-xl gap-2">
              <ExternalLink size={16} />
              Discover friends
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Invite Friends */}
      <Card>
        <CardHeader className="text-lg font-bold flex flex-row items-center gap-2">
          <Share2 size={20} className="text-[var(--unit-4)]" />
          Invite friends
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Share your invite link and earn XP when friends join
          </p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground truncate font-mono">
              puchi.io.vn/invite/hoanv
            </div>
            <Button variant="outline" size="icon" className="rounded-xl shrink-0">
              <Copy size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-0">
          <Link
            href="/settings"
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--muted)_50%,transparent)]">
              <Settings size={18} className="text-muted-foreground" />
            </div>
            <span className="text-sm font-medium">Account settings</span>
          </Link>
        </CardContent>
      </Card>

      <FooterLink />
    </div>
  );
};

export default ProfileRightBar;
