import { useSessionAuth } from './useSessionAuth';

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useSessionAuth();

  return {
    currentUser: isAuthenticated && user ? {
      username: user.username,
      displayName: user.displayName,
    } : null,
    isAuthenticated,
    isLoading,
  };
}
