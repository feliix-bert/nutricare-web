import { apiClient } from '@/services/api';
import {
  addMockChild,
  delay,
  getMockChildren,
  updateMockChild,
  USE_MOCK,
} from '@/services/mock';
import type { PageResponse } from '@/types/api.types';
import type { Child, ChildDetail, ChildRequest, ChildUpdateRequest } from '@/features/children/types/child.types';

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const mockGetChildren = async (
  page = 0,
  size = 10,
): Promise<PageResponse<Child>> => {
  await delay();
  const all = getMockChildren();
  const sliced = all.slice(page * size, page * size + size);
  return {
    data: sliced,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  };
};

const mockGetChild = async (childId: string): Promise<ChildDetail> => {
  await delay();
  const child = getMockChildren().find((c) => c.id === childId);
  if (!child) throw { response: { status: 404, data: { message: 'Anak tidak ditemukan.' } } };
  return { ...child, assessments: [] };
};

const mockCreateChild = async (data: ChildRequest): Promise<Child> => {
  await delay();
  // Calculate age in months from birthDate
  const birth = new Date(data.birthDate);
  const now = new Date();
  const ageMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  const newChild: Child = {
    id: `child_${Date.now()}`,
    name: data.name,
    birthDate: data.birthDate,
    gender: data.gender,
    ageMonths: Math.max(0, ageMonths),
    latestPrediction: null,
  };
  addMockChild(newChild);
  return newChild;
};

const mockUpdateChild = async (
  childId: string,
  data: ChildUpdateRequest,
): Promise<Child> => {
  await delay();
  const updated = updateMockChild(childId, { name: data.name, birthDate: data.birthDate });
  if (!updated) throw { response: { status: 404, data: { message: 'Anak tidak ditemukan.' } } };
  return updated;
};

// ---------------------------------------------------------------------------
// Real implementations
// ---------------------------------------------------------------------------

const realGetChildren = async (
  page = 0,
  size = 10,
): Promise<PageResponse<Child>> => {
  const res = await apiClient.get<PageResponse<Child>>('/api/children', {
    params: { page, size },
  });
  return res.data;
};

const realGetChild = async (childId: string): Promise<ChildDetail> => {
  const res = await apiClient.get<ChildDetail>(`/api/children/${childId}`);
  return res.data;
};

const realCreateChild = async (data: ChildRequest): Promise<Child> => {
  const res = await apiClient.post<Child>('/api/children', data);
  return res.data;
};

const realUpdateChild = async (
  childId: string,
  data: ChildUpdateRequest,
): Promise<Child> => {
  const res = await apiClient.put<Child>(`/api/children/${childId}`, data);
  return res.data;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const childrenService = {
  getChildren: USE_MOCK ? mockGetChildren : realGetChildren,
  getChild: USE_MOCK ? mockGetChild : realGetChild,
  createChild: USE_MOCK ? mockCreateChild : realCreateChild,
  updateChild: USE_MOCK ? mockUpdateChild : realUpdateChild,
};
