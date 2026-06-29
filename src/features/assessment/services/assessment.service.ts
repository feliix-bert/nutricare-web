import { apiClient } from '@/services/api';
import { addMockAssessment, delay, USE_MOCK } from '@/services/mock';
import type { AssessmentRequestDTO, AssessmentResponseDTO } from '@/features/assessment/types/assessment.types';

const mockCreateAssessment = async (data: AssessmentRequestDTO): Promise<AssessmentResponseDTO> => {
  await delay(800);
  return addMockAssessment(data);
};

const realCreateAssessment = async (data: AssessmentRequestDTO): Promise<AssessmentResponseDTO> => {
  const res = await apiClient.post<AssessmentResponseDTO>('/api/assessments', data);
  return res.data;
};

export const assessmentService = {
  createAssessment: USE_MOCK ? mockCreateAssessment : realCreateAssessment,
};
