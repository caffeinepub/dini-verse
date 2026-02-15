import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Experience } from '../backend';
import { ExternalBlob, Category } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetAllExperiences() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllExperiences();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSearchExperiences(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchExperiences(searchTerm);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetExperience(id: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience | null>({
    queryKey: ['experience', id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getExperience(id);
    },
    enabled: !!actor && !actorFetching && !!id,
  });
}

export function useGetExperiencesByAuthor(author: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'author', author?.toString()],
    queryFn: async () => {
      if (!actor || !author) return [];
      return actor.getExperiencesByAuthor(author);
    },
    enabled: !!actor && !actorFetching && !!author,
  });
}

export function useGetExperiencesByCategory(category: Category) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExperiencesByCategory(category);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetTrendingExperiences(category: Category) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Experience[]>({
    queryKey: ['experiences', 'trending', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrendingExperiences(category);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateExperience() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      thumbnail,
      category,
      gameplayControls,
    }: {
      title: string;
      description: string;
      thumbnail: ExternalBlob | null;
      category: Category;
      gameplayControls: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createExperience(title, description, thumbnail, category, gameplayControls);
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
    mutationFn: async ({
      experienceId,
      isThumbsUp,
    }: {
      experienceId: string;
      isThumbsUp: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rateExperience(experienceId, isThumbsUp);
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
      return actor.incrementPlayerCount(experienceId);
    },
    onSuccess: (_, experienceId) => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
