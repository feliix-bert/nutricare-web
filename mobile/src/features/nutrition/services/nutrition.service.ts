import { apiClient } from '@/services/api';
import {
  addMockNutritionLog,
  delay,
  getMockNutritionLogs,
  removeMockNutritionLog,
  USE_MOCK,
} from '@/services/mock';
import type { PageResponse } from '@/types/api.types';
import type {
  NutritionLog,
  NutritionUploadRequest,
} from '@/features/nutrition/types/nutrition.types';

export const nutritionService = {
  uploadNutrition: async (data: NutritionUploadRequest): Promise<NutritionLog> => {
    if (USE_MOCK) {
      await delay(1200);
      return addMockNutritionLog(data);
    }
    const formData = new FormData();
    formData.append('childId', data.childId);
    formData.append('photo', {
      uri: data.photo.uri,
      name: data.photo.name ?? 'food-photo.jpg',
      type: data.photo.type ?? 'image/jpeg',
    } as unknown as Blob);
    const res = await apiClient.post<NutritionLog>('/api/nutrition', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getChildNutritionLogs: async (childId: string, page = 0, size = 10): Promise<PageResponse<NutritionLog>> => {
    if (USE_MOCK) {
      await delay();
      const all = getMockNutritionLogs().filter((log) => log.childId === childId);
      const sliced = all.slice(page * size, page * size + size);
      return { data: sliced, page, size, totalElements: all.length, totalPages: Math.ceil(all.length / size) };
    }
    const res = await apiClient.get<PageResponse<NutritionLog>>(`/api/nutrition/child/${childId}`, { params: { page, size } });
    return res.data;
  },

  deleteNutritionLog: async (logId: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(250);
      removeMockNutritionLog(logId);
      return;
    }
    await apiClient.delete(`/api/nutrition/${logId}`);
  },
};
