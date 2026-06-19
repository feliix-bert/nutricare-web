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

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const mockUploadNutrition = async (
  data: NutritionUploadRequest,
): Promise<NutritionLog> => {
  await delay(1200);
  return addMockNutritionLog(data);
};

const mockGetChildNutritionLogs = async (
  childId: string,
  page = 0,
  size = 10,
): Promise<PageResponse<NutritionLog>> => {
  await delay();
  const all = getMockNutritionLogs().filter((log) => log.childId === childId);
  const sliced = all.slice(page * size, page * size + size);
  return {
    data: sliced,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  };
};

const mockDeleteNutritionLog = async (logId: string): Promise<void> => {
  await delay(250);
  removeMockNutritionLog(logId);
};

// ---------------------------------------------------------------------------
// Real implementations
// ---------------------------------------------------------------------------

const realUploadNutrition = async (
  data: NutritionUploadRequest,
): Promise<NutritionLog> => {
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
};

const realGetChildNutritionLogs = async (
  childId: string,
  page = 0,
  size = 10,
): Promise<PageResponse<NutritionLog>> => {
  const res = await apiClient.get<PageResponse<NutritionLog>>(
    `/api/nutrition/child/${childId}`,
    { params: { page, size } },
  );
  return res.data;
};

const realDeleteNutritionLog = async (logId: string): Promise<void> => {
  await apiClient.delete(`/api/nutrition/${logId}`);
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const nutritionService = {
  uploadNutrition: USE_MOCK ? mockUploadNutrition : realUploadNutrition,
  getChildNutritionLogs: USE_MOCK ? mockGetChildNutritionLogs : realGetChildNutritionLogs,
  deleteNutritionLog: USE_MOCK ? mockDeleteNutritionLog : realDeleteNutritionLog,
};
