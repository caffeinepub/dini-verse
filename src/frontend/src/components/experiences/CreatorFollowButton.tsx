import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useFollowCreator, useUnfollowCreator, useIsFollowing } from '../../hooks/useSocialFollowing';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';

export default function CreatorFollowButton({ authorPrincipal }: { authorPrincipal: Principal }) {
  const { identity } = useInternetIdentity();
  const { data: isFollowing } = useIsFollowing(authorPrincipal);
  const followMutation = useFollowCreator();
  const unfollowMutation = useUnfollowCreator();

  const isAuthenticated = !!identity;
  const currentPrincipal = identity?.getPrincipal().toString();
  const isSelf = currentPrincipal === authorPrincipal.toString();

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow creators');
      return;
    }

    if (isSelf) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(authorPrincipal);
        toast.success('Unfollowed creator');
      } else {
        await followMutation.mutateAsync(authorPrincipal);
        toast.success('Following creator');
      }
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  if (isSelf || !isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      onClick={handleToggleFollow}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className="w-full gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}
