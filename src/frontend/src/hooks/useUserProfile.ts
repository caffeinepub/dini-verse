import { useQuery } from "@tanstack/react-query";
import { getCurrentUsername, getLocalSettings } from "./useAccountSettings";
import { useSessionAuth } from "./useSessionAuth";

interface LocalUserProfile {
  displayName: string;
  avatarDataUrl: string | null;
}

/** Get current user's profile from localStorage — never calls the backend */
export function useGetCurrentUserProfile() {
  const { isAuthenticated } = useSessionAuth();

  const query = useQuery<LocalUserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: () => {
      const username = getCurrentUsername();
      if (!username) return null;
      const settings = getLocalSettings(username);
      return {
        displayName: settings.displayName,
        avatarDataUrl: settings.avatarDataUrl,
      };
    },
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    isLoading: query.isLoading,
  };
}

/** Get another user's profile — returns null (no backend user lookup needed) */
export function useGetUserProfile(_principal: unknown) {
  return useQuery<LocalUserProfile | null>({
    queryKey: ["userProfile", String(_principal)],
    queryFn: () => null,
    enabled: false,
  });
}

/** Legacy compat — kept for import compatibility but not used */
export function useSignUp() {
  return {
    mutateAsync: async (_data: unknown) => {
      throw new Error("Use useSessionAuth.signup instead");
    },
    isPending: false,
    isError: false,
  };
}
