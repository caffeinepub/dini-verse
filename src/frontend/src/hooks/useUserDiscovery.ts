import { useQuery } from "@tanstack/react-query";
import {
  getAllUsers,
  getCurrentUser,
  getUserAvatarUrl,
  getUserDisplayName,
} from "../utils/socialStorage";

export interface DiscoveredUser {
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export function useSearchUsers(searchTerm: string) {
  return useQuery<DiscoveredUser[]>({
    queryKey: ["users", "search", searchTerm],
    queryFn: () => {
      const me = getCurrentUser();
      const allUsers = getAllUsers();
      const lower = searchTerm.toLowerCase();
      return allUsers
        .filter(
          (u) =>
            u !== me &&
            (u.toLowerCase().includes(lower) ||
              getUserDisplayName(u).toLowerCase().includes(lower)),
        )
        .map((username) => ({
          username,
          displayName: getUserDisplayName(username),
          avatarUrl: getUserAvatarUrl(username),
        }))
        .slice(0, 20);
    },
    enabled: searchTerm.trim().length > 0,
  });
}
