import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ChatMessage,
  getCurrentUser,
  getMessages,
  saveMessages,
} from "../utils/socialStorage";

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export type { ChatMessage };

export function useGetMessages(friendUsername: string | null) {
  return useQuery<ChatMessage[]>({
    queryKey: ["social", "messages", friendUsername],
    queryFn: () => {
      const me = getCurrentUser();
      if (!me || !friendUsername) return [];
      return getMessages(me, friendUsername);
    },
    enabled: !!friendUsername,
    refetchInterval: 2000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      content,
    }: {
      to: string;
      content: string;
    }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      const msgs = getMessages(me, to);
      msgs.push({
        id: genId(),
        sender: me,
        type: "text",
        content,
        timestamp: Date.now(),
        deleted: false,
      });
      saveMessages(me, to, msgs);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", variables.to],
      });
    },
  });
}

export function useSendMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      to,
      dataUrl,
      mediaType,
    }: {
      to: string;
      dataUrl: string;
      mediaType: "image" | "video";
    }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      const msgs = getMessages(me, to);
      msgs.push({
        id: genId(),
        sender: me,
        type: mediaType,
        content: dataUrl,
        timestamp: Date.now(),
        deleted: false,
      });
      saveMessages(me, to, msgs);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", variables.to],
      });
    },
  });
}

export function useSendGif() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, gifUrl }: { to: string; gifUrl: string }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      const msgs = getMessages(me, to);
      msgs.push({
        id: genId(),
        sender: me,
        type: "gif",
        content: gifUrl,
        gifUrl,
        timestamp: Date.now(),
        deleted: false,
      });
      saveMessages(me, to, msgs);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", variables.to],
      });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      friendUsername,
      messageId,
    }: {
      friendUsername: string;
      messageId: string;
    }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      const msgs = getMessages(me, friendUsername);
      const updated = msgs.map((m) =>
        m.id === messageId && m.sender === me ? { ...m, deleted: true } : m,
      );
      saveMessages(me, friendUsername, updated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", variables.friendUsername],
      });
    },
  });
}
