import { useQuery } from '@tanstack/react-query';
import { nutritionService } from '@/features/nutrition/services/nutrition.service';

export const NUTRITION_QUERY_KEY = ['nutrition'] as const;

export const useNutritionHistory = (childId: string, page = 0, size = 100) =>
  useQuery({
    queryKey: [...NUTRITION_QUERY_KEY, childId, { page, size }],
    queryFn: () => nutritionService.getNutritionHistory(childId, page, size),
    enabled: !!childId,
  });
