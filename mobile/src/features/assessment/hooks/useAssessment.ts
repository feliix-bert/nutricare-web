import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { assessmentService } from '@/features/assessment/services/assessment.service';
import type { AssessmentRequestDTO } from '@/features/assessment/types/assessment.types';
import { CHILDREN_QUERY_KEY, childQueryKey } from '@/features/children/hooks/useChildren';

export const ASSESSMENTS_QUERY_KEY = ['assessments'] as const;
export const assessmentQueryKey = (assessmentId: string) =>
  [...ASSESSMENTS_QUERY_KEY, assessmentId] as const;
export const childAssessmentsQueryKey = (childId: string, page = 0, size = 10) =>
  [...ASSESSMENTS_QUERY_KEY, 'child', childId, { page, size }] as const;

export const useAssessment = (assessmentId: string) =>
  useQuery({
    queryKey: assessmentQueryKey(assessmentId),
    queryFn: () => assessmentService.getAssessment(assessmentId),
    enabled: !!assessmentId,
  });

export const useChildAssessments = (childId: string, page = 0, size = 10) =>
  useQuery({
    queryKey: childAssessmentsQueryKey(childId, page, size),
    queryFn: () => assessmentService.getChildAssessments(childId, page, size),
    enabled: !!childId,
  });

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssessmentRequestDTO) => assessmentService.createAssessment(data),
    onSuccess: (assessment) => {
      void queryClient.invalidateQueries({ queryKey: ASSESSMENTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: childQueryKey(assessment.child.id) });
    },
  });
};
