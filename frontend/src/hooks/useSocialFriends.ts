import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetFriendsList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPendingFriendRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friendRequests', 'pending'],
    queryFn: async () => {
      if (!actor) return [];
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('sendFriendRequest not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useRespondToFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      from,
      action,
    }: {
      from: Principal;
      action: 'accept' | 'decline';
    }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('respondToFriendRequest not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}

export function useUnfriend() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('unfriend not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
