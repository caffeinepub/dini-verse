import { useInternetIdentity } from './useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserRole } from '../backend';

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal();

  const roleQuery = useQuery<UserRole>({
    queryKey: ['currentUserRole', principal?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  return {
    isAuthenticated,
    principal,
    role: roleQuery.data,
    isLoading: actorFetching || roleQuery.isLoading,
  };
}
