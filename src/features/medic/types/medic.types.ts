export type PatientStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED' | 'ALL';

export type Patient = {
  childId: string;
  childName: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  ageMonths: number;
  parentName: string;
  lastStatus: string;
  lastAssessmentDate: string;
  activeVcId?: string;
  vcStatus?: string;
};

export type PatientSearchFilter = {
  search: string;
  status: PatientStatus;
};

// Based on /api/medic/patients mapping
export type PaginatedPatients = {
  data: Patient[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type IssueVcPayload = {
  childId: string;
  vcType: string;
  expiresAt?: string;
};

export type RevokeVcPayload = {
  vcId: string;
};
