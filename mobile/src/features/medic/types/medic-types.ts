export type Patient = {
  childId: string;
  childName: string;
  childAgeMonths: number;
  lastAssessmentDate?: string;
  lastStatus?: 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';
  hasActiveVc: boolean;
  activeVcId?: string;
  parentId: string;
  parentName: string;
};

export type PatientStatus = 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED' | 'ALL';

export type PatientSearchFilter = {
  search: string;
  status: PatientStatus;
};

export type PatientListItem = Patient;

export type { Conversation } from '@/types/conversation-types';

export type MedicDashboardData = {
  totalPatients: number;
  pendingVcCount: number;
  recentAssessments: number;
};
