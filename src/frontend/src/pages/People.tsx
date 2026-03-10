import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";
import { Search, UserSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getLocalSettings } from "../hooks/useAccountSettings";

interface UserRecord {
  username: string;
  displayName: string;
  avatarDataUrl: string | null;
  visibility: "online" | "offline";
}

function getAllUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem("diniverse_users");
    if (!raw) return [];
    const users: Record<string, { displayName: string; passwordHash: string }> =
      JSON.parse(raw);
    return Object.entries(users).map(([username, data]) => {
      const settings = getLocalSettings(username);
      return {
        username,
        displayName: data.displayName || username,
        avatarDataUrl: settings.avatarDataUrl ?? null,
        visibility: settings.visibility ?? "online",
      };
    });
  } catch {
    return [];
  }
}

function OnlineBadge({ visibility }: { visibility: "online" | "offline" }) {
  const isOnline = visibility === "online";
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`inline-block w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
      />
      <span
        className={`text-xs font-medium ${
          isOnline ? "text-green-600" : "text-gray-500"
        }`}
      >
        {isOnline ? "Online" : "Offline"}
      </span>
    </span>
  );
}

export default function People() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);

  // Load users on mount
  useEffect(() => {
    setAllUsers(getAllUsers());
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredUsers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return allUsers.slice(0, 50);
    return allUsers
      .filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [allUsers, debouncedQuery]);

  return (
    <div className="flex-1 p-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#cde5aa] flex items-center justify-center shrink-0">
            <UserSearch className="w-5 h-5 text-green-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">People</h1>
            <p className="text-sm text-muted-foreground">
              Search and discover players on Dini.Verse
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by username or display name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-ocid="people.search_input"
        />
      </div>

      {/* Results */}
      {allUsers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="people.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserSearch className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            No users yet
          </p>
          <p className="text-sm text-muted-foreground">
            No users have signed up yet. Be the first!
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="people.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            No results found
          </p>
          <p className="text-sm text-muted-foreground">
            No users match &ldquo;{debouncedQuery}&rdquo;. Try a different
            search.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {!debouncedQuery.trim() && (
            <p className="text-xs text-muted-foreground mb-2">
              Showing {filteredUsers.length} player
              {filteredUsers.length !== 1 ? "s" : ""}
            </p>
          )}
          {filteredUsers.map((user, index) => (
            <Link
              key={user.username}
              to="/people/$username"
              params={{ username: user.username }}
              data-ocid={`people.item.${index + 1}`}
            >
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      {user.avatarDataUrl && (
                        <AvatarImage
                          src={user.avatarDataUrl}
                          alt={user.displayName}
                        />
                      )}
                      <AvatarFallback className="text-lg font-bold bg-[#cde5aa] text-green-800">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.displayName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                    <OnlineBadge visibility={user.visibility} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
