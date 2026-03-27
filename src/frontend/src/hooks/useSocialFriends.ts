import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { pushNotification } from "../components/notifications/NotificationsPanel";
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

/** Registers a storage-event listener + 1s interval to keep a query fresh. */
function useSyncedQuery(queryKey: unknown[]) {
  const queryClient = useQueryClient();
  // biome-ignore lint/correctness/useExhaustiveDependencies: queryKey is intentionally excluded to avoid infinite re-registration
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey });
    const handler = (e: StorageEvent) => {
      if (
        e.key === "diniverse_social_sync" ||
        e.key === "diniverse_social_sync_ts" ||
        e.key?.startsWith("diniverse_friend_requests_")
      ) {
        invalidate();
      }
    };
    window.addEventListener("storage", handler);
    const id = setInterval(invalidate, 1000);
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);
}

export function useGetFriends() {
  useSyncedQuery(["social", "friends"]);
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
  });
}

export function useGetIncomingRequests() {
  useSyncedQuery(["social", "requests", "incoming"]);
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
  });
}

export function useGetOutgoingRequests() {
  useSyncedQuery(["social", "requests", "outgoing"]);
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
      return { me, targetUsername };
    },
    onSuccess: (_data, targetUsername) => {
      const me = getCurrentUser();
      if (me) {
        const myDisplayName = getUserDisplayName(me);
        pushNotification(targetUsername, {
          type: "friend_request",
          title: "Friend Request",
          message: `${myDisplayName} sent you a friend request!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["social"] });
      window.dispatchEvent(
        new StorageEvent("storage", { key: "diniverse_social_sync" }),
      );
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
      return { from, action, me };
    },
    onMutate: async ({ from, action }) => {
      await queryClient.cancelQueries({ queryKey: ["social"] });
      const prevIncoming = queryClient.getQueryData([
        "social",
        "requests",
        "incoming",
      ]);
      const prevFriends = queryClient.getQueryData(["social", "friends"]);
      // Optimistically remove from incoming
      queryClient.setQueryData(
        ["social", "requests", "incoming"],
        (old: { from: string }[] | undefined) =>
          (old ?? []).filter((r) => r.from !== from),
      );
      if (action === "accept") {
        const me = getCurrentUser();
        queryClient.setQueryData(
          ["social", "friends"],
          (old: FriendInfo[] | undefined) => [
            ...(old ?? []),
            {
              username: from,
              displayName: getUserDisplayName(from),
              avatarUrl: getUserAvatarUrl(from),
              isOnline: me ? getUserVisibility(from) === "online" : false,
            },
          ],
        );
      }
      return { prevIncoming, prevFriends };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevIncoming)
        queryClient.setQueryData(
          ["social", "requests", "incoming"],
          ctx.prevIncoming,
        );
      if (ctx?.prevFriends)
        queryClient.setQueryData(["social", "friends"], ctx.prevFriends);
    },
    onSuccess: (data) => {
      if (data && data.action === "accept") {
        const myDisplayName = getUserDisplayName(data.me);
        pushNotification(data.from, {
          type: "friend_accepted",
          title: "Friend Request Accepted",
          message: `${myDisplayName} accepted your friend request!`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["social"] });
      window.dispatchEvent(
        new StorageEvent("storage", { key: "diniverse_social_sync" }),
      );
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
    onMutate: async (targetUsername) => {
      await queryClient.cancelQueries({ queryKey: ["social", "friends"] });
      const prevFriends = queryClient.getQueryData(["social", "friends"]);
      queryClient.setQueryData(
        ["social", "friends"],
        (old: FriendInfo[] | undefined) =>
          (old ?? []).filter((f) => f.username !== targetUsername),
      );
      return { prevFriends };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevFriends)
        queryClient.setQueryData(["social", "friends"], ctx.prevFriends);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social"] });
      window.dispatchEvent(
        new StorageEvent("storage", { key: "diniverse_social_sync" }),
      );
    },
  });
}

export function useSearchUsers(searchTerm: string) {
  useSyncedQuery(["social", "search", searchTerm]);
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
  });
}
