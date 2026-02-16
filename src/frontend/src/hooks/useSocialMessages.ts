import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';
import type { Message } from '../backend';

export function useGetMessages(receiver: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', receiver?.toString()],
    queryFn: async () => {
      if (!actor || !receiver) return [];
      return actor.getMessages(receiver);
    },
    enabled: !!actor && !actorFetching && !!receiver,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      receiver,
      content,
    }: {
      receiver: Principal;
      content: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage({ receiver, content });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver.toString()] });
    },
  });
}
