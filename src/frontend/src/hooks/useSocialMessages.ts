import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

// Define Message type locally since backend doesn't export it yet
export interface Message {
  id: number;
  sender: Principal;
  receiver: Principal;
  content: string;
  timestamp: bigint;
  read: boolean;
}

export function useGetMessages(receiver: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', receiver?.toString()],
    queryFn: async () => {
      if (!actor || !receiver) return [];
      // TODO: Backend method not yet implemented
      return [];
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
      // TODO: Backend method not yet implemented
      throw new Error('sendMessage not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver.toString()] });
    },
  });
}
