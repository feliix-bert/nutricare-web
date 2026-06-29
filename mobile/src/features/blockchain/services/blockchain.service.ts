import { apiClient } from '@/services/api';
import { delay, USE_MOCK, getMockBlockchainVerification } from '@/services/mock';
import type { BlockchainVerificationResult, ServerVerifyResponse } from '../types/blockchain.types';

function toVerificationResult(server: ServerVerifyResponse): BlockchainVerificationResult {
  return {
    assessmentId: server.assessmentId,
    isValid: server.isValid,
    recordHash: server.recordHash,
    txHash: server.txHash,
    blockNumber: server.blockNumber,
    anchorStatus: server.txHash ? 'CONFIRMED' : 'NOT_FOUND',
    explorerUrl: server.explorerUrl,
    verifiedAt: server.anchoredAt,
  };
}

export const blockchainService = {
  verifyAssessment: async (assessmentId: string): Promise<BlockchainVerificationResult> => {
    if (USE_MOCK) {
      await delay(500);
      return getMockBlockchainVerification(assessmentId);
    }
    const res = await apiClient.get<ServerVerifyResponse>(`/api/blockchain/verify/${assessmentId}`);
    return toVerificationResult(res.data);
  },
};
