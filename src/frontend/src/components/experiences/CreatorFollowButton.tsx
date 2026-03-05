import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  useFollowCreator,
  useIsFollowing,
  useUnfollowCreator,
} from "../../hooks/useSocialFollowing";

export default function CreatorFollowButton({
  authorPrincipal,
}: { authorPrincipal: Principal }) {
  const { isAuthenticated } = useCurrentUser();
  const { data: isFollowing } = useIsFollowing(authorPrincipal);
  const followMutation = useFollowCreator();
  const unfollowMutation = useUnfollowCreator();

  // We can't compare principal with username, so isSelf check is removed for session auth
  const isSelf = false;

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to follow creators");
      return;
    }

    if (isSelf) {
      toast.error("You cannot follow yourself");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(authorPrincipal);
        toast.success("Unfollowed creator");
      } else {
        await followMutation.mutateAsync(authorPrincipal);
        toast.success("Following creator");
      }
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    }
  };

  if (isSelf || !isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
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
