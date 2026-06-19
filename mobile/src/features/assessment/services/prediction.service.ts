import { assessmentService } from '@/features/assessment/services/assessment.service';
import type { AssessmentPredictionDTO } from '@/features/assessment/types/assessment.types';

const getPrediction = async (assessmentId: string): Promise<AssessmentPredictionDTO> => {
  const assessment = await assessmentService.getAssessment(assessmentId);
  return assessment.prediction;
};

export const predictionService = {
  getPrediction,
};
