import { randomHex } from '@/utils/random';
import type { AuthResponse, User } from '@/features/auth/types/auth.types';
import type { Child } from '@/features/children/types/child.types';
import type { AssessmentResponseDTO, AssessmentRequestDTO } from '@/features/assessment/types/assessment.types';

export const USE_MOCK = true;

/** Simulates network latency */
export const delay = (ms = 600) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

type MockUser = User & { password: string };

const mockUsers: MockUser[] = [
  {
    id: 'user_001',
    email: 'orang.tua@email.com',
    password: 'password123',
    name: 'Budi Santoso',
    role: 'PARENT',
    walletAddress: null,
  },
];

let mockChildren: Child[] = [
  {
    id: 'child_001',
    name: 'Andi Santoso',
    birthDate: '2023-01-15',
    gender: 'MALE',
    ageMonths: 18,
    latestPrediction: { status: 'AT_RISK', createdAt: '2025-07-01T00:00:00Z' },
  },
  {
    id: 'child_002',
    name: 'Sari Dewi',
    birthDate: '2024-03-10',
    gender: 'FEMALE',
    ageMonths: 6,
    latestPrediction: { status: 'NORMAL', createdAt: '2025-07-10T00:00:00Z' },
  },
];

const mockAssessments: AssessmentResponseDTO[] = [
  {
    id: 'clx_assessment_001',
    child: {
      id: 'child_001',
      name: 'Andi Santoso',
      ageMonths: 18,
    },
    weight: 9.5,
    height: 74.0,
    headCircumference: 45.5,
    bfExclusive: true,
    mpasiAge: 6,
    mealFreq: 3,
    illnessHistory: 'Diare 2 kali dalam 3 bulan terakhir',
    createdAt: '2025-07-01T10:00:00Z',
    prediction: {
      id: 'clx_pred_001',
      status: 'AT_RISK',
      predictionStatus: 'COMPLETED',
      zscoreWa: -1.8,
      zscoreHa: -2.1,
      zscoreWh: -1.2,
      riskLevel: 2,
      summary: 'Tinggi badan Andi berada di bawah -2 SD dari median WHO.',
      recommendations: [
        'Tingkatkan frekuensi makan menjadi 5–6 kali sehari',
        'Berikan makanan padat gizi: telur, tempe, sayuran hijau',
        'Konsultasi dengan dokter anak dalam 2 minggu',
      ],
      nextAssessmentDate: '2025-10-01',
      disclaimer: 'Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.',
    },
    blockchain: {
      id: 'clx_anchor_001',
      anchored: true,
      recordHash: '0x8fa4b7ee87a41205489c5d3a1f9e2b0a3c7f12e8',
      txHash: '0x8fa4b7ee87a41205489c5d3a1f9e2b0a3c7f12e8',
      blockNumber: 1205489,
      anchorStatus: 'CONFIRMED',
      explorerUrl: 'https://polygonscan.com/tx/0x8fa4b7ee87a41205489c5d3a1f9e2b0a3c7f12e8',
      verifyUrl: '/api/blockchain/verify/clx_assessment_001',
    },
  },
  {
    id: 'clx_assessment_002',
    child: {
      id: 'child_002',
      name: 'Sari Dewi',
      ageMonths: 6,
    },
    weight: 7.1,
    height: 65.0,
    headCircumference: 42.0,
    bfExclusive: true,
    mpasiAge: 6,
    mealFreq: 2,
    illnessHistory: 'Tidak ada riwayat sakit berat',
    createdAt: '2025-07-10T09:12:00Z',
    prediction: {
      id: 'clx_pred_002',
      status: 'NORMAL',
      predictionStatus: 'COMPLETED',
      zscoreWa: -0.5,
      zscoreHa: -0.8,
      zscoreWh: -0.2,
      riskLevel: 0,
      summary: 'Pertumbuhan anak tergolong baik dan normal.',
      recommendations: [
        'Pertahankan pemberian ASI eksklusif dan MPASI tepat waktu',
        'Lanjutkan pantauan berat dan tinggi badan secara berkala',
      ],
      nextAssessmentDate: '2025-10-10',
      disclaimer: 'Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.',
    },
    blockchain: {
      id: 'clx_anchor_002',
      anchored: true,
      recordHash: '0x3ab2c5ff1206124e8d9a4b0c7f1206124e8d9a4b0',
      txHash: '0x3ab2c5ff1206124e8d9a4b0c7f1206124e8d9a4b0',
      blockNumber: 1206124,
      anchorStatus: 'CONFIRMED',
      explorerUrl: 'https://polygonscan.com/tx/0x3ab2c5ff1206124e8d9a4b0c7f1206124e8d9a4b0',
      verifyUrl: '/api/blockchain/verify/clx_assessment_002',
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fake token — just base64 JSON, NOT a real JWT */
export const makeFakeToken = (payload: object, prefix = 'access') =>
  `${prefix}.${btoa(JSON.stringify(payload))}.fakesig`;

export const findUserByEmail = (email: string) =>
  mockUsers.find((u) => u.email === email);

export const addMockUser = (user: MockUser) => {
  mockUsers.push(user);
};

export const getMockChildren = () => [...mockChildren];

export const addMockChild = (child: Child) => {
  mockChildren.push(child);
};

export const updateMockChild = (id: string, updates: Partial<Child>) => {
  mockChildren = mockChildren.map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  return mockChildren.find((c) => c.id === id);
};

export const buildMockAuthResponse = (user: User): AuthResponse => ({
  accessToken: makeFakeToken({ sub: user.id, role: user.role, exp: Date.now() + 86400000 }),
  refreshToken: makeFakeToken({ sub: user.id }, 'refresh'),
  user,
});

export const getMockAssessments = () => [...mockAssessments];

export const addMockAssessment = (req: AssessmentRequestDTO): AssessmentResponseDTO => {
  const child = mockChildren.find((c) => c.id === req.childId);
  const childName = child ? child.name : 'Anak Tiruan';
  const ageMonths = child ? child.ageMonths : 12;

  // Generate false prediction statuses (palsu / fake calculation as requested)
  const status = req.height < 60 ? 'SEVERELY_STUNTED' : req.height < 75 ? 'STUNTED' : req.height < 85 ? 'AT_RISK' : 'NORMAL';
  const riskLevel = status === 'NORMAL' ? 0 : status === 'AT_RISK' ? 1 : status === 'STUNTED' ? 2 : 3;

  const assessmentId = `clx_assessment_${Date.now()}`;
  const predId = `clx_pred_${Date.now()}`;
  const anchorId = `clx_anchor_${Date.now()}`;

  const txHash = `0x${randomHex()}${randomHex()}${randomHex()}${randomHex()}`.substring(0, 42);

  const newAssessment: AssessmentResponseDTO = {
    id: assessmentId,
    child: {
      id: req.childId,
      name: childName,
      ageMonths,
    },
    weight: req.weight,
    height: req.height,
    headCircumference: req.headCircumference,
    bfExclusive: req.bfExclusive,
    mpasiAge: req.mpasiAge,
    mealFreq: req.mealFreq,
    illnessHistory: req.illnessHistory || 'Tidak ada riwayat sakit',
    createdAt: new Date().toISOString(),
    prediction: {
      id: predId,
      status,
      predictionStatus: 'COMPLETED',
      zscoreWa: status === 'NORMAL' ? -0.2 : status === 'AT_RISK' ? -1.8 : status === 'STUNTED' ? -2.5 : -3.2,
      zscoreHa: status === 'NORMAL' ? -0.4 : status === 'AT_RISK' ? -2.2 : status === 'STUNTED' ? -2.8 : -3.6,
      zscoreWh: status === 'NORMAL' ? -0.1 : status === 'AT_RISK' ? -1.1 : status === 'STUNTED' ? -1.9 : -2.4,
      riskLevel,
      summary: `Hasil skrining tiruan menunjukkan anak tergolong ${status}.`,
      recommendations: [
        'Konsultasikan dengan dokter spesialis anak terdekat.',
        'Pastikan pemenuhan gizi protein hewani harian.',
        'Pantau lingkar kepala dan panjang badan setiap bulan.',
      ],
      nextAssessmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      disclaimer: 'Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.',
    },
    blockchain: {
      id: anchorId,
      anchored: true,
      recordHash: txHash,
      txHash: txHash,
      blockNumber: 1206000 + Math.floor(Math.random() * 5000),
      anchorStatus: 'CONFIRMED',
      explorerUrl: `https://polygonscan.com/tx/${txHash}`,
      verifyUrl: `/api/blockchain/verify/${assessmentId}`,
    },
  };

  mockAssessments.push(newAssessment);

  // Update latest child prediction status
  updateMockChild(req.childId, {
    latestPrediction: {
      status,
      createdAt: newAssessment.createdAt,
    },
  });

  return newAssessment;
};
