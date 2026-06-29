import { apiClient } from '@/services/api';
import { delay, USE_MOCK } from '@/services/mock';
import type {
  VcRecord,
  VcIssueRequest,
  VcRevokeRequest,
  VcVerificationResult,
  ServerIssueVcResponse,
  ServerVcDetailResponse,
  ServerVcStatusResponse,
} from '../types/vc.types';

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

const vcRecords: Record<string, VcRecord> = {
  'vc_001': {
    id: 'vc_001', childId: 'child_001', childName: 'Andi Santoso', type: 'ASSESSMENT_RESULT',
    status: 'ACTIVE', issuedAt: '2024-01-15T10:30:00Z', issuanceDate: '2024-01-15',
    issuer: { id: 'user_medic_001', name: 'Dr. Siti Nurhaliza', role: 'MEDIC' },
    ipfsCid: 'QmX4j...abc123', txHash: '0x1a2b3c...def456',
    subject: { id: 'child_001', name: 'Andi Santoso', ageMonths: 18 },
    claims: { weight: 9.5, height: 75, status: 'NORMAL', assessmentDate: '2024-01-15' },
  },
};

// ── Service ──────────────────────────────────────────────────────────────

export const vcService = {
  getVcStatus: async (childId: string): Promise<VcRecord | null> => {
    if (USE_MOCK) {
      await delay(400);
      return Object.values(vcRecords).find(v => v.childId === childId && v.status === 'ACTIVE') || null;
    }
    try {
      const res = await apiClient.get<ServerVcStatusResponse>(`/api/vc/child/${childId}`);
      return res.data.vc ? toVcRecordFromDetail(res.data.vc) : null;
    } catch { return null; }
  },

  getVcDetail: async (vcId: string): Promise<VcRecord | null> => {
    if (USE_MOCK) {
      await delay(350);
      return vcRecords[vcId] || null;
    }
    const res = await apiClient.get<ServerVcDetailResponse>(`/api/vc/${vcId}`);
    return toVcRecordFromDetail(res.data);
  },

  verifyVc: async (vcId: string): Promise<VcVerificationResult> => {
    if (USE_MOCK) {
      await delay(350);
      const vc = vcRecords[vcId];
      if (!vc) return { isValid: false, vc: null, verifiedAt: new Date().toISOString(), message: 'VC tidak ditemukan' };
      return { isValid: vc.status === 'ACTIVE', vc, verifiedAt: new Date().toISOString(), message: 'Verifikasi berhasil' };
    }
    try {
      const vc = await vcService.getVcDetail(vcId);
      if (!vc) return { isValid: false, vc: null, verifiedAt: new Date().toISOString(), message: 'VC tidak ditemukan' };
      return { isValid: vc.status === 'ACTIVE', vc, verifiedAt: new Date().toISOString(), message: 'Verifikasi berhasil' };
    } catch {
      return { isValid: false, vc: null, verifiedAt: new Date().toISOString(), message: 'Gagal verifikasi VC' };
    }
  },

  issueVc: async (request: VcIssueRequest): Promise<VcRecord> => {
    if (USE_MOCK) {
      await delay(600);
      const newVc: VcRecord = {
        id: `vc_${Date.now()}`, childId: request.childId, childName: 'Anak', type: request.vcType,
        status: 'ACTIVE', issuedAt: new Date().toISOString(), issuanceDate: new Date().toISOString().split('T')[0],
        issuer: { id: 'user_medic_001', name: 'Dr. Siti', role: 'MEDIC' },
        ipfsCid: 'Qm...', txHash: '0x...',
      };
      vcRecords[newVc.id] = newVc;
      return newVc;
    }
    const serverReq = { childId: request.childId, vcType: request.vcType, expiresAt: request.expiresAt };
    const res = await apiClient.post<ServerIssueVcResponse>('/api/vc/issue', serverReq);
    return toVcRecordFromIssue(res.data);
  },

  revokeVc: async (request: VcRevokeRequest): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      if (vcRecords[request.vcId]) {
        vcRecords[request.vcId].status = 'REVOKED';
        vcRecords[request.vcId].revokedAt = new Date().toISOString();
      }
      return;
    }
    await apiClient.post('/api/vc/revoke', { vcId: request.vcId });
  },
};
