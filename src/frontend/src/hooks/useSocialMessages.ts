import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
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
  const queryClient = useQueryClient();
  const queryKey = ["social", "messages", friendUsername];

  // biome-ignore lint/correctness/useExhaustiveDependencies: queryKey array is intentionally stable
  useEffect(() => {
    if (!friendUsername) return;
    const me = getCurrentUser();
    if (!me) return;
    const sorted = [me, friendUsername].sort();
    const msgKey = `diniverse_messages_${sorted[0]}_${sorted[1]}`;

    const handler = (e: StorageEvent) => {
      if (e.key === msgKey || e.key === "diniverse_social_sync") {
        queryClient.invalidateQueries({ queryKey });
      }
    };
    window.addEventListener("storage", handler);
    const id = setInterval(
      () => queryClient.invalidateQueries({ queryKey }),
      1000,
    );
    return () => {
      window.removeEventListener("storage", handler);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendUsername, queryClient]);

  return useQuery<ChatMessage[]>({
    queryKey,
    queryFn: () => {
      const me = getCurrentUser();
      if (!me || !friendUsername) return [];
      return getMessages(me, friendUsername);
    },
    enabled: !!friendUsername,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content }: { to: string; content: string }) => {
      const me = getCurrentUser();
      if (!me) throw new Error("Not authenticated");
      const msgs = getMessages(me, to);
      const newMsg: ChatMessage = {
        id: genId(),
        sender: me,
        type: "text",
        content,
        timestamp: Date.now(),
        deleted: false,
      };
      msgs.push(newMsg);
      saveMessages(me, to, msgs);
      return { to, msg: newMsg };
    },
    onMutate: async ({ to, content }) => {
      const me = getCurrentUser();
      if (!me) return;
      await queryClient.cancelQueries({
        queryKey: ["social", "messages", to],
      });
      const prev = queryClient.getQueryData(["social", "messages", to]);
      const optimistic: ChatMessage = {
        id: `opt_${Date.now()}`,
        sender: me,
        type: "text",
        content,
        timestamp: Date.now(),
        deleted: false,
      };
      queryClient.setQueryData(
        ["social", "messages", to],
        (old: ChatMessage[] | undefined) => [...(old ?? []), optimistic],
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["social", "messages", vars.to], ctx.prev);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", data.to],
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
      const newMsg: ChatMessage = {
        id: genId(),
        sender: me,
        type: mediaType,
        content: dataUrl,
        timestamp: Date.now(),
        deleted: false,
      };
      msgs.push(newMsg);
      saveMessages(me, to, msgs);
      return { to, msg: newMsg };
    },
    onMutate: async ({ to, dataUrl, mediaType }) => {
      const me = getCurrentUser();
      if (!me) return;
      await queryClient.cancelQueries({
        queryKey: ["social", "messages", to],
      });
      const prev = queryClient.getQueryData(["social", "messages", to]);
      const optimistic: ChatMessage = {
        id: `opt_${Date.now()}`,
        sender: me,
        type: mediaType,
        content: dataUrl,
        timestamp: Date.now(),
        deleted: false,
      };
      queryClient.setQueryData(
        ["social", "messages", to],
        (old: ChatMessage[] | undefined) => [...(old ?? []), optimistic],
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["social", "messages", vars.to], ctx.prev);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", data.to],
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
      const newMsg: ChatMessage = {
        id: genId(),
        sender: me,
        type: "gif",
        content: gifUrl,
        gifUrl,
        timestamp: Date.now(),
        deleted: false,
      };
      msgs.push(newMsg);
      saveMessages(me, to, msgs);
      return { to, msg: newMsg };
    },
    onMutate: async ({ to, gifUrl }) => {
      const me = getCurrentUser();
      if (!me) return;
      await queryClient.cancelQueries({
        queryKey: ["social", "messages", to],
      });
      const prev = queryClient.getQueryData(["social", "messages", to]);
      const optimistic: ChatMessage = {
        id: `opt_${Date.now()}`,
        sender: me,
        type: "gif",
        content: gifUrl,
        gifUrl,
        timestamp: Date.now(),
        deleted: false,
      };
      queryClient.setQueryData(
        ["social", "messages", to],
        (old: ChatMessage[] | undefined) => [...(old ?? []), optimistic],
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["social", "messages", vars.to], ctx.prev);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", data.to],
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
      return { friendUsername };
    },
    onMutate: async ({ friendUsername, messageId }) => {
      const me = getCurrentUser();
      if (!me) return;
      await queryClient.cancelQueries({
        queryKey: ["social", "messages", friendUsername],
      });
      const prev = queryClient.getQueryData([
        "social",
        "messages",
        friendUsername,
      ]);
      queryClient.setQueryData(
        ["social", "messages", friendUsername],
        (old: ChatMessage[] | undefined) =>
          (old ?? []).map((m) =>
            m.id === messageId && m.sender === me ? { ...m, deleted: true } : m,
          ),
      );
      return { prev };
    },
    onError: (_err, vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(
          ["social", "messages", vars.friendUsername],
          ctx.prev,
        );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["social", "messages", data.friendUsername],
      });
    },
  });
}
