import { apiClient } from '@/services/api';
import {
  addMockAssessment,
  delay,
  getMockAssessments,
  USE_MOCK,
} from '@/services/mock';
import type { PageResponse } from '@/types/api.types';
import type {
  AssessmentRequestDTO,
  AssessmentResponseDTO,
  ServerPredictionResponse,
  AssessmentPredictionDTO,
  BlockchainAnchorDTO,
} from '@/features/assessment/types/assessment.types';

// ── Transform helpers ────────────────────────────────────────────────────

function toAssessmentPredictionDTO(server: ServerPredictionResponse): AssessmentPredictionDTO {
  return {
    id: server.id,
    status: server.status,
    predictionStatus: server.predictionStatus,
    zscoreWa: server.zscoreWa ?? 0,
    zscoreHa: server.zscoreHa ?? 0,
    zscoreWh: server.zscoreWh ?? 0,
    riskLevel: server.riskLevel ?? 0,
    summary: server.summary ?? '',
    recommendations: server.recommendations ?? [],
    nextAssessmentDate: server.nextAssessmentDate ?? '',
    disclaimer: server.disclaimer ?? '',
  };
}

function toBlockchainAnchorDTO(blockchain: ServerPredictionResponse['blockchain'] | null, assessmentId: string): BlockchainAnchorDTO | undefined {
  if (!blockchain) return undefined;
  return {
    id: '',
    anchored: blockchain.anchorStatus === 'CONFIRMED' || blockchain.isVerified === true,
    recordHash: '',
    txHash: blockchain.txHash ?? '',
    blockNumber: 0,
    anchorStatus: (blockchain.anchorStatus as 'CONFIRMED' | 'PENDING') || 'PENDING',
    explorerUrl: blockchain.polygonscanUrl ?? '',
    verifyUrl: `/api/blockchain/verify/${assessmentId}`,
  };
}

function toAssessmentResponseDTO(server: ServerPredictionResponse, child?: { id: string; name: string; ageMonths?: number }): AssessmentResponseDTO {
  return {
    id: server.assessmentId,
    child: child ?? { id: server.childId, name: server.childName },
    createdAt: server.createdAt,
    prediction: toAssessmentPredictionDTO(server),
    blockchain: toBlockchainAnchorDTO(server.blockchain, server.assessmentId),
  };
}

// ── Service ──────────────────────────────────────────────────────────────

export const assessmentService = {
  createAssessment: async (data: AssessmentRequestDTO): Promise<AssessmentResponseDTO> => {
    if (USE_MOCK) {
      await delay();
      return addMockAssessment(data);
    }
    const res = await apiClient.post<ServerPredictionResponse>('/api/assessments', data);
    return toAssessmentResponseDTO(res.data, { id: data.childId, name: '' });
  },

  getAssessment: async (assessmentId: string): Promise<AssessmentResponseDTO> => {
    if (USE_MOCK) {
      await delay(400);
      const assessment = getMockAssessments().find((item) => item.id === assessmentId);
      if (!assessment) throw { response: { status: 404, data: { message: 'Assessment tidak ditemukan.' } } };
      return assessment;
    }
    const res = await apiClient.get<ServerPredictionResponse>(`/api/assessments/${assessmentId}`);
    return toAssessmentResponseDTO(res.data);
  },

  getChildAssessments: async (childId: string, page = 0, size = 10): Promise<PageResponse<AssessmentResponseDTO>> => {
    if (USE_MOCK) {
      await delay();
      const all = getMockAssessments().filter((item) => item.child.id === childId);
      const sliced = all.slice(page * size, page * size + size);
      return { data: sliced, page, size, totalElements: all.length, totalPages: Math.ceil(all.length / size) };
    }
    const res = await apiClient.get<PageResponse<ServerPredictionResponse>>(`/api/assessments/child/${childId}`, { params: { page, size } });
    return { ...res.data, data: res.data.data.map((s) => toAssessmentResponseDTO(s)) };
  },
};
