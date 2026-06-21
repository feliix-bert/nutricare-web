import { apiClient } from '@/services/api';
import { delay, getMockAssessments, USE_MOCK } from '@/services/mock';
import type {
  ChatApiRequest,
  ChatApiResponse,
  ChatHistoryResponse,
  ChatMessage,
  ChatRouteRequest,
  ChatRouteResponse,
  PredictionContext,
} from '@/features/consult/types/consult.types';

// ---------------------------------------------------------------------------
// In-memory mock chat store
// ---------------------------------------------------------------------------

type MockSession = {
  sessionId: string;
  predictionId: string;
  messages: ChatMessage[];
  updatedAt: string;
};

const mockSessions: MockSession[] = [];

function findOrCreateSession(predictionId: string): MockSession {
  let session = mockSessions.find((s) => s.predictionId === predictionId);
  if (!session) {
    session = {
      sessionId: `session_${Date.now()}`,
      predictionId,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    mockSessions.push(session);
  }
  return session;
}

// ---------------------------------------------------------------------------
// Mock: kirim pesan via Next.js Route Handler → Gemini
// ---------------------------------------------------------------------------

const mockSendMessage = async (
  payload: ChatApiRequest & { context: PredictionContext },
): Promise<ChatApiResponse> => {
  await delay(800);

  const session = findOrCreateSession(payload.predictionId);

  // Ambil history untuk dikirim ke Route Handler
  const history = session.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const routePayload: ChatRouteRequest = {
    message: payload.message,
    history,
    context: payload.context,
  };

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(routePayload),
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      errData.error ?? 'Layanan AI sedang tidak tersedia. Silakan coba lagi.',
    );
  }

  const data = (await res.json()) as ChatRouteResponse;

  // Simpan ke session mock
  const userMsg: ChatMessage = {
    id: `msg_user_${Date.now()}`,
    role: 'user',
    content: payload.message,
    timestamp: new Date().toISOString(),
  };
  const aiMsg: ChatMessage = {
    id: `msg_ai_${Date.now()}`,
    role: 'assistant',
    content: data.reply,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(userMsg, aiMsg);
  session.updatedAt = new Date().toISOString();

  return {
    sessionId: session.sessionId,
    reply: data.reply,
    suggestedQuestions: data.suggestedQuestions,
  };
};

// ---------------------------------------------------------------------------
// Mock: ambil riwayat chat
// ---------------------------------------------------------------------------

const mockGetHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  await delay(400);
  const session = findOrCreateSession(predictionId);
  return {
    sessionId: session.sessionId,
    predictionId: session.predictionId,
    messages: session.messages,
    updatedAt: session.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// Helper: bangun PredictionContext dari assessment mock
// ---------------------------------------------------------------------------

export function buildContextFromPredictionId(predictionId: string): PredictionContext | null {
  const assessments = getMockAssessments();
  const found = assessments.find((a) => a.prediction.id === predictionId);
  if (!found) return null;

  return {
    predictionId: found.prediction.id,
    childName: found.child.name,
    ageMonths: found.child.ageMonths,
    gender: 'MALE', // default — real API akan return ini dari child data
    status: found.prediction.status,
    zscoreHa: found.prediction.zscoreHa,
    zscoreWa: found.prediction.zscoreWa,
    zscoreWh: found.prediction.zscoreWh,
    summary: found.prediction.summary,
    recommendations: found.prediction.recommendations,
  };
}

// ---------------------------------------------------------------------------
// Real: kirim pesan ke Spring Boot API
// ---------------------------------------------------------------------------

const realSendMessage = async (payload: ChatApiRequest & { context?: PredictionContext }): Promise<ChatApiResponse> => {
  const res = await apiClient.post<ChatApiResponse>('/api/chat', {
    predictionId: payload.predictionId,
    message: payload.message,
  });
  return res.data;
};

// ---------------------------------------------------------------------------
// Real: ambil riwayat chat dari Spring Boot API
// ---------------------------------------------------------------------------

const realGetHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  const res = await apiClient.get<ChatHistoryResponse>(`/api/chat/${predictionId}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const chatService = {
  sendMessage: USE_MOCK ? mockSendMessage : realSendMessage,
  getHistory: USE_MOCK ? mockGetHistory : realGetHistory,
};
