import { useMutation } from '@tanstack/react-query';
import { geminiService } from '@/features/gemini/services/gemini-service';
import type { GeminiPredictRequest } from '@/features/gemini/types/gemini-types';

export const useGeminiPrediction = () =>
  useMutation({
    mutationFn: (data: GeminiPredictRequest) => geminiService.predict(data),
  });
