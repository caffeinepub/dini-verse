import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Placeholder hooks for following system - backend not yet implemented
export function useGetFollowedCreators() {
  return useQuery<Principal[]>({
    queryKey: ["following"],
    queryFn: async () => {
      // Backend following methods not yet available
      return [];
    },
    enabled: false,
  });
}

export function useFollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_creatorPrincipal: Principal) => {
      // Backend following methods not yet available
      throw new Error("Follow feature coming soon");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useUnfollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_creatorPrincipal: Principal) => {
      // Backend following methods not yet available
      throw new Error("Unfollow feature coming soon");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

export function useGetFollowerCount(_creatorPrincipal: Principal | undefined) {
  return useQuery<number>({
    queryKey: ["followerCount", _creatorPrincipal?.toString()],
    queryFn: async () => {
      // Backend following methods not yet available
      return 0;
    },
    enabled: false,
  });
}

export function useIsFollowing(_creatorPrincipal: Principal | undefined) {
  return useQuery<boolean>({
    queryKey: ["isFollowing", _creatorPrincipal?.toString()],
    queryFn: async () => {
      // Backend following methods not yet available
      return false;
    },
    enabled: false,
  });
}
