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
import { Skeleton } from "@/components/ui/skeleton";
import { Check, UserMinus, UserX, X } from "lucide-react";
import { toast } from "sonner";
import {
  useGetFriends,
  useGetIncomingRequests,
  useGetOutgoingRequests,
  useRespondToFriendRequest,
  useUnfriend,
} from "../../hooks/useSocialFriends";

export default function FriendsPanel() {
  const { data: friends, isLoading: friendsLoading } = useGetFriends();
  const { data: incoming, isLoading: incomingLoading } =
    useGetIncomingRequests();
  const { data: outgoing } = useGetOutgoingRequests();
  const respondMutation = useRespondToFriendRequest();
  const unfriendMutation = useUnfriend();

  const handleAccept = async (from: string) => {
    try {
      await respondMutation.mutateAsync({ from, action: "accept" });
      toast.success("Friend request accepted!");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to accept request",
      );
    }
  };

  const handleDecline = async (from: string, idx: number) => {
    try {
      await respondMutation.mutateAsync({ from, action: "decline" });
      toast.success("Friend request declined");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to decline request",
      );
    }
    void idx;
  };

  const handleUnfriend = async (username: string) => {
    try {
      await unfriendMutation.mutateAsync(username);
      toast.success("Friend removed");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove friend",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming Requests */}
      {(incoming?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Incoming Requests
              <Badge variant="secondary">{incoming?.length}</Badge>
            </CardTitle>
            <CardDescription>People who want to be your friend</CardDescription>
          </CardHeader>
          <CardContent>
            {incomingLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {incoming?.map((req, idx) => (
                  <div
                    key={req.from}
                    data-ocid={`social.friends.item.${idx + 1}`}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {req.fromAvatarUrl && (
                          <AvatarImage
                            src={req.fromAvatarUrl}
                            alt={req.fromDisplayName}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {req.fromDisplayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">
                          {req.fromDisplayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{req.from}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(req.from)}
                        disabled={respondMutation.isPending}
                        data-ocid={`social.friends.accept_button.${idx + 1}`}
                        className="gap-1"
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(req.from, idx)}
                        disabled={respondMutation.isPending}
                        data-ocid={`social.friends.decline_button.${idx + 1}`}
                        className="gap-1"
                      >
                        <X className="h-3 w-3" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Outgoing Pending */}
      {(outgoing?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests Sent</CardTitle>
            <CardDescription>
              Waiting for these people to accept
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outgoing?.map((req) => (
                <div
                  key={req.to}
                  className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                >
                  <Avatar className="h-10 w-10">
                    {req.toAvatarUrl && (
                      <AvatarImage
                        src={req.toAvatarUrl}
                        alt={req.toDisplayName}
                      />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {req.toDisplayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{req.toDisplayName}</p>
                    <p className="text-xs text-muted-foreground">@{req.to}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Friends
            {(friends?.length ?? 0) > 0 && (
              <Badge variant="secondary">{friends?.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your confirmed friends on Dini.Verse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {friendsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : friends && friends.length > 0 ? (
            <div className="space-y-2">
              {friends.map((friend, idx) => (
                <div
                  key={friend.username}
                  data-ocid={`social.friends.item.${idx + 1}`}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        {friend.avatarUrl && (
                          <AvatarImage
                            src={friend.avatarUrl}
                            alt={friend.displayName}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {friend.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${
                          friend.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {friend.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{friend.username} ·{" "}
                        <span
                          className={
                            friend.isOnline
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }
                        >
                          {friend.isOnline ? "Online" : "Offline"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnfriend(friend.username)}
                    disabled={unfriendMutation.isPending}
                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="h-4 w-4" />
                    Unfriend
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div
              data-ocid="social.friends.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <UserX className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No friends yet</p>
              <p className="text-sm mt-1">
                Use the Find Friends tab to search for people to add!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
