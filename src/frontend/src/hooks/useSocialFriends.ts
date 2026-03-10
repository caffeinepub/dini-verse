import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  getCurrentUser,
  getFriends,
  getPendingIncoming,
  getPendingOutgoing,
  getUserAvatarUrl,
  getUserDisplayName,
  getUserVisibility,
  hasPendingRequestTo,
  isFriendWith,
  respondToRequest,
  sendFriendRequest,
  unfriend,
} from "../utils/socialStorage";

export interface FriendInfo {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
}

export interface UserSearchResult {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: "none" | "pending_outgoing" | "pending_incoming" | "friends";
}

export function useGetFriends() {
  return useQuery<FriendInfo[]>({
    queryKey: ["social", "friends"],
    queryFn: () => {
      const me = getCurrentUser();
      if (!me) return [];
      return getFriends(me).map((username) => ({
        username,
        displayName: getUserDisplayName(username),
        avatarUrl: getUserAvatarUrl(username),
        isOnline: getUserVisibility(username) === "online",
      }));
    },
    refetchInterval: 5000,
  });
}

export function useGetIncomingRequests() {
  return useQuery({
    queryKey: ["social", "requests", "incoming"],
    queryFn: () => {
      const me = getCurrentUser();
      if (!me) return [];
      return getPendingIncoming(me).map((r) => ({
        ...r,
        fromDisplayName: getUserDisplayName(r.from),
        fromAvatarUrl: getUserAvatarUrl(r.from),
      }));
    },
    refetchInterval: 5000,
  });
}

export function useGetOutgoingRequests() {
  return useQuery({
    queryKey: ["social", "requests", "outgoing"],
    queryFn: () => {
      const me = getCurrentUser();
      if (!me) return [];
      return getPendingOutgoing(me).map((r) => ({
        ...r,
        toDisplayName: getUserDisplayName(r.to),
        toAvatarUrl: getUserAvatarUrl(r.to),
      }));
    },
    refetchInterval: 5000,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUsername: string) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      if (targetUsername === me)
        throw new Error("Cannot send friend request to yourself");
      if (isFriendWith(me, targetUsername)) throw new Error("Already friends");
      if (hasPendingRequestTo(me, targetUsername))
        throw new Error("Friend request already sent");
      sendFriendRequest(me, targetUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useRespondToFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      from,
      action,
    }: {
      from: string;
      action: "accept" | "decline";
    }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      respondToRequest(from, me, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useUnfriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUsername: string) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      unfriend(me, targetUsername);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
  });
}

export function useSearchUsers(searchTerm: string) {
  return useQuery<UserSearchResult[]>({
    queryKey: ["social", "search", searchTerm],
    queryFn: () => {
      const me = getCurrentUser();
      if (!me || !searchTerm.trim()) return [];
      const allUsers = getAllUsers();
      const lower = searchTerm.toLowerCase();
      return allUsers
        .filter(
          (u) =>
            u !== me &&
            (u.toLowerCase().includes(lower) ||
              getUserDisplayName(u).toLowerCase().includes(lower)),
        )
        .map((username) => {
          let status: UserSearchResult["status"] = "none";
          if (isFriendWith(me, username)) {
            status = "friends";
          } else if (hasPendingRequestTo(me, username)) {
            status = "pending_outgoing";
          } else {
            // check if they sent to me
            const incoming = getPendingIncoming(me);
            if (incoming.some((r) => r.from === username)) {
              status = "pending_incoming";
            }
          }
          return {
            username,
            displayName: getUserDisplayName(username),
            avatarUrl: getUserAvatarUrl(username),
            status,
          };
        })
        .slice(0, 20);
    },
    enabled: searchTerm.trim().length > 0,
    refetchInterval: 3000,
  });
}
