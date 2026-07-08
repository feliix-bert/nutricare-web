import { apiClient } from '@/services/api';
import type {
  VcRecord,
  VcIssueRequest,
  VcRevokeRequest,
  VcVerificationResult,
  ServerIssueVcResponse,
  ServerVcDetailResponse,
  ServerVcStatusResponse,
} from '../types/vc-types';

// ── Transform helpers ────────────────────────────────────────────────────

function toVcRecordFromIssue(server: ServerIssueVcResponse): VcRecord {
  return {
    id: server.id,
    childId: server.childId,
    childName: '',
    type: (server.vcType as VcRecord['type']) ?? 'ASSESSMENT_RESULT',
    status: 'ACTIVE',
    issuedAt: server.createdAt,
    expiresAt: server.expiresAt ?? undefined,
    issuer: { id: server.issuerId, name: server.issuerWallet, role: 'MEDIC' },
    ipfsCid: server.ipfsCid,
    txHash: server.txHash,
    credentialHash: '',
  };
}

function toVcRecordFromDetail(server: ServerVcDetailResponse): VcRecord {
  const issuer = server.issuer ?? {};
  return {
    id: server.id,
    childId: '',
    childName: '',
    type: (server.type?.[1] as VcRecord['type']) ?? 'ASSESSMENT_RESULT',
    status: server.isRevoked ? 'REVOKED' : 'ACTIVE',
    issuedAt: server.issuanceDate,
    expirationDate: server.expirationDate ?? undefined,
    revokedAt: server.isRevoked ? server.issuanceDate : undefined,
    issuer: { id: (issuer.id as string) ?? '', name: (issuer.name as string) ?? '', role: 'MEDIC' },
    ipfsCid: server.ipfsCid ?? '',
    txHash: server.txHash ?? '',
    subject: server.credentialSubject
      ? { id: (server.credentialSubject.id as string) ?? '', name: '', ageMonths: (server.credentialSubject.ageMonths as number) ?? 0 }
      : undefined,
    claims: server.credentialSubject
      ? {
          weight: server.credentialSubject.weight as number | undefined,
          height: server.credentialSubject.height as number | undefined,
          status: server.credentialSubject.nutritionStatus as string | undefined,
          assessmentDate: server.issuanceDate,
        }
      : undefined,
  };
}

// ── Service ──────────────────────────────────────────────────────────────

export const vcService = {
  getVcStatus: async (childId: string): Promise<VcRecord | null> => {
    try {
      const res = await apiClient.get<ServerVcStatusResponse>(`/api/vc/child/${childId}`);
      return res.data.vc ? toVcRecordFromDetail(res.data.vc) : null;
    } catch { return null; }
  },

  getVcDetail: async (vcId: string): Promise<VcRecord | null> => {
    const res = await apiClient.get<ServerVcDetailResponse>(`/api/vc/${vcId}`);
    return toVcRecordFromDetail(res.data);
  },

  verifyVc: async (vcId: string): Promise<VcVerificationResult> => {
    try {
      const vc = await vcService.getVcDetail(vcId);
      if (!vc) return { isValid: false, vc: null, verifiedAt: new Date().toISOString(), message: 'VC tidak ditemukan' };
      return { isValid: vc.status === 'ACTIVE', vc, verifiedAt: new Date().toISOString(), message: 'Verifikasi berhasil' };
    } catch {
      return { isValid: false, vc: null, verifiedAt: new Date().toISOString(), message: 'Gagal verifikasi VC' };
    }
  },

  issueVc: async (request: VcIssueRequest): Promise<VcRecord> => {
    const serverReq = { childId: request.childId, vcType: request.vcType, expiresAt: request.expiresAt };
    const res = await apiClient.post<ServerIssueVcResponse>('/api/vc/issue', serverReq);
    return toVcRecordFromIssue(res.data);
  },

  revokeVc: async (request: VcRevokeRequest): Promise<void> => {
    await apiClient.post('/api/vc/revoke', { vcId: request.vcId });
  },
};
