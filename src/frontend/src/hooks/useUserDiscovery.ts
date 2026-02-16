import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { DiniVerseUser } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<[Principal, DiniVerseUser][]>({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchUsersByDisplayName(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
  });
}
