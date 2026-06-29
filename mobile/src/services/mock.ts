import { randomHex } from '@/utils/random';
import type { AuthResponse, User } from '@/features/auth/types/auth.types';
import type { Child } from '@/features/children/types/child.types';
import type { AssessmentResponseDTO, AssessmentRequestDTO } from '@/features/assessment/types/assessment.types';
import type { NutritionLog, NutritionUploadRequest } from '@/features/nutrition/types/nutrition.types';
import type { VcRecord, VcIssueRequest } from '@/features/vc/types/vc.types';

export const USE_MOCK = false;

/** Simulates network latency */
export const delay = (ms = 600) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

type MockUser = User & { password: string };

let mockUsers: MockUser[] = [
  {
    id: 'user_001',
    email: 'orang.tua@email.com',
    password: 'password123',
    name: 'Budi Santoso',
    role: 'PARENT',
    walletAddress: null,
  },
  {
    id: 'user_medic_001',
    email: 'medic@example.com',
    password: 'password123',
    name: 'Dr. Siti Nurhaliza',
    role: 'MEDIC',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
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

let mockAssessments: AssessmentResponseDTO[] = [
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

let mockNutritionLogs: NutritionLog[] = [
  {
    id: 'log_001',
    childId: 'child_001',
    photoUrl: 'https://images.unsplash.com/photo-1547058886-f685c2c77d5b?q=80&w=240&auto=format&fit=crop',
    foodDetected: ['Bubur Beras Merah', 'Hati Ayam'],
    portionEstimate: 'Porsi Sedang (~150g)',
    calories: 120,
    protein: 4.5,
    fat: 3.2,
    carbs: 20.0,
    fiber: 1.5,
    adequacyNote: 'Cukup untuk makan pagi',
    mpasiRecommendation: 'Tambahkan sayur hijau di menu berikutnya',
    createdAt: '2026-06-08T08:30:00Z',
  },
  {
    id: 'log_002',
    childId: 'child_001',
    photoUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=240&auto=format&fit=crop',
    foodDetected: ['Potongan Pepaya'],
    portionEstimate: 'Porsi Kecil (~50g)',
    calories: 45,
    protein: 0.5,
    fat: 0.1,
    carbs: 11.0,
    fiber: 1.8,
    adequacyNote: 'Selingan buah yang baik',
    mpasiRecommendation: 'Lanjutkan pemberian buah segar',
    createdAt: '2026-06-08T10:45:00Z',
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

export const getMockNutritionLogs = () => [...mockNutritionLogs];

export const addMockNutritionLog = (req: NutritionUploadRequest): NutritionLog => {
  const samples = [
    {
      foodDetected: ['Nasi Tim Ayam', 'Brokoli'],
      portionEstimate: 'Porsi Sedang (~160g)',
      calories: 185,
      protein: 8.4,
      fat: 4.2,
      carbs: 28.0,
      fiber: 2.4,
      adequacyNote: 'Baik sebagai menu makan utama dengan protein hewani.',
      mpasiRecommendation: 'Tambahkan buah lunak sebagai selingan setelah 2 jam.',
    },
    {
      foodDetected: ['Puree Alpukat', 'Pisang'],
      portionEstimate: 'Porsi Kecil (~90g)',
      calories: 132,
      protein: 1.6,
      fat: 8.9,
      carbs: 13.4,
      fiber: 3.1,
      adequacyNote: 'Cukup sebagai selingan padat energi.',
      mpasiRecommendation: 'Lengkapi dengan lauk tinggi zat besi pada makan utama.',
    },
  ];
  const sample = samples[mockNutritionLogs.length % samples.length];
  const newLog: NutritionLog = {
    ...sample,
    id: `log_${Date.now()}`,
    childId: req.childId,
    photoUrl: req.photo.uri,
    createdAt: new Date().toISOString(),
  };
  mockNutritionLogs = [newLog, ...mockNutritionLogs];
  return newLog;
};

export const removeMockNutritionLog = (id: string) => {
  mockNutritionLogs = mockNutritionLogs.filter((log) => log.id !== id);
};

// ---------------------------------------------------------------------------
// Reports helpers
// ---------------------------------------------------------------------------

export const getMockReportUrl = (childId: string, from?: string, to?: string): string => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return `https://storage.tumbuhsehat.example/reports/${childId}_report.pdf${qs ? `?${qs}` : ''}`;
};

// ---------------------------------------------------------------------------
// Blockchain verification helpers
// ---------------------------------------------------------------------------

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

export const getMockBlockchainVerification = (
  assessmentId: string,
): BlockchainVerificationResult => {
  const assessment = mockAssessments.find((a) => a.id === assessmentId);
  if (!assessment || !assessment.blockchain.anchored) {
    return {
      assessmentId,
      isValid: false,
      recordHash: '',
      txHash: '',
      blockNumber: 0,
      anchorStatus: 'NOT_FOUND',
      explorerUrl: '',
      verifiedAt: new Date().toISOString(),
    };
  }
  return {
    assessmentId,
    isValid: true,
    recordHash: assessment.blockchain.recordHash,
    txHash: assessment.blockchain.txHash,
    blockNumber: assessment.blockchain.blockNumber,
    anchorStatus: assessment.blockchain.anchorStatus,
    explorerUrl: assessment.blockchain.explorerUrl,
    verifiedAt: new Date().toISOString(),
  };
};

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
      status: 'NORMAL', // Will be updated later
      predictionStatus: 'PENDING',
      zscoreWa: 0,
      zscoreHa: 0,
      zscoreWh: 0,
      riskLevel: 0,
      summary: '',
      recommendations: [],
      nextAssessmentDate: '',
      disclaimer: '',
    },
    blockchain: {
      id: anchorId,
      anchored: false,
      recordHash: '',
      txHash: '',
      blockNumber: 0,
      anchorStatus: 'PENDING',
      explorerUrl: '',
      verifyUrl: '',
    },
  };

  mockAssessments.push(newAssessment);

  // Simulate background processing for Prediction (takes 4 seconds)
  setTimeout(() => {
    const idx = mockAssessments.findIndex((a) => a.id === assessmentId);
    if (idx !== -1) {
      mockAssessments[idx] = {
        ...mockAssessments[idx],
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

      // Update latest child prediction status only after completion
      updateMockChild(req.childId, {
        latestPrediction: {
          status,
          createdAt: mockAssessments[idx].createdAt,
        },
      });
    }
  }, 4000);

  return newAssessment;
};
