import { StuntStatus } from "@/features/children/types/child.types";

// ── Server raw response types (PredictionResponse) ────────────────────────

export type ServerBlockchainInfo = {
  anchorStatus: string;
  txHash: string;
  polygonscanUrl: string;
  isVerified: boolean;
};

export type ServerPredictionResponse = {
  id: string;
  assessmentId: string;
  childId: string;
  childName: string;
  status: StuntStatus;
  predictionStatus: "COMPLETED" | "PENDING" | "FAILED";
  riskLevel: number;
  statusLabel: string;
  statusColor: string;
  zscoreWa: number;
  zscoreHa: number;
  zscoreWh: number;
  summary: string;
  recommendations: string[];
  nextAssessmentDate: string;
  disclaimer: string;
  blockchain: ServerBlockchainInfo | null;
  createdAt: string;
};

// ── Mobile DTOs (nested, richer) ─────────────────────────────────────────

export type AssessmentPredictionDTO = {
  id: string;
  status: StuntStatus;
  predictionStatus: "COMPLETED" | "PENDING" | "FAILED";
  zscoreWa: number;
  zscoreHa: number;
  zscoreWh: number;
  riskLevel: number;
  summary: string;
  recommendations: string[];
  nextAssessmentDate: string;
  disclaimer: string;
};

export type BlockchainAnchorDTO = {
  id: string;
  anchored: boolean;
  recordHash: string;
  txHash: string;
  blockNumber: number;
  anchorStatus: "CONFIRMED" | "PENDING";
  explorerUrl: string;
  verifyUrl: string;
};

export type AssessmentResponseDTO = {
  id: string;
  child: {
    id: string;
    name: string;
    ageMonths?: number;
  };
  weight?: number;
  height?: number;
  headCircumference?: number;
  bfExclusive?: boolean;
  mpasiAge?: number;
  mealFreq?: number;
  illnessHistory?: string;
  createdAt: string;
  prediction: AssessmentPredictionDTO;
  blockchain?: BlockchainAnchorDTO;
};

export type AssessmentRequestDTO = {
  childId: string;
  weight: number;
  height: number;
  headCircumference: number;
  bfExclusive: boolean;
  mpasiAge: number;
  mealFreq: number;
  illnessHistory: string;
};
