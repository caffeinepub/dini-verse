import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';
import type { UserSettings, Variant_offline_online } from '../backend';
import { formatError } from '../utils/formatError';

// Get caller's account settings (always returns non-null)
export function useGetCallerSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserSettings, Error>({
    queryKey: ['callerSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getSettings();
      } catch (err) {
        // Normalize the error to ensure we have a proper Error object with a message
        const message = formatError(err);
        throw new Error(message);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Update display name
export function useUpdateDisplayName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDisplayName: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateDisplayName(newDisplayName);
      } catch (err) {
        const message = formatError(err);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Update display name and avatar together
export function useUpdateDisplayNameAndAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { displayName: string; avatar: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateDisplayNameAndAvatar(data.displayName, data.avatar);
      } catch (err) {
        const message = formatError(err);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Update visibility preference
export function useUpdateVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visibility: Variant_offline_online) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.updateVisibility(visibility);
      } catch (err) {
        const message = formatError(err);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Delete avatar
export function useDeleteAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.deleteAvatar();
      } catch (err) {
        const message = formatError(err);
        throw new Error(message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
