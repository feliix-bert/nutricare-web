import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { chatService } from '@/features/consult/services/chat.service';
import type { ChatApiResponse, PredictionContext } from '@/features/consult/types/consult.types';
import { apiClient } from '@/services/api';

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
// Sesuai ARCHITECTURE.md: semua AI dipanggil oleh Spring Boot.
// Mock mode maupun real mode sama-sama meneruskan request ke Spring Boot.
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
      // Baik mock mode maupun real mode: teruskan ke Spring Boot via chatService
      return chatService.sendMessage({
        predictionId: payload.predictionId,
        message: payload.message,
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
// Hook: bangun context dari predictionId (untuk keperluan UI)
// ---------------------------------------------------------------------------

export const usePredictionContextQuery = (predictionId: string | null) =>
  useQuery({
    queryKey: ['assessment', predictionId],
    queryFn: async () => {
      const res = await apiClient.get<import('@/features/assessment/types/assessment.types').AssessmentResponseDTO>(`/api/assessments/${predictionId}`);
      const data = res.data;
      const ctx: PredictionContext = {
        predictionId: data.prediction.id,
        childName: data.child.name,
        ageMonths: data.child.ageMonths,
        gender: 'MALE', // Hardcoded as AssessmentResponseDTO doesn't include gender for now
        status: data.prediction.status,
        zscoreHa: data.prediction.zscoreHa,
        zscoreWa: data.prediction.zscoreWa,
        zscoreWh: data.prediction.zscoreWh,
        summary: data.prediction.summary,
        recommendations: data.prediction.recommendations,
      };
      return ctx;
    },
    enabled: !!predictionId,
    staleTime: 5 * 60 * 1000,
  });
