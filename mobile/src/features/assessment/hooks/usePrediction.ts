import { useQuery } from '@tanstack/react-query';

import { predictionService } from '@/features/assessment/services/prediction.service';

export const predictionQueryKey = (assessmentId: string) =>
  ['prediction', assessmentId] as const;

export const usePrediction = (assessmentId: string) =>
  useQuery({
    queryKey: predictionQueryKey(assessmentId),
    queryFn: () => predictionService.getPrediction(assessmentId),
    enabled: !!assessmentId,
    refetchInterval: (query) => {
      const status = query.state.data?.predictionStatus;
      return status === 'PENDING' ? 1500 : false;
    },
  });
