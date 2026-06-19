import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { nutritionService } from '@/features/nutrition/services/nutrition.service';
import type { NutritionUploadRequest } from '@/features/nutrition/types/nutrition.types';

export const NUTRITION_QUERY_KEY = ['nutrition'] as const;
export const nutritionLogsQueryKey = (childId: string, page = 0, size = 10) =>
  [...NUTRITION_QUERY_KEY, 'child', childId, { page, size }] as const;

export const useNutritionLogs = (childId: string, page = 0, size = 10) =>
  useQuery({
    queryKey: nutritionLogsQueryKey(childId, page, size),
    queryFn: () => nutritionService.getChildNutritionLogs(childId, page, size),
    enabled: !!childId,
  });

export const useUploadNutrition = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: NutritionUploadRequest) => nutritionService.uploadNutrition(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEY });
      if (childId) {
        void queryClient.invalidateQueries({ queryKey: ['nutrition', 'child', childId] });
      }
    },
  });
};

export const useDeleteNutritionLog = (childId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) => nutritionService.deleteNutritionLog(logId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NUTRITION_QUERY_KEY });
      if (childId) {
        void queryClient.invalidateQueries({ queryKey: ['nutrition', 'child', childId] });
      }
    },
  });
};
