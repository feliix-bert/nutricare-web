import { useMutation } from '@tanstack/react-query';
import { geminiService } from '@/features/gemini/services/gemini-service';
import type { GeminiNutritionRequest } from '@/features/gemini/types/gemini-types';

export const useGeminiNutrition = () =>
  useMutation({
    mutationFn: (data: GeminiNutritionRequest) => geminiService.analyzeNutrition(data),
  });
