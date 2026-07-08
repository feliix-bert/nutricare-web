import { apiClient } from '@/services/api';
import type { BlockchainVerificationResult, ServerVerifyResponse } from '../types/blockchain-types';

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
    const res = await apiClient.get<ServerVerifyResponse>(`/api/blockchain/verify/${assessmentId}`);
    return toVerificationResult(res.data);
  },
};
