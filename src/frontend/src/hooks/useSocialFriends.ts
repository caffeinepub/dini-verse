import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';
import { Variant_accept_decline } from '../backend';

export function useGetFriendsList() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendsList();
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
      return actor.getPendingFriendRequests();
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
      return actor.sendFriendRequest(target);
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
      const variantAction = action === 'accept' ? Variant_accept_decline.accept : Variant_accept_decline.decline;
      return actor.respondToFriendRequest(from, variantAction);
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
      return actor.unfriend(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });
}
