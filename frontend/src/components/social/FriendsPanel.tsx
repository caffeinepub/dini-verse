import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Check, X, UserMinus } from 'lucide-react';
import { useSearchUsers } from '../../hooks/useUserDiscovery';
import { useSendFriendRequest, useGetFriendsList, useGetPendingFriendRequests, useRespondToFriendRequest, useUnfriend } from '../../hooks/useSocialFriends';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import { Skeleton } from '@/components/ui/skeleton';

export default function FriendsPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const { identity } = useInternetIdentity();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchTerm);
  const { data: friends, isLoading: friendsLoading } = useGetFriendsList();
  const { data: pendingRequests, isLoading: requestsLoading } = useGetPendingFriendRequests();
  const sendRequestMutation = useSendFriendRequest();
  const respondMutation = useRespondToFriendRequest();
  const unfriendMutation = useUnfriend();

  const currentPrincipal = identity?.getPrincipal().toString();

  const handleSendRequest = async (targetPrincipal: Principal) => {
    try {
      await sendRequestMutation.mutateAsync(targetPrincipal);
      toast.success('Friend request sent');
      setSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send friend request');
    }
  };

  const handleAccept = async (fromPrincipal: Principal) => {
    try {
      await respondMutation.mutateAsync({ from: fromPrincipal, action: 'accept' });
      toast.success('Friend request accepted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleDecline = async (fromPrincipal: Principal) => {
    try {
      await respondMutation.mutateAsync({ from: fromPrincipal, action: 'decline' });
      toast.success('Friend request declined');
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline request');
    }
  };

  const handleUnfriend = async (targetPrincipal: Principal) => {
    try {
      await unfriendMutation.mutateAsync(targetPrincipal);
      toast.success('Friend removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove friend');
    }
  };

  const filteredSearchResults = searchResults?.filter(
    ([principal]) => principal.toString() !== currentPrincipal
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Friends</CardTitle>
          <CardDescription>Search for users by display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              {searchLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : filteredSearchResults && filteredSearchResults.length > 0 ? (
                filteredSearchResults.map(([principal, user]) => (
                  <UserSearchResult
                    key={principal.toString()}
                    principal={principal}
                    user={user}
                    onSendRequest={handleSendRequest}
                    isSending={sendRequestMutation.isPending}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {pendingRequests && pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Friend requests waiting for your response</CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((principal) => (
                  <PendingRequestItem
                    key={principal.toString()}
                    principal={principal}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isResponding={respondMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
          <CardDescription>Your current friends list</CardDescription>
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
              {friends.map((principal) => (
                <FriendItem
                  key={principal.toString()}
                  principal={principal}
                  onUnfriend={handleUnfriend}
                  isUnfriending={unfriendMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No friends yet. Search for users above to send friend requests.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserSearchResult({
  principal,
  user,
  onSendRequest,
  isSending,
}: {
  principal: Principal;
  user: any;
  onSendRequest: (principal: Principal) => void;
  isSending: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {user.avatar && (
            <AvatarImage src={user.avatar.getDirectURL()} alt={user.displayName} />
          )}
          <AvatarFallback>{user.displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user.displayName}</div>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onSendRequest(principal)}
        disabled={isSending}
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Add Friend
      </Button>
    </div>
  );
}

function PendingRequestItem({
  principal,
  onAccept,
  onDecline,
  isResponding,
}: {
  principal: Principal;
  onAccept: (principal: Principal) => void;
  onDecline: (principal: Principal) => void;
  isResponding: boolean;
}) {
  const { data: user } = useGetUserProfile(principal);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {user?.avatar && (
            <AvatarImage src={user.avatar.getDirectURL()} alt={user.displayName} />
          )}
          <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user?.displayName || 'Unknown User'}</div>
          <div className="text-xs text-muted-foreground">Sent you a friend request</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onAccept(principal)}
          disabled={isResponding}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDecline(principal)}
          disabled={isResponding}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Decline
        </Button>
      </div>
    </div>
  );
}

function FriendItem({
  principal,
  onUnfriend,
  isUnfriending,
}: {
  principal: Principal;
  onUnfriend: (principal: Principal) => void;
  isUnfriending: boolean;
}) {
  const { data: user } = useGetUserProfile(principal);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          {user?.avatar && (
            <AvatarImage src={user.avatar.getDirectURL()} alt={user.displayName} />
          )}
          <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user?.displayName || 'Unknown User'}</div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onUnfriend(principal)}
        disabled={isUnfriending}
        className="gap-2"
      >
        <UserMinus className="h-4 w-4" />
        Unfriend
      </Button>
    </div>
  );
}
