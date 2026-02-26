import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// Temporary type until backend is updated with session auth
interface UserProfile {
  displayName: string;
  avatar?: ExternalBlob;
}

export function useGetCurrentUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      // Backend method doesn't exist yet - return null
      // TODO: Replace with session-based getCurrentUser call
      return null;
    },
    enabled: false, // Disabled until backend implements session auth
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      // Backend method doesn't exist - return null
      // TODO: Replace with session-based user lookup
      return null;
    },
    enabled: false, // Disabled until backend implements session auth
  });
}

export function useSignUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      avatar,
    }: {
      displayName: string;
      avatar: ExternalBlob | null;
    }) => {
      // Backend method doesn't exist yet
      // TODO: Replace with session-based signup
      throw new Error('Backend signup not yet implemented with session auth');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
