import { apiClient } from '@/services/api';
import {
  addMockChild,
  delay,
  getMockChildren,
  updateMockChild,
  getMockAssessments,
  USE_MOCK,
} from '@/services/mock';
import type { PageResponse } from '@/types/api.types';
import type { Child, ChildDetail, ChildRequest, ChildUpdateRequest, LatestPrediction } from '@/features/children/types/child.types';

// ── Server raw types ─────────────────────────────────────────────────────

type ServerChildResponse = {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  anonId?: string;
  ageMonths: number;
  createdAt?: string;
  latestPrediction?: {
    status: string;
    riskLevel?: number;
    createdAt: string;
  } | null;
};

type ServerChildDetailResponse = ServerChildResponse & {
  assessments: Array<{
    id: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
    bfExclusive?: boolean;
    mpasiAge?: number;
    mealFreq?: number;
    illnessHistory?: string;
    createdAt: string;
    prediction?: {
      id?: string;
      status: string;
      predictionStatus?: string;
      riskLevel: number;
      zscoreWa?: number;
      zscoreHa?: number;
      zscoreWh?: number;
      summary?: string;
      recommendations?: string[];
      nextAssessmentDate?: string;
      createdAt?: string;
    } | null;
  }>;
};

// ── Transform helpers ────────────────────────────────────────────────────

function toChild(server: ServerChildResponse): Child {
  const pred = server.latestPrediction;
  return {
    id: server.id,
    name: server.name,
    birthDate: server.birthDate,
    gender: server.gender as Child['gender'],
    ageMonths: server.ageMonths,
    anonId: server.anonId,
    createdAt: server.createdAt,
    latestPrediction: pred
      ? { status: pred.status as LatestPrediction['status'], riskLevel: pred.riskLevel, createdAt: pred.createdAt }
      : null,
  };
}

function toChildDetail(server: ServerChildDetailResponse): ChildDetail {
  const child = toChild(server);
  return {
    ...child,
    assessments: (server.assessments ?? []).map((a) => ({
      id: a.id,
      weight: a.weight ?? 0,
      height: a.height ?? 0,
      headCircumference: a.headCircumference,
      bfExclusive: a.bfExclusive,
      mpasiAge: a.mpasiAge,
      mealFreq: a.mealFreq,
      illnessHistory: a.illnessHistory,
      createdAt: a.createdAt,
      prediction: a.prediction
        ? {
            id: a.prediction.id,
            status: a.prediction.status as LatestPrediction['status'],
            predictionStatus: a.prediction.predictionStatus as 'COMPLETED' | 'PENDING' | 'FAILED' | undefined,
            riskLevel: a.prediction.riskLevel,
            zscoreWa: a.prediction.zscoreWa,
            zscoreHa: a.prediction.zscoreHa,
            zscoreWh: a.prediction.zscoreWh,
            summary: a.prediction.summary,
            recommendations: a.prediction.recommendations,
            nextAssessmentDate: a.prediction.nextAssessmentDate,
            createdAt: a.prediction.createdAt,
          }
        : undefined,
    })),
  };
}

// ── Service ──────────────────────────────────────────────────────────────

export const childrenService = {
  getChildren: async (page = 0, size = 10): Promise<PageResponse<Child>> => {
    if (USE_MOCK) {
      await delay();
      const all = getMockChildren();
      const sliced = all.slice(page * size, page * size + size);
      return { data: sliced, page, size, totalElements: all.length, totalPages: Math.ceil(all.length / size) };
    }
    const res = await apiClient.get<PageResponse<ServerChildResponse>>('/api/children', { params: { page, size } });
    return { ...res.data, data: res.data.data.map(toChild) };
  },

  getChild: async (childId: string): Promise<ChildDetail> => {
    if (USE_MOCK) {
      await delay();
      const child = getMockChildren().find((c) => c.id === childId);
      if (!child) throw { response: { status: 404, data: { message: 'Anak tidak ditemukan.' } } };
      const assessments = getMockAssessments()
        .filter((a) => a.child.id === childId)
        .map((a) => ({
          id: a.id,
          weight: a.weight ?? 0,
          height: a.height ?? 0,
          createdAt: a.createdAt,
          prediction: { status: a.prediction.status, riskLevel: a.prediction.riskLevel },
        }));
      return { ...child, assessments };
    }
    const res = await apiClient.get<ServerChildDetailResponse>(`/api/children/${childId}`);
    return toChildDetail(res.data);
  },

  createChild: async (data: ChildRequest): Promise<Child> => {
    if (USE_MOCK) {
      await delay();
      const birth = new Date(data.birthDate);
      const now = new Date();
      const ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      const newChild: Child = { id: `child_${Date.now()}`, name: data.name, birthDate: data.birthDate, gender: data.gender, ageMonths: Math.max(0, ageMonths), latestPrediction: null };
      addMockChild(newChild);
      return newChild;
    }
    const res = await apiClient.post<ServerChildResponse>('/api/children', data);
    return toChild(res.data);
  },

  updateChild: async (childId: string, data: ChildUpdateRequest): Promise<Child> => {
    if (USE_MOCK) {
      await delay();
      const updated = updateMockChild(childId, { name: data.name, birthDate: data.birthDate });
      if (!updated) throw { response: { status: 404, data: { message: 'Anak tidak ditemukan.' } } };
      return updated;
    }
    const res = await apiClient.put<ServerChildResponse>(`/api/children/${childId}`, data);
    return toChild(res.data);
  },
};
