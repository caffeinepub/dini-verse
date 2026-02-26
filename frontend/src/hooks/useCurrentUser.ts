import { useSessionAuth } from './useSessionAuth';

export function useCurrentUser() {
  const { currentUser, isAuthenticated, isLoading } = useSessionAuth();

  return {
    currentUser,
    isAuthenticated,
    isLoading,
  };
}
