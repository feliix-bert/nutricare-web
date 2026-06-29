import { apiClient } from '@/services/api';
import type { NutritionLog } from '@/stores/nutritionStore';

// We skip mock for nutrition as we just disabled USE_MOCK globally

export const nutritionService = {
  uploadNutritionPhoto: async (childId: string, photo: File): Promise<NutritionLog> => {
    const formData = new FormData();
    formData.append('childId', childId);
    formData.append('photo', photo);

    const res = await apiClient.post<NutritionLog>('/api/nutrition', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Override global 15s timeout for AI processing
    });
    return res.data;
  },

  getNutritionHistory: async (childId: string, page = 0, size = 10): Promise<{ data: NutritionLog[]; totalElements: number }> => {
    const res = await apiClient.get<{ data: NutritionLog[]; totalElements: number }>(`/api/nutrition/child/${childId}`, {
      params: { page, size },
    });
    return res.data;
  }
};
