// ---------------------------------------------------------------------------
// Tipe data untuk fitur Chatbot Konsultasi AI
// Sesuai dengan API.md — POST /api/chat & GET /api/chat/{predictionId}
// ---------------------------------------------------------------------------

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
};

/** Konteks prediksi yang dikirim ke AI agar jawaban relevan */
export type PredictionContext = {
  predictionId: string;
  childName: string;
  ageMonths: number;
  gender: 'MALE' | 'FEMALE';
  status: 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';
  zscoreHa: number;  // TB/U
  zscoreWa: number;  // BB/U
  zscoreWh: number;  // BB/TB
  summary: string;
  recommendations: string[];
};

/** Request ke Next.js Route Handler /api/chat */
export type ChatRouteRequest = {
  message: string;
  history: Array<{ role: ChatRole; content: string }>;
  context: PredictionContext;
};

/** Response dari Next.js Route Handler /api/chat */
export type ChatRouteResponse = {
  reply: string;
  suggestedQuestions: string[];
};

/** Request ke Spring Boot API (untuk nanti, saat backend aktif) */
export type ChatApiRequest = {
  predictionId: string;
  message: string;
};

/** Response dari Spring Boot API */
export type ChatApiResponse = {
  sessionId: string;
  reply: string;
  suggestedQuestions: string[];
};

/** Riwayat chat dari Spring Boot API */
export type ChatHistoryResponse = {
  sessionId: string;
  predictionId: string;
  messages: ChatMessage[];
  updatedAt: string;
};
