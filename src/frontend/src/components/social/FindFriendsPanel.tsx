import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useSearchUsers,
  useSendFriendRequest,
} from "../../hooks/useSocialFriends";

export default function FindFriendsPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: results, isLoading } = useSearchUsers(searchTerm);
  const sendRequestMutation = useSendFriendRequest();

  const handleSendRequest = async (username: string) => {
    try {
      await sendRequestMutation.mutateAsync(username);
      toast.success(`Friend request sent to @${username}!`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send friend request",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Find Friends
        </CardTitle>
        <CardDescription>
          Search for other Dini.Verse users by username or display name
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or display name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-ocid="social.find_friends.search_input"
          />
        </div>

        {!searchTerm.trim() && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Search for users</p>
            <p className="text-sm mt-1">
              Type a username or display name to find people
            </p>
          </div>
        )}

        {searchTerm.trim() && (
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : results && results.length > 0 ? (
              results.map((user, idx) => (
                <div
                  key={user.username}
                  data-ocid={`social.find_friends.item.${idx + 1}`}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {user.avatarUrl && (
                        <AvatarImage
                          src={user.avatarUrl}
                          alt={user.displayName}
                        />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  {user.status === "friends" ? (
                    <Badge className="gap-1">
                      <UserCheck className="h-3 w-3" />
                      Friends
                    </Badge>
                  ) : user.status === "pending_outgoing" ? (
                    <Badge variant="secondary">Request Sent</Badge>
                  ) : user.status === "pending_incoming" ? (
                    <Badge variant="outline">Wants to add you</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(user.username)}
                      disabled={sendRequestMutation.isPending}
                      className="gap-1"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add Friend
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div
                data-ocid="social.find_friends.empty_state"
                className="text-center py-8 text-muted-foreground"
              >
                <p>No users found matching &ldquo;{searchTerm}&rdquo;</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
