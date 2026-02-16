import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';
import type { 
  Experience, 
  Category, 
  DiniVerseUser,
  ExternalBlob
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<DiniVerseUser | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: DiniVerseUser) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('saveCallerUserProfile not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Experience Queries
export function useGetAllExperiences() {
  const { actor, isFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExperiences();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetExperiencesByCategory(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExperiencesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTrendingExperiences(category: Category) {
  const { actor, isFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'trending', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingExperiences(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchExperiences(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchExperiences(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetExperience(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Experience | null>({
    queryKey: ['experience', id],
    queryFn: async () => {
      if (!actor) return null;
      // TODO: Backend method not yet implemented - find by ID from all experiences
      const experiences = await actor.getAllExperiences();
      return experiences.find(exp => exp.id === id) || null;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      thumbnail: ExternalBlob | null;
      category: Category;
      gameplayControls: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('createExperience not yet implemented in backend');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useRateExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { experienceId: string; isThumbsUp: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('rateExperience not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['experience', variables.experienceId] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useIncrementPlayerCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experienceId: string) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('incrementPlayerCount not yet implemented in backend');
    },
    onSuccess: (_, experienceId) => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

// Friend Queries - Stubs until backend implements
export function useGetFriendsList() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      if (!actor) return [];
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingFriendRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friendRequests', 'pending'],
    queryFn: async () => {
      if (!actor) return [];
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching,
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
    mutationFn: async (data: { from: Principal; action: 'accept' | 'decline' }) => {
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

// Message Queries - Stubs until backend implements
export interface Message {
  id: number;
  sender: Principal;
  receiver: Principal;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export interface MessageInput {
  receiver: Principal;
  content: string;
}

export function useGetMessages(receiver: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', receiver?.toString()],
    queryFn: async () => {
      if (!actor || !receiver) return [];
      // TODO: Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!receiver,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MessageInput) => {
      if (!actor) throw new Error('Actor not available');
      // TODO: Backend method not yet implemented
      throw new Error('sendMessage not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver.toString()] });
    },
  });
}
