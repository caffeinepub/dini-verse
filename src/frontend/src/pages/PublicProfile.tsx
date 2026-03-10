import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft, Users } from "lucide-react";
import { useMemo } from "react";
import { getLocalSettings } from "../hooks/useAccountSettings";

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

function OnlineBadge({ visibility }: { visibility: "online" | "offline" }) {
  const isOnline = visibility === "online";
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
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

export default function PublicProfile() {
  const { username } = useParams({ from: "/people/$username" });

  const users = useMemo(() => getStoredUsers(), []);
  const userData = users[username];

  const settings = useMemo(
    () => (userData ? getLocalSettings(username) : null),
    [username, userData],
  );

  const userGroups = useMemo(() => {
    if (!userData) return [];
    const groups = getStoredGroups();
    return groups.filter(
      (g) =>
        g.ownedBy === username ||
        g.members.some((m) => m.username === username),
    );
  }, [username, userData]);

  // User not found
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
      <Card className="mb-6">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              {avatarDataUrl && (
                <AvatarImage src={avatarDataUrl} alt={displayName} />
              )}
              <AvatarFallback className="text-3xl font-bold bg-[#cde5aa] text-green-800">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground truncate">
                {displayName}
              </h1>
              <p className="text-muted-foreground text-sm mb-2">@{username}</p>
              <OnlineBadge visibility={visibility} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Groups
          {userGroups.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {userGroups.length}
            </Badge>
          )}
        </h2>

        {userGroups.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border rounded-xl"
            data-ocid="publicprofile.groups.empty_state"
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
                data-ocid={`publicprofile.group.item.${index + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
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
      </section>
    </div>
  );
}
