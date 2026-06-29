export type BlockchainVerificationResult = {
  assessmentId: string;
  isValid: boolean;
  recordHash: string;
  txHash: string;
  blockNumber: number;
  anchorStatus: 'CONFIRMED' | 'PENDING' | 'NOT_FOUND';
  explorerUrl: string;
  verifiedAt: string;
};

export type BlockchainAnchor = {
  id: string;
  assessmentId: string;
  anchored: boolean;
  recordHash: string;
  txHash: string;
  blockNumber: number;
  anchorStatus: 'CONFIRMED' | 'PENDING';
  explorerUrl: string;
};

// ── Server raw response types ────────────────────────────────────────────

export type ServerVerifyResponse = {
  assessmentId: string;
  isValid: boolean;
  recordHash: string;
  anchoredAt: string;
  txHash: string;
  blockNumber: number;
  explorerUrl: string;
};
