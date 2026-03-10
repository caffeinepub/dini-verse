import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Compass,
  GamepadIcon,
  Heart,
  LogIn,
  Settings,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";
import RequireProfile from "../components/auth/RequireProfile";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PublishedGame {
  id: string;
  title: string;
  thumbnails: string[];
  publishedBy: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  imageUrl?: string;
}

interface Group {
  id: string;
  name: string;
  thumbnailDataUrl: string | null;
  ownedBy: string;
  members: { username: string }[];
}

interface PlayerBadge {
  id: string;
  name: string;
  icon: string;
  type: "official" | "player";
  description: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getLocalList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function getBio(username: string): string {
  return localStorage.getItem(`diniverse_bio_${username}`) ?? "";
}

function saveBio(username: string, bio: string): void {
  localStorage.setItem(`diniverse_bio_${username}`, bio);
}

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

function StatPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-muted/50 min-w-[64px]">
      <span className="text-base font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ─── Profile Page ──────────────────────────────────────────────────────────

export default function Profile() {
  const { user } = useSessionAuth();
  const navigate = useNavigate();

  const username = getCurrentUsername() ?? "";
  const localSettings = username ? getLocalSettings(username) : null;
  const avatarDataUrl = localSettings?.avatarDataUrl ?? null;
  const displayName = localSettings?.displayName || user?.displayName || "User";

  const [bio, setBio] = useState(() => getBio(username));
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);

  const friends = getLocalList<string>(`diniverse_friends_${username}`);
  const followers = getLocalList<string>(`diniverse_followers_${username}`);
  const following = getLocalList<string>(`diniverse_following_${username}`);

  const allGroups = getLocalList<Group>("diniverse_groups");
  const myGroups = allGroups.filter(
    (g) =>
      g.ownedBy === username || g.members.some((m) => m.username === username),
  );

  const publishedGames = getLocalList<PublishedGame>(
    "diniverse_published_games",
  ).filter((g) => g.publishedBy === username);

  const favorites = getLocalList<FavoriteItem>(
    `diniverse_favorites_${username}`,
  );

  const playerBadges = getLocalList<PlayerBadge>(
    `diniverse_badges_${username}`,
  ).filter((b) => b.type === "player");

  const handleSaveBio = () => {
    saveBio(username, bioInput);
    setBio(bioInput);
    setEditingBio(false);
  };

  return (
    <RequireProfile>
      <div className="container max-w-3xl py-8 space-y-6">
        {/* ── Profile Header Card ── */}
        <Card className="overflow-hidden">
          <div className="h-20 w-full" style={{ background: "#cde5aa" }} />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row gap-4 -mt-10">
              {/* Avatar */}
              <Avatar
                className="h-24 w-24 border-4 border-background shadow-md"
                data-ocid="profile.card"
              >
                {avatarDataUrl && (
                  <AvatarImage src={avatarDataUrl} alt={displayName} />
                )}
                <AvatarFallback className="text-3xl bg-muted">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Name + stats */}
              <div className="flex-1 pt-2 sm:pt-10">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold leading-tight">
                      {displayName}
                    </h1>
                    <p className="text-sm text-muted-foreground">@{username}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => navigate({ to: "/settings" })}
                    data-ocid="profile.secondary_button"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatPill label="Friends" value={friends.length} />
                  <StatPill label="Followers" value={followers.length} />
                  <StatPill label="Following" value={following.length} />
                </div>
              </div>
            </div>

            {/* Edit Bio */}
            <div className="mt-5 space-y-2">
              {!editingBio ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBioInput(bio);
                      setEditingBio(true);
                    }}
                    data-ocid="profile.edit_button"
                  >
                    Edit Bio
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {bio || "No bio yet."}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={3}
                    placeholder="Tell the world about yourself..."
                    autoFocus
                    data-ocid="profile.textarea"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveBio}
                      data-ocid="profile.save_button"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingBio(false)}
                      data-ocid="profile.cancel_button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Avatar Display ── */}
        <div className="space-y-2">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground px-1">
            Your Avatar
          </h2>
          <Card>
            <CardContent className="py-6 flex items-center justify-center">
              {avatarDataUrl ? (
                <img
                  src={avatarDataUrl}
                  alt="Avatar"
                  className="h-40 w-40 rounded-xl object-contain border bg-muted"
                />
              ) : (
                <div className="h-40 w-40 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="created">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="created" data-ocid="profile.tab">
              <GamepadIcon className="w-3.5 h-3.5 mr-1" />
              Created
            </TabsTrigger>
            <TabsTrigger value="favorites" data-ocid="profile.tab">
              <Heart className="w-3.5 h-3.5 mr-1" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="groups" data-ocid="profile.tab">
              <Users className="w-3.5 h-3.5 mr-1" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="badges" data-ocid="profile.tab">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Badges
            </TabsTrigger>
          </TabsList>

          {/* Created tab */}
          <TabsContent value="created" className="mt-4">
            {publishedGames.length === 0 ? (
              <div
                className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed"
                data-ocid="profile.empty_state"
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
                    data-ocid={`profile.item.${i + 1}`}
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
                      <p className="text-sm font-medium truncate">
                        {game.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites tab */}
          <TabsContent value="favorites" className="mt-4">
            {favorites.length === 0 ? (
              <div
                className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed"
                data-ocid="profile.empty_state"
              >
                <Heart className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No favorites yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {favorites.map((item, i) => (
                  <div
                    key={item.id}
                    className="rounded-xl border overflow-hidden bg-card"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-muted flex items-center justify-center">
                        <Heart className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Groups tab */}
          <TabsContent value="groups" className="mt-4">
            {myGroups.length === 0 ? (
              <div
                className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed"
                data-ocid="profile.empty_state"
              >
                <Users className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Not in any groups yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {myGroups.map((group, i) => (
                  <div
                    key={group.id}
                    className="rounded-xl border overflow-hidden bg-card"
                    data-ocid={`profile.item.${i + 1}`}
                  >
                    {group.thumbnailDataUrl ? (
                      <img
                        src={group.thumbnailDataUrl}
                        alt={group.name}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-muted flex items-center justify-center">
                        <Users className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="p-2 flex items-center justify-between gap-1">
                      <p className="text-sm font-medium truncate">
                        {group.name}
                      </p>
                      {group.ownedBy === username && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Owner
                        </Badge>
                      )}
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
                    data-ocid="profile.card"
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
                  data-ocid="profile.empty_state"
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
                      data-ocid={`profile.item.${i + 1}`}
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
        </Tabs>
      </div>
    </RequireProfile>
  );
}
