import { useQuery } from '@tanstack/react-query';
import { blockchainService } from '../services/blockchain-service';

export const useVerifyBlockchain = (assessmentId: string) => {
  return useQuery({
    queryKey: ['blockchainVerify', assessmentId],
    queryFn: () => blockchainService.verifyAssessment(assessmentId),
    enabled: !!assessmentId,
  });
};
