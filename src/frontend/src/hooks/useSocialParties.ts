import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

// Placeholder hooks for party system - backend not yet implemented
export function useGetCurrentParty() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['party', 'current'],
    queryFn: async () => {
      // Backend party methods not yet available
      return null;
    },
    enabled: false,
  });
}
