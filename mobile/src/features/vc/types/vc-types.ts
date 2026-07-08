export type VcType = 'ASSESSMENT_RESULT' | 'GROWTH_MILESTONE' | 'NUTRITION_LOG';
export type VcStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';

export type VcSubject = {
  id: string;
  name: string;
  ageMonths: number;
};

export type VcClaims = {
  weight?: number;
  height?: number;
  status?: string;
  assessmentDate?: string;
};

export type VcRecord = {
  id: string;
  childId: string;
  childName: string;
  type: VcType;
  status: VcStatus;
  issuedAt: string;
  issuanceDate?: string;
  expiresAt?: string;
  revokedAt?: string;
  issuer: { id: string; name: string; role: 'MEDIC' | 'ADMIN' };
  ipfsCid: string;
  txHash: string;
  blockNumber?: number;
  credentialHash?: string;
  subject?: VcSubject;
  claims?: VcClaims;
};

// ── Server raw response types ────────────────────────────────────────────

export type ServerIssueVcResponse = {
  id: string;
  childId: string;
  childAnonId: string;
  issuerId: string;
  issuerWallet: string;
  vcType: string;
  ipfsCid: string;
  txHash: string;
  expiresAt: string | null;
  createdAt: string;
  qrPayload: string;
};

export type ServerVcDetailResponse = {
  id: string;
  context?: string[];
  type?: string[];
  issuer: Record<string, unknown>;
  issuanceDate: string;
  expirationDate: string | null;
  credentialSubject: Record<string, unknown>;
  isRevoked: boolean;
  ipfsCid: string;
  txHash: string | null;
};

export type ServerVcStatusResponse = {
  vc: ServerVcDetailResponse | null;
};

export type ServerVerifyQrResponse = {
  valid: boolean;
  vcId: string;
  vcType: string;
  childAnonId: string;
  issuerName: string;
  issuedAt: string;
  expiresAt: string | null;
  isRevoked: boolean;
  verificationMethod: string;
  ipfsCid: string;
};

// ── Request DTOs (match server) ──────────────────────────────────────────

export type VcIssueRequest = {
  childId: string;
  vcType: VcType;
  expiresAt?: string;
};
export type VcRevokeRequest = { vcId: string };
export type VcVerificationResult = { isValid: boolean; vc: VcRecord | null; verifiedAt: string; message: string };
