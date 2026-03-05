import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";

// Temporary user type until backend is updated
interface UserData {
  displayName: string;
  avatar?: any;
}

export function useSearchUsers(searchTerm: string) {
  return useQuery<Array<[Principal, UserData]>>({
    queryKey: ["users", "search", searchTerm],
    queryFn: async () => {
      // Backend method doesn't exist yet - return empty array
      // TODO: Replace with session-based user search
      return [];
    },
    enabled: false, // Disabled until backend implements session auth
  });
}
