import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  Compass,
  Flag,
  GamepadIcon,
  LogIn,
  MoreHorizontal,
  Shield,
  Star,
  UserMinus,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../hooks/useAccountSettings";
import { getSocialLinks } from "../utils/socialStorage";

// ─── Types ─────────────────────────────────────────────────────────────────

interface GroupMember {
  username: string;
  role: string;
  rank: number;
  status: string;
}

interface Group {
  id: string;
  name: string;
  thumbnailDataUrl: string | null;
  ownedBy: string;
  members: GroupMember[];
  [key: string]: unknown;
}

interface PublishedGame {
  id: string;
  title: string;
  thumbnails: string[];
  publishedBy: string;
}

interface PlayerBadge {
  id: string;
  name: string;
  icon: string;
  type: "official" | "player";
  description: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getStoredUsers(): Record<
  string,
  { displayName: string; passwordHash: string }
> {
  try {
    const raw = localStorage.getItem("diniverse_users");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStoredGroups(): Group[] {
  try {
    const raw = localStorage.getItem("diniverse_groups");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getLocalList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function saveLocalList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

function getBanner(username: string): string | null {
  return localStorage.getItem(`diniverse_banner_${username}`);
}

function getBio(username: string): string {
  return localStorage.getItem(`diniverse_bio_${username}`) ?? "";
}

// ─── Social Platforms ──────────────────────────────────────────────────────

const SOCIAL_PLATFORMS: Record<string, { label: string; color: string }> = {
  youtube: { label: "YouTube", color: "#FF0000" },
  tiktok: { label: "TikTok", color: "#000000" },
  discord: { label: "Discord", color: "#5865F2" },
  twitch: { label: "Twitch", color: "#9146FF" },
  instagram: { label: "Instagram", color: "#E1306C" },
  twitter: { label: "Twitter/X", color: "#000000" },
  facebook: { label: "Facebook", color: "#1877F2" },
  spotify: { label: "Spotify", color: "#1DB954" },
  other: { label: "Other", color: "#6b7280" },
};

// ─── Official Badges ───────────────────────────────────────────────────────

const OFFICIAL_BADGES: PlayerBadge[] = [
  {
    id: "official_welcome",
    name: "Welcome to Dini.Verse",
    icon: "star",
    type: "official",
    description: "Joined the Dini.Verse community!",
  },
  {
    id: "official_first_login",
    name: "First Login",
    icon: "login",
    type: "official",
    description: "Logged in for the first time.",
  },
  {
    id: "official_explorer",
    name: "Explorer",
    icon: "compass",
    type: "official",
    description: "Explored the platform.",
  },
];

function OfficialBadgeIcon({ icon }: { icon: string }) {
  if (icon === "star") return <Star className="w-5 h-5 text-yellow-500" />;
  if (icon === "login") return <LogIn className="w-5 h-5 text-blue-500" />;
  if (icon === "compass") return <Compass className="w-5 h-5 text-green-600" />;
  return <Shield className="w-5 h-5 text-muted-foreground" />;
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-muted/50 min-w-[64px]">
      <span className="text-base font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Online Badge ──────────────────────────────────────────────────────────

function OnlineBadge({ visibility }: { visibility: "online" | "offline" }) {
  const isOnline = visibility === "online";
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          isOnline ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span
        className={`text-sm font-medium ${
          isOnline ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </span>
  );
}

// ─── Public Profile Page ───────────────────────────────────────────────────

export default function PublicProfile() {
  const { username } = useParams({ from: "/people/$username" });
  const currentUser = getCurrentUsername();
  const isOwnProfile = currentUser === username;
  const isLoggedIn = !!currentUser;

  const users = useMemo(() => getStoredUsers(), []);
  const userData = users[username];

  const settings = useMemo(
    () => (userData ? getLocalSettings(username) : null),
    [username, userData],
  );

  const socialLinks = useMemo(
    () => (userData ? getSocialLinks(username).filter((l) => l.url) : []),
    [username, userData],
  );

  const userGroups = useMemo(() => {
    if (!userData) return [];
    return getStoredGroups().filter(
      (g) =>
        g.ownedBy === username ||
        g.members.some((m) => m.username === username),
    );
  }, [username, userData]);

  const publishedGames = useMemo(
    () =>
      getLocalList<PublishedGame>("diniverse_published_games").filter(
        (g) => g.publishedBy === username,
      ),
    [username],
  );

  const playerBadges = useMemo(
    () =>
      getLocalList<PlayerBadge>(`diniverse_badges_${username}`).filter(
        (b) => b.type === "player",
      ),
    [username],
  );

  // ── Follow state ──
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    if (!currentUser) return false;
    const following = getLocalList<string>(
      `diniverse_following_${currentUser}`,
    );
    return following.includes(username);
  });

  // ── Block dialog state ──
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(() => {
    if (!currentUser) return false;
    const blocked = getLocalList<string>(`diniverse_blocked_${currentUser}`);
    return blocked.includes(username);
  });

  // ── Report dialog state ──
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Stats
  const friends = useMemo(
    () => getLocalList<string>(`diniverse_friends_${username}`),
    [username],
  );
  const followers = useMemo(
    () => getLocalList<string>(`diniverse_followers_${username}`),
    [username],
  );
  const following = useMemo(
    () => getLocalList<string>(`diniverse_following_${username}`),
    [username],
  );

  const bio = useMemo(() => getBio(username), [username]);
  const bannerUrl = useMemo(() => getBanner(username), [username]);

  // ── Handlers ──
  const handleFollow = () => {
    if (!currentUser) return;
    const followingKey = `diniverse_following_${currentUser}`;
    const followersKey = `diniverse_followers_${username}`;
    let followingList = getLocalList<string>(followingKey);
    let followersList = getLocalList<string>(followersKey);

    if (isFollowing) {
      followingList = followingList.filter((u) => u !== username);
      followersList = followersList.filter((u) => u !== currentUser);
      setIsFollowing(false);
      toast.success(`Unfollowed @${username}`);
    } else {
      if (!followingList.includes(username)) followingList.push(username);
      if (!followersList.includes(currentUser)) followersList.push(currentUser);
      setIsFollowing(true);
      toast.success(`Now following @${username}`);
    }
    saveLocalList(followingKey, followingList);
    saveLocalList(followersKey, followersList);
  };

  const handleBlock = () => {
    if (!currentUser) return;
    const blockedKey = `diniverse_blocked_${currentUser}`;
    let blockedList = getLocalList<string>(blockedKey);
    if (!blockedList.includes(username)) blockedList.push(username);
    saveLocalList(blockedKey, blockedList);
    setIsBlocked(true);
    setShowBlockDialog(false);
    toast.success(`@${username} has been blocked.`);
  };

  const handleReport = () => {
    if (!reportReason) return;
    setShowReportDialog(false);
    setReportReason("");
    toast.success("Report submitted");
  };

  // ── User not found ──
  if (!userData) {
    return (
      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
        <Link
          to="/people"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="publicprofile.back.link"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to People
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            User not found
          </h2>
          <p className="text-sm text-muted-foreground">
            The user &ldquo;@{username}&rdquo; doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const displayName = userData.displayName || username;
  const avatarDataUrl = settings?.avatarDataUrl ?? null;
  const visibility = settings?.visibility ?? "online";

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      {/* Breadcrumb */}
      <Link
        to="/people"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-ocid="publicprofile.back.link"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to People
      </Link>

      {/* Profile card */}
      <Card className="mb-6 overflow-hidden">
        {/* Banner */}
        <div
          className="h-40 w-full relative"
          style={{ background: bannerUrl ? undefined : "#cde5aa" }}
        >
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}

          {/* 3-dot menu — top-right, only visible when logged in and not own profile */}
          {isLoggedIn && !isOwnProfile && (
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow"
                    data-ocid="publicprofile.open_modal_button"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  data-ocid="publicprofile.dropdown_menu"
                >
                  <DropdownMenuItem
                    onClick={handleFollow}
                    data-ocid="publicprofile.toggle"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowBlockDialog(true)}
                    className="text-destructive focus:text-destructive"
                    disabled={isBlocked}
                    data-ocid="publicprofile.secondary_button"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {isBlocked ? "Blocked" : "Block User"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowReportDialog(true)}
                    data-ocid="publicprofile.button"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CardContent className="pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row gap-4 -mt-10">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-background shadow-md shrink-0">
              {avatarDataUrl && (
                <AvatarImage src={avatarDataUrl} alt={displayName} />
              )}
              <AvatarFallback className="text-3xl font-bold bg-[#cde5aa] text-green-800">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Name + status + stats */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-10">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {displayName}
              </h1>
              <p className="text-muted-foreground text-sm mb-2">@{username}</p>
              <OnlineBadge visibility={visibility} />

              {/* Stats row */}
              <div className="flex flex-wrap gap-2 mt-3">
                <StatPill label="Friends" value={friends.length} />
                <StatPill label="Followers" value={followers.length} />
                <StatPill label="Following" value={following.length} />
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p className="mt-4 text-sm text-muted-foreground border-t pt-4">
              {bio}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Social Networks */}
      {socialLinks.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {socialLinks.map((link) => {
            const platform = SOCIAL_PLATFORMS[link.platform] ?? {
              label: link.platform,
              color: "#6b7280",
            };
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border hover:bg-muted/50 transition-colors text-sm"
                data-ocid="publicprofile.card"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: platform.color }}
                >
                  {platform.label.charAt(0)}
                </div>
                <span className="font-medium">{platform.label}</span>
                {link.username && (
                  <span className="text-muted-foreground">
                    @{link.username}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      )}

      {/* Tabs: Games, Badges, Groups */}
      <Tabs defaultValue="games">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="games" data-ocid="publicprofile.tab">
            <GamepadIcon className="w-3.5 h-3.5 mr-1" />
            Games
          </TabsTrigger>
          <TabsTrigger value="badges" data-ocid="publicprofile.tab">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="groups" data-ocid="publicprofile.tab">
            <Users className="w-3.5 h-3.5 mr-1" />
            Groups
          </TabsTrigger>
        </TabsList>

        {/* Games tab */}
        <TabsContent value="games" className="mt-4">
          {publishedGames.length === 0 ? (
            <div
              className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed"
              data-ocid="publicprofile.empty_state"
            >
              <GamepadIcon className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No games created yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {publishedGames.map((game, i) => (
                <div
                  key={game.id}
                  className="rounded-xl border overflow-hidden bg-card"
                  data-ocid={`publicprofile.item.${i + 1}`}
                >
                  {game.thumbnails?.[0] ? (
                    <img
                      src={game.thumbnails[0]}
                      alt={game.title}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <div className="w-full h-28 bg-muted flex items-center justify-center">
                      <GamepadIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{game.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Badges tab */}
        <TabsContent value="badges" className="mt-4 space-y-6">
          {/* Official badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="h-0.5 flex-1 rounded"
                style={{ background: "#cde5aa" }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dini.Verse Official
              </span>
              <div
                className="h-0.5 flex-1 rounded"
                style={{ background: "#cde5aa" }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {OFFICIAL_BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-start gap-3 p-3 rounded-xl border bg-card"
                >
                  <div className="shrink-0 p-2 rounded-lg bg-muted">
                    <OfficialBadgeIcon icon={badge.icon} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Player badges */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="h-0.5 flex-1 rounded"
                style={{ background: "#cde5aa" }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Player Badges
              </span>
              <div
                className="h-0.5 flex-1 rounded"
                style={{ background: "#cde5aa" }}
              />
            </div>
            {playerBadges.length === 0 ? (
              <div
                className="py-8 flex flex-col items-center justify-center text-center rounded-xl border border-dashed"
                data-ocid="publicprofile.empty_state"
              >
                <Shield className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No player badges earned yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {playerBadges.map((badge, i) => (
                  <div
                    key={badge.id}
                    className="flex items-start gap-3 p-3 rounded-xl border bg-card"
                    data-ocid={`publicprofile.item.${i + 1}`}
                  >
                    <div className="shrink-0 p-2 rounded-lg bg-muted">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Groups tab */}
        <TabsContent value="groups" className="mt-4">
          {userGroups.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl"
              data-ocid="publicprofile.empty_state"
            >
              <Users className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                This user hasn&apos;t joined any groups yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userGroups.map((group, index) => (
                <Card
                  key={group.id}
                  className="overflow-hidden"
                  data-ocid={`publicprofile.item.${index + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#cde5aa] flex items-center justify-center overflow-hidden shrink-0">
                        {group.thumbnailDataUrl ? (
                          <img
                            src={group.thumbnailDataUrl}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-green-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {group.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.members.length} member
                          {group.members.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {group.ownedBy === username && (
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0 border-green-400 text-green-700"
                        >
                          Owner
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Block User Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent data-ocid="publicprofile.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Block @{username}?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking this user will prevent them from interacting with you.
              You can unblock them later from your settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="publicprofile.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="publicprofile.confirm_button"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent data-ocid="publicprofile.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Report @{username}</AlertDialogTitle>
            <AlertDialogDescription>
              Please select a reason for reporting this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-0 pb-2">
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger data-ocid="publicprofile.select">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="inappropriate">
                  Inappropriate Content
                </SelectItem>
                <SelectItem value="cheating">Cheating</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setReportReason("")}
              data-ocid="publicprofile.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={!reportReason}
              data-ocid="publicprofile.submit_button"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
