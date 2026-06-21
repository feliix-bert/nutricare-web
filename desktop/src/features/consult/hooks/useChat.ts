import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService, buildContextFromPredictionId } from '@/features/consult/services/chat.service';
import { USE_MOCK } from '@/services/mock';
import type { ChatApiRequest, ChatApiResponse, PredictionContext } from '@/features/consult/types/consult.types';

export const chatHistoryQueryKey = (predictionId: string) =>
  ['chat', 'history', predictionId] as const;

// ---------------------------------------------------------------------------
// Hook: load riwayat chat berdasarkan predictionId
// ---------------------------------------------------------------------------

export const useChatHistory = (predictionId: string | null) =>
  useQuery({
    queryKey: chatHistoryQueryKey(predictionId ?? ''),
    queryFn: () => chatService.getHistory(predictionId!),
    enabled: !!predictionId,
    staleTime: 0, // selalu ambil fresh untuk chat
  });

// ---------------------------------------------------------------------------
// Hook: kirim pesan dan mutasi cache
// ---------------------------------------------------------------------------

type SendMessagePayload = {
  predictionId: string;
  message: string;
  context: PredictionContext;
};

export const useSendMessage = (predictionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload): Promise<ChatApiResponse> => {
      if (USE_MOCK) {
        // Mock mode: kirim ke Route Handler Gemini dengan context
        const result = await (chatService.sendMessage as (p: SendMessagePayload) => Promise<ChatApiResponse>)(payload);
        return result;
      }
      // Real mode: kirim ke Spring Boot API
      return chatService.sendMessage({
        predictionId: payload.predictionId,
        message: payload.message,
        context: payload.context,
      });
    },
    onSuccess: () => {
      if (predictionId) {
        void queryClient.invalidateQueries({
          queryKey: chatHistoryQueryKey(predictionId),
        });
      }
    },
  });
};


// ---------------------------------------------------------------------------
// Hook: bangun context dari predictionId (untuk mock mode)
// ---------------------------------------------------------------------------

export const usePredictionContext = (predictionId: string | null): PredictionContext | null => {
  if (!predictionId) return null;
  return buildContextFromPredictionId(predictionId);
};
