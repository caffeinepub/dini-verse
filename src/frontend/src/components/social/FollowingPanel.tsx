import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserMinus } from 'lucide-react';
import { useGetFollowedCreators, useUnfollowCreator } from '../../hooks/useSocialFollowing';
import { useGetUserProfile } from '../../hooks/useUserProfile';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import { Skeleton } from '@/components/ui/skeleton';

export default function FollowingPanel() {
  const { data: followedCreators, isLoading } = useGetFollowedCreators();
  const unfollowMutation = useUnfollowCreator();

  const handleUnfollow = async (creatorPrincipal: Principal) => {
    try {
      await unfollowMutation.mutateAsync(creatorPrincipal);
      toast.success('Unfollowed creator');
    } catch (error: any) {
      toast.error(error.message || 'Failed to unfollow creator');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Following</CardTitle>
          <CardDescription>Creators you follow</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : followedCreators && followedCreators.length > 0 ? (
            <div className="space-y-2">
              {followedCreators.map((principal) => (
                <CreatorItem
                  key={principal.toString()}
                  principal={principal}
                  onUnfollow={handleUnfollow}
                  isUnfollowing={unfollowMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              You're not following any creators yet. Visit experience pages to follow creators.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreatorItem({
  principal,
  onUnfollow,
  isUnfollowing,
}: {
  principal: Principal;
  onUnfollow: (principal: Principal) => void;
  isUnfollowing: boolean;
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
          <div className="font-medium">{user?.displayName || 'Unknown Creator'}</div>
          <div className="text-xs text-muted-foreground">Creator</div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onUnfollow(principal)}
        disabled={isUnfollowing}
        className="gap-2"
      >
        <UserMinus className="h-4 w-4" />
        Unfollow
      </Button>
    </div>
  );
}
