import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Compass,
  GamepadIcon,
  Heart,
  LogIn,
  Settings,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import RequireProfile from "../components/auth/RequireProfile";
import AvatarDisplay from "../components/avatar/AvatarDisplay";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../hooks/useAccountSettings";
import { useSessionAuth } from "../hooks/useSessionAuth";
import { getFriends, getSocialLinks } from "../utils/socialStorage";

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

function getBanner(username: string): string | null {
  return localStorage.getItem(`diniverse_banner_${username}`);
}

function saveBanner(username: string, dataUrl: string): void {
  localStorage.setItem(`diniverse_banner_${username}`, dataUrl);
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
  const avatarData = localSettings?.avatarData;
  const displayName = localSettings?.displayName || user?.displayName || "User";

  const [bio, setBio] = useState(() => getBio(username));
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const [bannerUrl, setBannerUrl] = useState<string | null>(() =>
    username ? getBanner(username) : null,
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const friends = username ? getFriends(username) : [];
  const followers = getLocalList<string>(`diniverse_followers_${username}`);
  const following = getLocalList<string>(`diniverse_following_${username}`);

  const publishedGames = getLocalList<PublishedGame>(
    "diniverse_published_games",
  ).filter((g) => g.publishedBy === username);

  const favorites = getLocalList<FavoriteItem>(
    `diniverse_favorites_${username}`,
  );

  const playerBadges = getLocalList<PlayerBadge>(
    `diniverse_badges_${username}`,
  ).filter((b) => b.type === "player");

  const socialLinks = getSocialLinks(username).filter((l) => l.url);

  const handleSaveBio = () => {
    saveBio(username, bioInput);
    setBio(bioInput);
    setEditingBio(false);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      saveBanner(username, dataUrl);
      setBannerUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <RequireProfile>
      <div className="container max-w-3xl py-8 space-y-6">
        {/* ── Profile Header Card ── */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div
            className="h-40 w-full relative group"
            style={{
              background: bannerUrl ? undefined : "#cde5aa",
            }}
          >
            {bannerUrl && (
              <img
                src={bannerUrl}
                alt="Profile banner"
                className="w-full h-full object-cover"
              />
            )}
            {/* Edit banner overlay */}
            <button
              type="button"
              className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              onClick={() => bannerInputRef.current?.click()}
              data-ocid="profile.upload_button"
            >
              <Camera className="w-3.5 h-3.5" />
              Edit Banner
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </div>

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
              <div className="w-32 h-44">
                <AvatarDisplay
                  avatarData={avatarData}
                  skinColor={localSettings?.skinColor ?? "#f5cba7"}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Networks */}
        {socialLinks.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-3">
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
                      data-ocid="profile.card"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: platform.color }}
                      >
                        {platform.label.charAt(0)}
                      </div>
                      <span className="font-medium text-foreground">
                        {platform.label}
                      </span>
                      {link.username && (
                        <span className="text-muted-foreground">
                          @{link.username}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="created">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="created" data-ocid="profile.tab">
              <GamepadIcon className="w-3.5 h-3.5 mr-1" />
              Created
            </TabsTrigger>
            <TabsTrigger value="favorites" data-ocid="profile.tab">
              <Heart className="w-3.5 h-3.5 mr-1" />
              Favorites
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
