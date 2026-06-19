import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService } from '@/features/chat/services/chat.service';
import type { ChatRequest } from '@/features/chat/types/chat.types';

export const CHAT_QUERY_KEY = ['chat'] as const;
export const chatHistoryQueryKey = (predictionId: string) =>
  [...CHAT_QUERY_KEY, predictionId] as const;

export const useChatHistory = (predictionId: string) =>
  useQuery({
    queryKey: chatHistoryQueryKey(predictionId),
    queryFn: () => chatService.getChatHistory(predictionId),
    enabled: !!predictionId,
  });

export const useSendChatMessage = (predictionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      chatService.sendMessage({ predictionId, message } satisfies ChatRequest),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatHistoryQueryKey(predictionId) });
    },
  });
};
