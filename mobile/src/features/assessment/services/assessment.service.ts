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
} from '@/features/assessment/types/assessment.types';

const mockCreateAssessment = async (
  data: AssessmentRequestDTO,
): Promise<AssessmentResponseDTO> => {
  await delay();
  return addMockAssessment(data);
};

const mockGetAssessment = async (
  assessmentId: string,
): Promise<AssessmentResponseDTO> => {
  await delay(400);
  const assessment = getMockAssessments().find((item) => item.id === assessmentId);
  if (!assessment) {
    throw { response: { status: 404, data: { message: 'Assessment tidak ditemukan.' } } };
  }
  return assessment;
};

const mockGetChildAssessments = async (
  childId: string,
  page = 0,
  size = 10,
): Promise<PageResponse<AssessmentResponseDTO>> => {
  await delay();
  const all = getMockAssessments().filter((item) => item.child.id === childId);
  const sliced = all.slice(page * size, page * size + size);
  return {
    data: sliced,
    page,
    size,
    totalElements: all.length,
    totalPages: Math.ceil(all.length / size),
  };
};



const realCreateAssessment = async (
  data: AssessmentRequestDTO,
): Promise<AssessmentResponseDTO> => {
  const res = await apiClient.post<AssessmentResponseDTO>('/api/assessments', data);
  return res.data;
};

const realGetAssessment = async (
  assessmentId: string,
): Promise<AssessmentResponseDTO> => {
  const res = await apiClient.get<AssessmentResponseDTO>(`/api/assessments/${assessmentId}`);
  return res.data;
};

const realGetChildAssessments = async (
  childId: string,
  page = 0,
  size = 10,
): Promise<PageResponse<AssessmentResponseDTO>> => {
  const res = await apiClient.get<PageResponse<AssessmentResponseDTO>>(
    `/api/assessments/child/${childId}`,
    { params: { page, size } },
  );
  return res.data;
};


export const assessmentService = {
  createAssessment: USE_MOCK ? mockCreateAssessment : realCreateAssessment,
  getAssessment: USE_MOCK ? mockGetAssessment : realGetAssessment,
  getChildAssessments: USE_MOCK ? mockGetChildAssessments : realGetChildAssessments,
};
